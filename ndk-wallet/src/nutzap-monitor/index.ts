import NDK, {
    cashuPubkeyToNostrPubkey,
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
    NDKSubscriptionOptions,
    NDKUser,
    proofP2pk,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { NDKCashuWallet, NDKCashuWalletBackup } from "../wallets/cashu/wallet/index.js";
import { NDKWallet } from "../wallets/index.js";
import { fetchPage } from "./fetch-page.js";
import { GroupedNutzaps, groupNutzaps } from "./group-nutzaps.js";
import { CashuWallet, Proof } from "@cashu/cashu-ts";
import { getProofSpendState } from "./spend-status.js";
import { getCashuWallet, MintInfoNeededCb, MintInfoLoadedCb, MintKeysNeededCb, MintKeysLoadedCb, MintInterface } from "../wallets/mint.js";

export interface NDKNutzapState {
    nutzap?: NDKNutzap;

    status: NdkNutzapStatus;

    // The token event id of the event that redeemed the nutzap
    redeemedById?: NDKEventId;

    // Error message if the nutzap has an error
    errorMessage?: string;

    // Amount redeemed if the nutzap has been redeemed
    redeemedAmount?: number;
}

export enum NdkNutzapStatus {
    // First time we see a nutzap
    INITIAL = 'initial',
    
    // Processing the nutzap
    PROCESSING = 'processing',

    // Nutzap has been redeemed
    REDEEMED = 'redeemed',

    // Nutzap has been spent
    SPENT = 'spent',

    // The nutzap is p2pk to a pubkey of which we don't have a privkey
    MISSING_PRIVKEY = 'missing_privkey',

    // Generic temporary error
    TEMPORARY_ERROR = 'temporary_error',

    // Generic permanent error
    PERMANENT_ERROR = 'permanent_error',

    // The nutzap is invalid
    INVALID_NUTZAP = 'invalid_nutzap',
}

/**
 * This interface should be provided by the application to save and load
 * state that the nutzap monitor can reuse.
 */
export interface NDKNutzapMonitorStore {
    /**
     * Get all nutzaps that the monitor knows about.
     */
    getAllNutzaps: () => Promise<Map<NDKEventId, NDKNutzapState>>;

    /**
     * Update the state of a nutzap.
     */
    setNutzapState: (id: NDKEventId, stateChange: Partial<NDKNutzapState>) => Promise<void>;
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
     * Emitted when the state of a nutzap changes
     */
    state_changed: (nutzapId: NDKEventId, state: NdkNutzapStatus) => void;
    
    /**
     * Emitted when a new nutzap is successfully redeemed
     */
    redeemed: (events: NDKNutzap[], amount: number) => void;

    /**
     * Emitted when a nutzap has been seen
     */
    seen: (event: NDKNutzap) => void;

    /**
     * Emitted when a nutzap has failed to be redeemed
     */
    failed: (event: NDKNutzap, error: string) => void;
}> implements MintInterface {
    public store?: NDKNutzapMonitorStore;
    public ndk: NDK;
    private user: NDKUser;
    public relaySet?: NDKRelaySet;
    private sub?: NDKSubscription;
    public nutzapStates = new Map<NDKEventId, NDKNutzapState>();
    private _wallet?: NDKWallet;
    public mintList?: NDKCashuMintList;

    public privkeys = new Map<string, NDKPrivateKeySigner>();

    public cashuWallets = new Map<string, CashuWallet>();
    public getCashuWallet = getCashuWallet.bind(this) as MintInterface['getCashuWallet'];
    public onMintInfoNeeded?: MintInfoNeededCb;
    public onMintInfoLoaded?: MintInfoLoadedCb;
    public onMintKeysNeeded?: MintKeysNeededCb;
    public onMintKeysLoaded?: MintKeysLoadedCb;

    /**
     * Create a new nutzap monitor.
     * @param ndk - The NDK instance.
     * @param user - The user to monitor.
     * @param mintList - An optional mint list to monitor zaps on, if one is not provided, the monitor will use the relay set from the mint list, which is the correct default behavior of NIP-61 zaps.
     * @param store - An optional store to save and load nutzap states to.
     */
    constructor(
        ndk: NDK,
        user: NDKUser,
        { mintList, store }: { mintList?: NDKCashuMintList, store?: NDKNutzapMonitorStore }
    ) {
        super();
        this.ndk = ndk;
        this.user = user;
        this.mintList = mintList;
        this.relaySet = mintList?.relaySet;
        this.store = store;
    }

    set wallet(wallet: NDKWallet | undefined) {
        this._wallet = wallet;

        if (wallet) {
            this.onMintInfoNeeded ??= wallet.onMintInfoNeeded;
            this.onMintInfoLoaded ??= wallet.onMintInfoLoaded;
            this.onMintKeysNeeded ??= wallet.onMintKeysNeeded;
            this.onMintKeysLoaded ??= wallet.onMintKeysLoaded;

            if (wallet instanceof NDKCashuWallet && wallet?.privkeys) {
                for (const [pubkey, signer] of wallet.privkeys.entries()) {
                    try {
                        this.addPrivkey(signer);
                    } catch (e) {
                        console.error(`failed to add privkey from wallet with pubkey`, pubkey, e);
                    }
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
        if (this.privkeys.has(pubkey)) return;
        this.privkeys.set(pubkey, signer);

        // only continue if we already started the monitor
        if (!this.sub) return;

        // check for nutzaps that were missing the pubkey we just added
        const inMssingPrivKeyState = (state: NDKNutzapState) => state.status === NdkNutzapStatus.MISSING_PRIVKEY;
        const ensureIsCashuPubkey = (state: NDKNutzapState) => state.nutzap?.p2pk === pubkey;
        const candidateNutzaps = Array.from(this.nutzapStates.values())
            .filter(inMssingPrivKeyState)
            .filter(ensureIsCashuPubkey);
        
        if (candidateNutzaps.length > 0) {
            const nutzaps = candidateNutzaps.map(c => c.nutzap).filter(n => !!n);
            
            // group nutzaps by mint
            const groupedNutzaps = groupNutzaps(nutzaps, this);

            for (const group of groupedNutzaps) {
                await this.checkAndRedeemGroup(group);
            }
        }
    }

    private async addUserPrivKey() {
        const { signer } = this.ndk;
        if (signer instanceof NDKPrivateKeySigner) {
            const user = await signer.user();
            const pubkey = user.pubkey;
            this.privkeys.set(pubkey, signer);
        }
    }

    /**
     * Loads kind:375 backup events from this user to find all backup keys this user might have used.
     */
    public async getBackupKeys() {
        // load backup events from relayset if we have one
        const backupEvents = await this.ndk.fetchEvents([
            { kinds: [NDKKind.CashuWalletBackup], "authors": [this.user.pubkey] }
        ], undefined, this.relaySet);

        const keys = Array.from(this.privkeys.values());
        const keysNotFound = new Set(keys.map(signer => signer.privateKey!));

        // add the keys to the privkeys map
        for (const event of backupEvents) {
            const backup = await NDKCashuWalletBackup.from(event);
            if (!backup) continue;
            for (const privkey of backup.privkeys) {
                if (keysNotFound.has(privkey)) keysNotFound.delete(privkey);
                try {
                    const signer = new NDKPrivateKeySigner(privkey);
                    this.addPrivkey(signer);
                } catch (e) {
                    console.error(`failed to add privkey`, privkey, e);
                }
            }
        }

        // Store all the keys that were not found backed up
        if (keysNotFound.size > 0) {
            const backup = new NDKCashuWalletBackup(this.ndk);
            backup.privkeys = Array.from(keysNotFound);
            await backup.save(this.relaySet);
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
    public async start({ filter, opts }: { filter?: NDKFilter, opts?: NDKSubscriptionOptions }) {
        // if we are already running, stop the current subscription
        if (this.sub) this.sub.stop();
        
        try {
            await this.getBackupKeys();
        } catch (e) {
            console.error(`❌ Failed to get backup keys`, e);
        }

        await this.addUserPrivKey();

        // We generate the filter now to account for nutzaps that have been received
        // between the moment we start looking for accumulated nutzaps and the moment
        // we start the subscription.
        const since = Math.floor(Date.now() / 1000);
        const monitorFilter = { kinds: [NDKKind.Nutzap], "#p": [this.user.pubkey], since }

        // load all nutzaps from the store
        if (this.store) {
            try {
                const nutzaps = await this.store.getAllNutzaps();
                for (const [id, state] of nutzaps.entries()) {
                    this.nutzapStates.set(id, state);
                }
            } catch (e) {
                console.error(`❌ Failed to load nutzaps from store`, e);
            }
        }

        try {
            await this.processRedeemableNutzapsFromStore();
        } catch (e) {
            console.error(`❌ Failed to process redeemable nutzaps from store`, e);
        }

        try {
            await this.processAccumulatedNutzaps(filter, opts);
        } catch (e) {
            console.error(`❌ Failed to process nutzaps`, e);
        }
        
        this.sub = this.ndk.subscribe(
            monitorFilter,
            {
                subId: "ndk-wallet:nutzap-monitor",
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
                wrap: false,
                // We skip validation so the user knows about nutzaps that were sent but are not valid
                // this way tooling can be more comprehensive and include nutzaps that were not valid
                skipValidation: true,
                ...opts,
            },
            this.relaySet,
            {
                onEvent: (event) => this.eventHandler(event),
            }
        );

        console.log(`✅ Nutzap monitor started successfully`);
        return true;
    }

    /**
     * Checks if the group of nutzaps can be redeemed and redeems the ones that can be.
     */
    private async checkAndRedeemGroup(group: GroupedNutzaps, oldestUnspentNutzapTime?: number | undefined) {
        const cashuWallet = await this.getCashuWallet(group.mint);
        
        const spendStates = await getProofSpendState(cashuWallet, group.nutzaps);
        
        // update the state of the nutzaps that have been spent
        for (const nutzap of spendStates.nutzapsWithSpentProofs) {
            this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.SPENT, nutzap });
        }

        for (const nutzap of spendStates.nutzapsWithUnspentProofs) {
            this.emit("seen", nutzap);
            this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.INITIAL, nutzap });
        }

        if (spendStates.unspentProofs.length > 0) {
            for (const nutzap of spendStates.nutzapsWithUnspentProofs) {
                if (!oldestUnspentNutzapTime || oldestUnspentNutzapTime > nutzap.created_at!) {
                    oldestUnspentNutzapTime = nutzap.created_at!;
                }
            }

            await this.redeemNutzaps(group.mint, spendStates.nutzapsWithUnspentProofs, spendStates.unspentProofs);
        }
    }

    /**
     * Processes nutzaps that have been accumulated while the monitor was offline.
     * @param startOpts
     * @param opts
     */
    public async processAccumulatedNutzaps(filter: NDKFilter = {}, opts?: NDKSubscriptionOptions) {
        let oldestUnspentNutzapTime: number | undefined;
        const _filter = { ...filter };

        _filter.kinds = [NDKKind.Nutzap];
        _filter["#p"] = [this.user.pubkey];
        const knownNutzapIds = new Set(this.nutzapStates.keys());
        
        const nutzaps = await fetchPage(this.ndk, _filter, knownNutzapIds, this.relaySet);

        // Process the nutzaps
        oldestUnspentNutzapTime = await this.processNutzaps(nutzaps, oldestUnspentNutzapTime);

        // if we found a new nutzap we were able to process, fetch the next page
        if (oldestUnspentNutzapTime) {
            // update filter to fetch the previous page
            _filter.since = oldestUnspentNutzapTime-1;
            await this.processAccumulatedNutzaps(_filter, opts);
        }
    }

    public stop() {
        this.sub?.stop();
    }

    private updateNutzapState(id: NDKEventId, state: Partial<NDKNutzapState>) {
        const currentState = this.nutzapStates.get(id) ?? {} as NDKNutzapState;
        if (!currentState.status) state.status ??= NdkNutzapStatus.INITIAL;

        // Check if the update would actually change anything
        const stateIsUnchanged = Object.entries(state).every(([key, value]) => {
            if (key === 'nutzap' && currentState.nutzap && value) {
                return currentState.nutzap.id === (value as NDKNutzap).id;
            }
            return currentState[key as keyof NDKNutzapState] === value;
        });

        if (stateIsUnchanged) return;

        this.nutzapStates.set(id, { ...currentState, ...state });
        this.emit("state_changed", id, currentState.status);

        const serializedState = (state: Partial<NDKNutzapState>) => {
            const res: Record<string, any> = { ...state };
            if (res.nutzap) res.nutzap = res.nutzap.id;
            return JSON.stringify(res);
        }
        const currentStatusStr = serializedState(currentState);
        const newStatusStr = serializedState(state);
        console.log(`\t[${id.substring(0, 6)}]`, currentStatusStr, "changed to 👉", newStatusStr);

        this.store?.setNutzapState(id, state);
    }

    private async eventHandler(event: NDKEvent) {
        if (this.nutzapStates.has(event.id)) return;

        const nutzap = await NDKNutzap.from(event);
        if (!nutzap) {
            this.updateNutzapState(event.id, { status: NdkNutzapStatus.PERMANENT_ERROR, errorMessage: "Failed to parse nutzap" });
            return;
        }

        this.redeemNutzap(nutzap);
    }

    /**
     * Gathers the necessary information to redeem a nutzap and then redeems it.
     * @param nutzap 
     */
    public async redeemNutzap(nutzap: NDKNutzap): Promise<NDKNutzapState> {
        if (!this.nutzapStates.has(nutzap.id)) this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.INITIAL, nutzap });
        await this.redeemNutzaps(nutzap.mint, [nutzap], nutzap.proofs);
        return this.nutzapStates.get(nutzap.id)!;
    }

    /**
     * This function redeems a list of proofs.
     * 
     * Proofs will be attempted to be redeemed in a single call, so they will all work or none will.
     * Either call this function with proofs that have been verified to be redeemable or don't group them,
     * and provide a single nutzap per call.
     * 
     * All nutzaps MUST be p2pked to the same pubkey.
     * 
     * @param mint 
     * @param nutzaps 
     * @param proofs 
     * @param privkey Private key that is needed to redeem the nutzaps.
     * @returns 
     */
    public async redeemNutzaps(
        mint: string,
        nutzaps: NDKNutzap[],
        proofs: Proof[],
    ) {
        if (!this.wallet) throw new Error("wallet not set");
        if (!this.wallet.redeemNutzaps) throw new Error("wallet does not support redeeming nutzaps");
        
        const cashuWallet = await this.getCashuWallet(mint);
        const validNutzaps: NDKNutzap[] = [];

        // perform validation on each nutzap
        for (const nutzap of nutzaps) {
            if (!nutzap.isValid) {
                this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.INVALID_NUTZAP, errorMessage: "Invalid nutzap" });
                continue;
            }

            // check that the nutzap has a valid p2pk
            const rawP2pk = nutzap.rawP2pk;
            if (!rawP2pk) {
                this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.INVALID_NUTZAP, errorMessage: "Invalid nutzap: locked to an invalid public key (no p2pk)" });
                continue;
            }

            if (rawP2pk.length !== 66) {
                this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.INVALID_NUTZAP, errorMessage: "Invalid nutzap: locked to an invalid public key (length " + rawP2pk.length + ")" });
                continue;
            }

            validNutzaps.push(nutzap);
        }

        const cashuPubkey = proofP2pk(proofs[0]);
        if (!cashuPubkey) return;
        const nostrPubkey = cashuPubkeyToNostrPubkey(cashuPubkey);
        if (!nostrPubkey) return;
        
        const privkey = this.privkeys.get(nostrPubkey);
        if (!privkey) {
            for (const nutzap of validNutzaps) {
                this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.MISSING_PRIVKEY, errorMessage: "No privkey found for p2pk" });
            }
            return;
        }

        for (const nutzap of validNutzaps) {
            this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.PROCESSING });
        }
        
        try {
            const totalAmount = await this.wallet.redeemNutzaps(nutzaps, privkey.privateKey!, { cashuWallet, proofs, mint });
            this.emit("redeemed", nutzaps, totalAmount);

            for (const nutzap of nutzaps) {
                const nutzapTotalAmount = proofsTotal(proofsIntersection(proofs, nutzap.proofs));
                this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.REDEEMED, redeemedAmount: nutzapTotalAmount });
            }
        } catch (e: any) {
            console.error(`❌ Failed to redeem nutzaps`, e.message);
            
            // Handle "unknown public key size" as a permanent error
            if (e.message && e.message.includes("unknown public key size")) {
                for (const nutzap of nutzaps) {
                    this.updateNutzapState(nutzap.id, { 
                        status: NdkNutzapStatus.PERMANENT_ERROR, 
                        errorMessage: "Invalid p2pk: unknown public key size" 
                    });
                    this.emit("failed", nutzap, "Invalid p2pk: unknown public key size");
                }
            } else {
                // For other errors, emit failed event
                for (const nutzap of nutzaps) {
                    this.emit("failed", nutzap, e.message);
                }
            }
        }
    }

    public shouldTryRedeem(nutzap: NDKNutzap) {
        const state = this.nutzapStates.get(nutzap.id);
        if (!state) return true;

        if ([NdkNutzapStatus.INITIAL].includes(state.status)) return true;
    
        // if it's in missing privkey but we have the key now, try again
        if (state.status === NdkNutzapStatus.MISSING_PRIVKEY) {
            const p2pk = state.nutzap?.p2pk;
            if (p2pk && this.privkeys.has(p2pk)) return true;
            return false;
        }

        if ([NdkNutzapStatus.SPENT, NdkNutzapStatus.REDEEMED].includes(state.status)) return false;

        // Never retry permanent errors
        if ([NdkNutzapStatus.PERMANENT_ERROR, NdkNutzapStatus.INVALID_NUTZAP].includes(state.status)) return false;
    
        return false;
    }

    /**
     * Process nutzaps from the store that are in a redeemable state.
     * This includes nutzaps in INITIAL state and those in MISSING_PRIVKEY state
     * for which we now have the private key.
     */
    private async processRedeemableNutzapsFromStore() {
        const redeemableNutzaps: NDKNutzap[] = [];

        // Find all nutzaps in the store that are in a redeemable state
        for (const [id, state] of this.nutzapStates.entries()) {
            // Skip if there's no nutzap object
            if (!state.nutzap) continue;

            // Check if this nutzap should be redeemed
            if (this.shouldTryRedeem(state.nutzap)) {
                redeemableNutzaps.push(state.nutzap);
            }
        }
        if (redeemableNutzaps.length === 0) return;

        // Process the nutzaps
        await this.processNutzaps(redeemableNutzaps);
    }

    /**
     * Common method to process a collection of nutzaps:
     * - Group them by mint
     * - Check and redeem each group
     * 
     * @param nutzaps The nutzaps to process
     * @param oldestUnspentNutzapTime Optional timestamp to track the oldest unspent nutzap
     * @returns The updated oldestUnspentNutzapTime if any nutzaps were processed
     */
    private async processNutzaps(nutzaps: NDKNutzap[], oldestUnspentNutzapTime?: number): Promise<number | undefined> {
        // Group nutzaps by mint
        const groupedNutzaps = groupNutzaps(nutzaps, this);

        // Process each group
        for (const group of groupedNutzaps) {
            await this.checkAndRedeemGroup(group, oldestUnspentNutzapTime);
        }

        return oldestUnspentNutzapTime;
    }
}

/**
 * Returns the intersection of two arrays of proofs.
 * @param proofs1 
 * @param proofs2 
 * @returns 
 */
function proofsIntersection(proofs1: Proof[], proofs2: Proof[]) {
    const proofs2Cs = new Set(proofs2.map(p => p.C));
    return proofs1.filter(p => proofs2Cs.has(p.C));
}

/**
 * Returns the total amount of a list of proofs.
 * @param proofs 
 * @returns 
 */
function proofsTotal(proofs: Proof[]) {
    return proofs.reduce((acc, proof) => acc + proof.amount, 0);
}
