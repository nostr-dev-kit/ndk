import NDK, {
    NDKCashuMintList,
    NDKEvent,
    type NDKEventId,
    NDKFilter,
    NDKKind,
    NDKNutzap,
    NDKRelaySet,
    NDKSubscription,
    NDKSubscriptionCacheUsage,
    NDKUser,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { NDKCashuWallet } from "../wallets/cashu/wallet/index.js";

enum PROCESSING_STATUS {
    initial = 1,
    processing = 2,
    processed = 3,
    failed = 4,
    seen = 5,
}

/**
 * This class monitors a user's nutzap inbox relays
 * for new nutzaps and processes them.
 */
export class NDKNutzapMonitor extends EventEmitter<{
    /**
     * Emitted when a new nutzap is successfully redeemed
     */
    redeem: (event: NDKNutzap, amount: number) => void;

    /**
     * Emitted when a nutzap was already spent
     */
    spent: (event: NDKNutzap) => void;

    /**
     * Emitted when a nutzap has been seen
     */
    seen: (event: NDKNutzap) => void;

    /**
     * Emitted when a nutzap has failed to be redeemed
     */
    failed: (event: NDKNutzap, error: string) => void;

    /**
     * Emitted when a nutzap has been redeemed or failed to be redeemed
     */
    completed: (event: NDKNutzap, status: "success" | "failed") => void;
}> {
    public ndk: NDK;
    private user: NDKUser;
    public relaySet?: NDKRelaySet;
    private sub?: NDKSubscription;
    private knownTokens = new Map<NDKEventId, PROCESSING_STATUS>();
    public wallet?: NDKCashuWallet;

    /**
     * Create a new nutzap monitor.
     * @param ndk - The NDK instance.
     * @param user - The user to monitor.
     * @param relaySet - An optional relay set to monitor zaps on, if one is not provided, the monitor will use the relay set from the mint list, which is the correct default behavior of NIP-61 zaps.
     */
    constructor(ndk: NDK, user: NDKUser, relaySet?: NDKRelaySet) {
        super();
        this.ndk = ndk;
        this.user = user;
        this.relaySet = relaySet;
    }

    /**
     * Start the nutzap monitor. The monitor will initially look back
     * for nutzaps it doesn't know about and will try to redeem them.
     * 
     * @param knownNutzaps - An optional set of nutzaps the app knows about. This is an optimization so that we don't try to redeem nutzaps we know have already been redeemed.
     * @param pageSize - The number of nutzaps to fetch per page.
     * 
     */
    public async start(
        mintList?: NDKCashuMintList,
        initialSyncOpts: {
            knownNutzaps: Set<NDKEventId>,
            pageSize: number,
        } = {
            knownNutzaps: new Set(),
            pageSize: 5,
        }
    ) {
        const authors = [this.user.pubkey];
        // if we are already running, stop the current subscription
        if (this.sub) this.sub.stop();

        if (initialSyncOpts.knownNutzaps.size > 0) {
            for (const id of initialSyncOpts.knownNutzaps) {
                this.knownTokens.set(id, PROCESSING_STATUS.seen);
            }
        }
        
        // if we don't have a mint list, we need to get one
        if (!mintList) {
            const list = await this.ndk.fetchEvent([
                { kinds: [NDKKind.CashuMintList], authors },
            ], { groupable: false, closeOnEose: true });
            if (!list) return false;
    
            mintList = NDKCashuMintList.from(list);
        }

        // set the relay set
        this.relaySet = mintList.relaySet;

        await this.processNutzaps(initialSyncOpts.knownNutzaps, initialSyncOpts.pageSize);
        this.sub = this.ndk.subscribe(
            { kinds: [NDKKind.Nutzap], "#p": [this.user.pubkey], limit: 0 },
            {
                subId: "ndk-wallet:nutzap-monitor",
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
            },
            this.relaySet,
            {
                onEvent: (event) => this.eventHandler(event),
            }
        );

        return true;
    }

    /**
     * Processes nutzaps with paging. When stopAfterSpentTokenCount tokens in a row are seent as spent, the process stops.
     * @param knownNutzaps 
     * @param pageSize 
     * @param until 
     * @param stopAfterSpentTokenCount 
     */
    public async processNutzaps(
        knownNutzaps: Set<NDKEventId>,
        pageSize: number,
        until: number = 9999999999999,
        stopAfterSpentTokenCount = 4
    ) {
        let processedCount = 0;
        const filter: NDKFilter = { kinds: [NDKKind.Nutzap], "#p": [this.user.pubkey], limit: pageSize, until };
        const events = await this.ndk.fetchEvents(filter, {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
            groupable: false,
            subId: 'recent-nutzap',
        }, this.relaySet)

        let spentTokenCount = 0;

        for (const event of events) {
            if (knownNutzaps.has(event.id)) continue;

            const nutzap = NDKNutzap.from(event);
            if (!nutzap) continue;
            if (nutzap.created_at! < until)
                until = nutzap.created_at! - 1;

            const result = await this.redeem(nutzap);
            if (result) {
                processedCount++;
                spentTokenCount = 0;
            } else if (result === false) {
                this.emit("spent", nutzap);
                spentTokenCount++;
            }

            if (spentTokenCount >= stopAfterSpentTokenCount) return;

            // We wait some time between each nutzap redemption
            // to avoid triggereing a rate limit on the mints
            await sleep(2500);
        }

        // if we found a new nutzap we were able to process, fetch the next page
        if (processedCount > 0)
            await this.processNutzaps(knownNutzaps, pageSize, until-1);
    }

    public stop() {
        this.sub?.stop();
    }

    private async eventHandler(event: NDKEvent) {
        if (this.knownTokens.has(event.id)) return;
        this.knownTokens.set(event.id, PROCESSING_STATUS.initial);
        const nutzapEvent = await NDKNutzap.from(event);
        if (!nutzapEvent) return;
        this.redeem(nutzapEvent);
    }

    private async redeem(nutzap: NDKNutzap) {
        this.emit("seen", nutzap);
        
        if (!this.wallet) throw new Error("wallet not set");

        const currentStatus = this.knownTokens.get(nutzap.id);
        if (currentStatus && currentStatus > PROCESSING_STATUS.initial) {
            return;
        }
        this.knownTokens.set(nutzap.id, PROCESSING_STATUS.processing);

        try {
            const res = await this.wallet.redeemNutzap(
                nutzap,
                {
                    onRedeemed: (res) => {
                        const amount = res.reduce((acc, proof) => acc + proof.amount, 0);
                        this.emit("redeem", nutzap, amount);
                    },

                }
            );

            if (res === false)
                return false;
        } catch (e: any) {
            this.emit("failed", nutzap, e.message);
        }
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}