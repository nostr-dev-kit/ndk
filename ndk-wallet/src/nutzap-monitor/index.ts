import NDK, {
    NDKCashuMintList,
    NDKEvent,
    type NDKEventId,
    NDKKind,
    NDKNutzap,
    NDKPrivateKeySigner,
    NDKRelaySet,
    NDKSubscription,
    NDKSubscriptionCacheUsage,
    NDKUser,
    normalizeUrl,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import createDebug from "debug";
import { NDKCashuWallet } from "../wallets/cashu/wallet/index.js";
import { Proof } from "@cashu/cashu-ts";

const d = createDebug("ndk-wallet:nutzap-monitor");

enum PROCESSING_STATUS {
    initial = 1,
    processing = 2,
    processed = 3,
    failed = 4,
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
     * Emitted when a nutzap has been seen
     */
    seen: (event: NDKNutzap) => void;

    /**
     * Emitted when a nutzap has failed to be redeemed
     */
    failed: (event: NDKNutzap, error: string) => void;
}> {
    private ndk: NDK;
    private user: NDKUser;
    public relaySet?: NDKRelaySet;
    private sub?: NDKSubscription;
    private eosed = false;
    private redeemQueue = new Map<NDKEventId, NDKNutzap>();
    private knownTokens = new Map<NDKEventId, PROCESSING_STATUS>();

    /**
     * Known wallets. This is necessary to be able to find the private key
     * that is needed to redeem the nutzap.
     */
    private walletByP2pk = new Map<string, NDKCashuWallet>();
    private allWallets: NDKCashuWallet[] = [];

    addWallet(wallet: NDKCashuWallet) {
        const p2pk = wallet.p2pk;
        if (p2pk) {
            d("adding wallet with p2pk %o", p2pk);
            this.walletByP2pk.set(p2pk, wallet);
        }

        this.allWallets.push(wallet);
    }

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
     * Start the monitor.
     */
    public async start(mintList?: NDKCashuMintList) {
        const authors = [this.user.pubkey];
        // if we are already running, stop the current subscription
        if (this.sub) {
            this.sub.stop();
        }
        
        // if we don't have a mint list, we need to get one
        if (!mintList) {
            const list = await this.ndk.fetchEvent([
                { kinds: [NDKKind.CashuMintList], authors },
            ], { groupable: false, closeOnEose: true });
            if (!list) return false;
    
            mintList = NDKCashuMintList.from(list);
        }

        // get the most recent token even
        let wallet: NDKCashuWallet | undefined;
        let since: number | undefined;

        if (mintList?.p2pk) {
            wallet = this.walletByP2pk.get(mintList.p2pk)
            const mostRecentToken = await this.ndk.fetchEvent([
                { kinds: [NDKKind.CashuToken], authors, limit: 1 },
            ], { closeOnEose: true, groupable: false }, wallet?.relaySet)
            if (mostRecentToken) since = mostRecentToken.created_at!;
        }

        // set the relay set
        this.relaySet = mintList.relaySet;

        if (!this.relaySet) {
            d("no relay set provided");
            throw new Error("no relay set provided");
        }

        console.log('starting nutzap monitor with', { since })
        
        this.sub = this.ndk.subscribe(
            { kinds: [NDKKind.Nutzap], "#p": [this.user.pubkey], since },
            {
                subId: "ndk-wallet:nutzap-monitor",
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
            },
            this.relaySet,
            false
        );

        this.sub.on("event", this.eventHandler.bind(this));
        this.sub.on("eose", this.eoseHandler.bind(this));
        this.sub.start();

        return true;
    }

    public stop() {
        this.sub?.stop();
    }

    private eoseHandler() {
        this.eosed = true;

        this.redeemQueue.forEach(nutzap => {
            this.redeem(nutzap);
        });
    }

    private async eventHandler(event: NDKEvent) {
        console.log('nutzap event', event.id);
        if (this.knownTokens.has(event.id)) return;
        this.knownTokens.set(event.id, PROCESSING_STATUS.initial);
        const nutzapEvent = await NDKNutzap.from(event);
        if (!nutzapEvent) return;
        this.emit("seen", nutzapEvent);

        if (!this.eosed) {
            this.pushToRedeemQueue(nutzapEvent);
        } else {
            this.redeem(nutzapEvent);
        }
    }

    private pushToRedeemQueue(event: NDKEvent) {
        if (this.redeemQueue.has(event.id)) return;

        const nutzap = NDKNutzap.from(event);
        if (!nutzap) return;
        this.redeemQueue.set(nutzap.id, nutzap);
    }

    private async redeem(nutzap: NDKNutzap) {
        d("nutzap seen %s", nutzap.id.substring(0, 6));
        
        const currentStatus = this.knownTokens.get(nutzap.id);
        if (!currentStatus || currentStatus > PROCESSING_STATUS.initial) return;
        this.knownTokens.set(nutzap.id, PROCESSING_STATUS.processing);

        try {
            const { proofs, mint } = nutzap;
            d('nutzap has %d proofs: %o', proofs.length, proofs);

            let wallet: NDKCashuWallet | undefined;

            wallet = this.findWalletForNutzap(nutzap);
            if (!wallet) throw new Error("wallet not found for nutzap");

            await wallet.redeemNutzap(
                nutzap,
                {
                    onRedeemed: (res) => {
                        const amount = res.reduce((acc, proof) => acc + proof.amount, 0);
                        this.emit("redeem", nutzap, amount);
                    }
                }
            );
        } catch (e: any) {
            console.trace(e);
            this.emit("failed", nutzap, e.message);
        }
    }

    private findWalletForNutzap(nutzap: NDKNutzap): NDKCashuWallet | undefined {
        const {p2pk, mint} = nutzap;
        let wallet: NDKCashuWallet | undefined;

        if (p2pk) wallet = this.walletByP2pk.get(p2pk);
        wallet ??= this.walletByP2pk.values().next().value;

        if (!wallet) {
            // find the wallet that has one of these mints
            const normalizedMint = normalizeUrl(mint);
            wallet = this.allWallets.find(w => w.mints
                .map(normalizeUrl)
                .includes(normalizedMint));

            if (!wallet) throw new Error("wallet not found for nutzap (mint: " + normalizedMint + ")");
        }

        return wallet;
    }
}

/**
 * Compute the balance difference between two sets of proofs
 * @param set1 - The first set of proofs
 * @param set2 - The second set of proofs
 * @returns The balance difference
 */
function computeBalanceDifference(set1: Array<Proof>, set2: Array<Proof>) {
    const amount1 = set1.reduce((acc, proof) => acc + proof.amount, 0);
    const amount2 = set2.reduce((acc, proof) => acc + proof.amount, 0);

    const diff = amount1 - amount2;

    return diff;
}