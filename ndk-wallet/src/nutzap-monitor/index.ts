import NDK, {
    NDKCashuMintList,
    NDKEvent,
    type NDKEventId,
    NDKFilter,
    NDKKind,
    NDKNutzap,
    NDKPrivateKeySigner,
    NDKRelaySet,
    NDKSubscription,
    NDKSubscriptionCacheUsage,
    NDKUser,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { NDKCashuWallet } from "../wallets/cashu/wallet/index.js";
import { NDKWallet } from "../wallets/index.js";
import { fetchPage } from "./fetch-page.js";
import { groupNutzaps } from "./group-nutzaps.js";
import { MintKeys, Proof, CheckStateEnum } from "@cashu/cashu-ts";
import { GetInfoResponse } from "@cashu/cashu-ts";
import { getProofSpendState } from "./spend-status.js";
import { walletForMint } from "../wallets/cashu/mint.js";

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
     * Emitted when a nutzap is seen minted in a mint
     * not specified in the user's mint list event.
     */
    seen_in_unknown_mint: (event: NDKNutzap) => void;
    
    /**
     * Emitted when a new nutzap is successfully redeemed
     */
    redeem: (events: NDKNutzap[], amount: number) => void;

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
    completed: (events: NDKNutzap[], status: "success" | "failed") => void;
}> {
    public ndk: NDK;
    private user: NDKUser;
    public relaySet?: NDKRelaySet;
    private sub?: NDKSubscription;
    private knownTokens = new Map<NDKEventId, PROCESSING_STATUS>();
    private _wallet?: NDKWallet;
    public mintList?: NDKCashuMintList;

    public privkeys = new Map<string, NDKPrivateKeySigner>();

    /**
     * Called when we need to load mint info. Use this
     * to load mint info from a database or other source.
     * 
     * Note that when providing a wallet that is of type NDKCashuWallet,
     * this parameter will be automatically inherited.
     */
    public onMintInfoNeeded?: (mint: string) => Promise<GetInfoResponse | undefined>;

    /**
     * Called when we have loaded mint info. If passing a NDKCashuWallet,
     * this parameter will be automatically inherited.
     */
    public onMintInfoLoaded?: (mint: string, info: GetInfoResponse) => void;

    /**
     * Called when we need to load mint keys. Use this
     * to load mint keys from a database or other source.
     * 
     * Note that when providing a wallet that is of type NDKCashuWallet,
     * this parameter will be automatically inherited.
     */
    public onMintKeysNeeded?: (mint: string) => Promise<MintKeys[] | undefined>;

    /**
     * Called when we have loaded mint keys. If passing a NDKCashuWallet,
     * this parameter will be automatically inherited.
     */
    public onMintKeysLoaded?: (mint: string, keysets: Map<string, MintKeys>) => void;

    /**
     * Create a new nutzap monitor.
     * @param ndk - The NDK instance.
     * @param user - The user to monitor.
     * @param mintList - An optional mint list to monitor zaps on, if one is not provided, the monitor will use the relay set from the mint list, which is the correct default behavior of NIP-61 zaps.
     */
    constructor(ndk: NDK, user: NDKUser, mintList?: NDKCashuMintList) {
        super();
        this.ndk = ndk;
        this.user = user;
        this.mintList = mintList;
        this.relaySet = mintList?.relaySet;
    }

    set wallet(wallet: NDKWallet | undefined) {
        this._wallet = wallet;

        if (wallet instanceof NDKCashuWallet) {
            this.onMintInfoNeeded ??= wallet.onMintInfoNeeded;
            this.onMintInfoLoaded ??= wallet.onMintInfoLoaded;
            this.onMintKeysNeeded ??= wallet.onMintKeysNeeded;
            this.onMintKeysLoaded ??= wallet.onMintKeysLoaded;

            if (wallet?.privkeys) {
                for (const [pubkey, signer] of wallet.privkeys.entries()) {
                    this.privkeys.set(pubkey, signer);
                }
            }
        }
    }

    get wallet() {
        return this._wallet;
    }

    /**
     * Provide private keys that can be used to redeem nutzaps.
     * 
     * This is particularly useful when a NWC wallet is used to receive the nutzaps,
     * since it doesn't have a private key, this allows keeping the private key in a separate
     * place (ideally a NIP-60 wallet event).
     * 
     * Multiple keys can be added, and the monitor will use the correct key for the nutzap.
     */
    public async addPrivkey(signer: NDKPrivateKeySigner) {
        const pubkey = (await signer.user()).pubkey;
        this.privkeys.set(pubkey, signer);
    }

    private async maybeAddPrivkey() {
        const { signer } = this.ndk;
        if (signer instanceof NDKPrivateKeySigner) {
            const user = await signer.user();
            const pubkey = user.pubkey;
            this.privkeys.set(pubkey, signer);
        }
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
        initialSyncOpts: {
            knownNutzaps: Set<NDKEventId>,
            pageSize: number,
        } = {
            knownNutzaps: new Set(),
            pageSize: 5,
        }
    ) {
        console.log('NDKWALLET starting nutzap monitor');
        // if we are already running, stop the current subscription
        if (this.sub) this.sub.stop();

        if (initialSyncOpts.knownNutzaps.size > 0) {
            for (const id of initialSyncOpts.knownNutzaps) {
                this.knownTokens.set(id, PROCESSING_STATUS.seen);
            }
        }

        await this.processNutzaps(initialSyncOpts.knownNutzaps, initialSyncOpts.pageSize);

        console.log('NDKWALLET subscribing to nutzaps');
        
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

    private async cashuWalletForMint(mint: string) {
        return walletForMint(mint, {
            onMintInfoNeeded: this.onMintInfoNeeded,
            onMintInfoLoaded: this.onMintInfoLoaded,
            onMintKeysNeeded: this.onMintKeysNeeded,
            onMintKeysLoaded: this.onMintKeysLoaded,
        });
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
        console.log('NDKWALLET processing nutzaps');
        await this.maybeAddPrivkey();
        console.log('NDKWALLET nutzap monitor has privkeys', this.privkeys.size);

        let processedCount = 0;
        const filter: NDKFilter = { kinds: [NDKKind.Nutzap], "#p": [this.user.pubkey], limit: pageSize, until };
        const nutzaps = await fetchPage(this.ndk, filter, knownNutzaps, this.relaySet);

        console.log('NDKWALLET found', nutzaps.length, 'nutzaps');

        // group nutzaps by mint
        const groupedNutzaps = groupNutzaps(nutzaps, knownNutzaps);

        console.log('NDKWALLET grouped nutzaps', groupedNutzaps.length);

        for (const group of groupedNutzaps) {
            // get the privkey we will need to redeem these nutzaps
            const groupPrivkey = this.privkeys.get(group.p2pk);
            if (!groupPrivkey) {
                const totalAmount = group.nutzaps.reduce((acc, nutzap) => acc + nutzap.amount, 0);
                console.error('no privkey found for p2pk', group.p2pk, "there are ", group.nutzaps.length, "nutzaps in this group with a total amount of", totalAmount, "sats");
                continue;
            }
            
            const cashuWallet = await this.cashuWalletForMint(group.mint);
            if (!cashuWallet) {
                console.error('failed to get cashu wallet for mint', group.mint);
                continue;
            }
            
            const spendStates = await getProofSpendState(cashuWallet, group.nutzaps);

            for (const nutzap of spendStates.nutzapsWithSpentProofs) {
                this.emit("spent", nutzap);
            }

            for (const nutzap of spendStates.nutzapsWithUnspentProofs) {
                this.emit("seen", nutzap);
                this.knownTokens.set(nutzap.id, PROCESSING_STATUS.seen);
            }

            if (spendStates.unspentProofs.length > 0) {
                await this.redeemNutzaps(group.mint, spendStates.nutzapsWithUnspentProofs, spendStates.unspentProofs, groupPrivkey);
            }
        }

        // if we found a new nutzap we were able to process, fetch the next page
        if (processedCount > 0)
            await this.processNutzaps(knownNutzaps, pageSize, until-1);
    }

    public checkWeHavePrivkey(p2pk: string) {
        return this.privkeys.has(p2pk);
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

    /**
     * This function redeems a list of verified proofs.
     * @param mint 
     * @param nutzapIds 
     * @param proofs 
     * @returns 
     */
    public async redeemNutzaps(
        mint: string,
        nutzaps: NDKNutzap[],
        proofs: Proof[],
        privkey: NDKPrivateKeySigner
    ) {
        const cashuWallet = await this.cashuWalletForMint(mint);

        if (!cashuWallet) {
            console.error('failed to get cashu wallet for mint', mint);
            return;
        }

        if (!this.wallet) throw new Error("wallet not set");
        if (!this.wallet.redeemNutzaps) throw new Error("wallet does not support redeeming nutzaps");
        
        console.log('NDKWALLET redeeming nutzaps', nutzaps.length, 'nutzaps');
        
        try {
            const totalAmount = await this.wallet.redeemNutzaps(cashuWallet, nutzaps, proofs, mint, privkey.privateKey!);
            console.log('NDKWALLET redeemed nutzaps', nutzaps.length, 'nutzaps', totalAmount);

            this.emit("redeem", nutzaps, totalAmount);
            
        } catch (e: any) {
            console.error('failed to redeem nutzaps', e.message);
        }
    }

    private async redeem(nutzap: NDKNutzap) {
        if (!this.wallet?.redeemNutzap) return;
        
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
                        this.emit("redeem", [nutzap], amount);
                    },
                }
            );

            if (res === false) {
                this.emit("spent", nutzap);
                return false;
            }
        } catch (e: any) {
            this.emit("failed", nutzap, e.message);
        }
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}