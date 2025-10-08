// Removed duplicate import line
import type { CashuWallet, Proof } from "@cashu/cashu-ts";
import type NDK from "@nostr-dev-kit/ndk";
import type { NDKNutzapState } from "@nostr-dev-kit/ndk";
import {
    cashuPubkeyToNostrPubkey,
    // Types
    NDKCashuMintList,
    type NDKEvent,
    type NDKEventId,
    type NDKFilter,
    NDKKind,
    NDKNutzap,
    NDKPrivateKeySigner,
    type NDKRelaySet,
    type NDKSubscription,
    NDKSubscriptionCacheUsage, // Import value
    type NDKSubscriptionOptions,
    type NDKUser,
    NdkNutzapStatus,
    proofP2pk,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { NDKCashuWallet, NDKCashuWalletBackup } from "../wallets/cashu/wallet/index.js";
import type { NDKWallet } from "../wallets/index.js";
import {
    getCashuWallet,
    type MintInfoLoadedCb,
    type MintInfoNeededCb,
    type MintInterface,
    type MintKeysLoadedCb,
    type MintKeysNeededCb,
} from "../wallets/mint.js";
import { fetchPage } from "./fetch-page.js";
import { type GroupedNutzaps, groupNutzaps } from "./group-nutzaps.js";
import { getProofSpendState } from "./spend-status.js";

const _startTime = Date.now();

function log(_msg: string) {}

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
export class NDKNutzapMonitor
    extends EventEmitter<{
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
    }>
    implements MintInterface
{
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
    public getCashuWallet = getCashuWallet.bind(this) as MintInterface["getCashuWallet"];
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
        { mintList, store }: { mintList?: NDKCashuMintList; store?: NDKNutzapMonitorStore },
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
                        console.error("failed to add privkey from wallet with pubkey", pubkey, e);
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
            const nutzaps = candidateNutzaps.map((c) => c.nutzap).filter((n) => !!n);

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
     * Loads kind:375 backup events and kind:17375 wallet config events from this user
     * to find all backup keys this user might have used.
     */
    public async getBackupKeys() {
        // load backup events and wallet config events from relayset if we have one
        const backupEvents = await this.ndk.fetchEvents(
            [{ kinds: [NDKKind.CashuWalletBackup, NDKKind.CashuWallet], authors: [this.user.pubkey] }],
            undefined,
            this.relaySet,
        );

        const keys = Array.from(this.privkeys.values());
        const keysNotFound = new Set(keys.map((signer) => signer.privateKey!));

        // add the keys to the privkeys map
        for (const event of backupEvents) {
            if (event.kind === NDKKind.CashuWalletBackup) {
                const backup = await NDKCashuWalletBackup.from(event);
                if (!backup) continue;
                for (const privkey of backup.privkeys) {
                    if (keysNotFound.has(privkey)) keysNotFound.delete(privkey);
                    try {
                        const signer = new NDKPrivateKeySigner(privkey);
                        this.addPrivkey(signer);
                    } catch (e) {
                        console.error("failed to add privkey", privkey, e);
                    }
                }
            } else if (event.kind === NDKKind.CashuWallet) {
                // Handle kind 17375 wallet config events
                try {
                    await event.decrypt();
                    const content = JSON.parse(event.content);
                    for (const tag of content) {
                        if (tag[0] === "privkey") {
                            const privkey = tag[1];
                            if (keysNotFound.has(privkey)) keysNotFound.delete(privkey);
                            try {
                                const signer = new NDKPrivateKeySigner(privkey);
                                this.addPrivkey(signer);
                            } catch (e) {
                                console.error("failed to add privkey from wallet config", privkey, e);
                            }
                        }
                    }
                } catch (e) {
                    console.error("failed to decrypt wallet config event", event.encode(), e);
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
     * Fetches the wallet's mint list from relays.
     * This is used for checking if incoming nutzaps match advertised preferences.
     */
    async fetchMintList(): Promise<NDKCashuMintList | undefined> {
        const event = await this.ndk.fetchEvent(
            {
                kinds: [NDKKind.CashuMintList],
                authors: [this.user.pubkey],
            },
            {
                cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
                subId: "cashu-mint-list",
            },
        );

        if (event) {
            this.mintList = NDKCashuMintList.from(event);
            return this.mintList;
        }

        return undefined;
    }

    /**
     * Start the nutzap monitor. The monitor will initially look back
     * for nutzaps it doesn't know about and will try to redeem them.
     *
     * @param knownNutzaps - An optional set of nutzaps the app knows about. This is an optimization so that we don't try to redeem nutzaps we know have already been redeemed.
     * @param pageSize - The number of nutzaps to fetch per page.
     *
     */
    public async start({ filter, opts }: { filter?: NDKFilter; opts?: NDKSubscriptionOptions }) {
        log("Starting nutzap monitor");

        // if we are already running, stop the current subscription
        if (this.sub) this.sub.stop();

        // Fetch mint list if not already set
        if (!this.mintList) {
            try {
                const mintList = await this.fetchMintList();
                log(`Fetched mint list with ${mintList?.mints.length ?? 0} mints`);
            } catch (e) {
                console.error("❌ Failed to fetch mint list", e);
            }
        }

        try {
            await this.getBackupKeys();
            log(`Got backup keys ${this.privkeys.size}`);
        } catch (e) {
            console.error("❌ Failed to get backup keys", e);
        }

        await this.addUserPrivKey();
        log(`Added user privkey ${this.privkeys.size}`);

        // We generate the filter now to account for nutzaps that have been received
        // between the moment we start looking for accumulated nutzaps and the moment
        // we start the subscription.
        const since = Math.floor(Date.now() / 1000);
        const monitorFilter = { kinds: [NDKKind.Nutzap], "#p": [this.user.pubkey], since };

        // load all nutzaps from the store
        if (this.store) {
            log("Will load nutzaps from store");
            try {
                const nutzaps = await this.store.getAllNutzaps();
                log(`Loaded ${nutzaps.size} nutzaps`);
                for (const [id, state] of nutzaps.entries()) {
                    this.nutzapStates.set(id, state);
                }
                log(`Changed the state of ${nutzaps.size} nutzaps`);
            } catch (e) {
                console.error("❌ Failed to load nutzaps from store", e);
            }
        }

        try {
            log("Will start processing redeemable nutzaps from store");
            await this.processRedeemableNutzapsFromStore();
            log("Finished processing redeemable nutzaps from store");
        } catch (e) {
            console.error("❌ Failed to process redeemable nutzaps from store", e);
        }

        try {
            log("Will start processing accumulated nutzaps");
            await this.processAccumulatedNutzaps(filter, opts);
            log(`Finished processing accumulated nutzaps ${this.nutzapStates.size}`);
        } catch (e) {
            console.error("❌ Failed to process nutzaps", e);
        }

        log(`Running filter ${JSON.stringify(monitorFilter)}`);

        // Prepare options, including the relaySet
        const subscribeOpts: NDKSubscriptionOptions = {
            subId: "ndk-wallet:nutzap-monitor",
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
            wrap: false,
            // We skip validation so the user knows about nutzaps that were sent but are not valid
            // this way tooling can be more comprehensive and include nutzaps that were not valid
            skipValidation: true,
            ...opts,
            relaySet: this.relaySet, // Pass relaySet via options
        };

        this.sub = this.ndk.subscribe(
            monitorFilter,
            subscribeOpts,
            // this.relaySet, // Removed: Passed via opts
            {
                // autoStart handlers (now 3rd argument)
                onEvent: (event: NDKEvent) => this.eventHandler(event), // Added NDKEvent type
            },
        );

        log("✅ Nutzap monitor started successfully");
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
        log("Processing accumulated nutzaps");
        let oldestUnspentNutzapTime: number | undefined;
        const _filter = { ...filter };

        _filter.kinds = [NDKKind.Nutzap];
        _filter["#p"] = [this.user.pubkey];
        const knownNutzapIds = new Set(this.nutzapStates.keys());

        const nutzaps = await fetchPage(this.ndk, _filter, knownNutzapIds, this.relaySet);

        log(`We loaded ${nutzaps.length} nutzaps from relays`);

        // Process the nutzaps
        oldestUnspentNutzapTime = await this.processNutzaps(nutzaps, oldestUnspentNutzapTime);

        log("We finished processing thesenutzaps");

        // if we found a new nutzap we were able to process, fetch the next page
        if (oldestUnspentNutzapTime) {
            // update filter to fetch the previous page
            _filter.since = oldestUnspentNutzapTime - 1;
            await this.processAccumulatedNutzaps(_filter, opts);
        }
    }

    public stop() {
        this.sub?.stop();
    }

    private updateNutzapState(id: NDKEventId, state: Partial<NDKNutzapState>) {
        const currentState = this.nutzapStates.get(id) ?? ({} as NDKNutzapState);
        if (!currentState.status) state.status ??= NdkNutzapStatus.INITIAL;

        // Check if the update would actually change anything
        const stateIsUnchanged = Object.entries(state).every(([key, value]) => {
            if (key === "nutzap" && currentState.nutzap && value) {
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
        };
        const currentStatusStr = serializedState(currentState);
        const newStatusStr = serializedState(state);
        log(`[${id.substring(0, 6)}] ${currentStatusStr} changed to 👉 ${newStatusStr}`);

        this.store?.setNutzapState(id, state);
    }

    private async eventHandler(event: NDKEvent) {
        if (this.nutzapStates.has(event.id)) return;

        const nutzap = await NDKNutzap.from(event);
        if (!nutzap) {
            this.updateNutzapState(event.id, {
                status: NdkNutzapStatus.PERMANENT_ERROR,
                errorMessage: "Failed to parse nutzap",
            });
            return;
        }

        // Check if the mint is in the mintList
        if (this.mintList && !this.mintList.mints.includes(nutzap.mint)) {
            this.emit("seen_in_unknown_mint", nutzap);
        }

        this.redeemNutzap(nutzap);
    }

    /**
     * Gathers the necessary information to redeem a nutzap and then redeems it.
     * @param nutzap
     */
    public async redeemNutzap(nutzap: NDKNutzap): Promise<NDKNutzapState> {
        if (!this.nutzapStates.has(nutzap.id))
            this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.INITIAL, nutzap });

        // First check if we have the private key to redeem this nutzap
        const rawP2pk = nutzap.rawP2pk;
        if (rawP2pk) {
            const cashuPubkey = proofP2pk(nutzap.proofs[0]);
            if (cashuPubkey) {
                const nostrPubkey = cashuPubkeyToNostrPubkey(cashuPubkey);
                if (nostrPubkey && !this.privkeys.has(nostrPubkey)) {
                    // No private key available for this p2pk
                    this.updateNutzapState(nutzap.id, {
                        status: NdkNutzapStatus.MISSING_PRIVKEY,
                        errorMessage: "No privkey found for p2pk",
                    });
                    return this.nutzapStates.get(nutzap.id)!;
                }
            }
        }

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
    public async redeemNutzaps(mint: string, nutzaps: NDKNutzap[], proofs: Proof[]) {
        if (!this.wallet) throw new Error("wallet not set");
        if (!this.wallet.redeemNutzaps) throw new Error("wallet does not support redeeming nutzaps");

        const cashuWallet = await this.getCashuWallet(mint);
        const validNutzaps: NDKNutzap[] = [];

        // First check if we have the required private key
        if (proofs.length > 0) {
            const cashuPubkey = proofP2pk(proofs[0]);
            if (!cashuPubkey) {
                for (const nutzap of nutzaps) {
                    this.updateNutzapState(nutzap.id, {
                        status: NdkNutzapStatus.INVALID_NUTZAP,
                        errorMessage: "Invalid nutzap: proof is not p2pk",
                    });
                }
                return;
            }

            const nostrPubkey = cashuPubkeyToNostrPubkey(cashuPubkey);
            if (!nostrPubkey) {
                for (const nutzap of nutzaps) {
                    this.updateNutzapState(nutzap.id, {
                        status: NdkNutzapStatus.INVALID_NUTZAP,
                        errorMessage: "Invalid nutzap: locked to an invalid public key (not a nostr key)",
                    });
                }
                return;
            }

            const privkey = this.privkeys.get(nostrPubkey);
            if (!privkey) {
                for (const nutzap of nutzaps) {
                    this.updateNutzapState(nutzap.id, {
                        status: NdkNutzapStatus.MISSING_PRIVKEY,
                        errorMessage: "No privkey found for p2pk",
                    });
                }
                return;
            }
        }

        // perform validation on each nutzap
        for (const nutzap of nutzaps) {
            if (!nutzap.isValid) {
                this.updateNutzapState(nutzap.id, {
                    status: NdkNutzapStatus.INVALID_NUTZAP,
                    errorMessage: "Invalid nutzap",
                });
                continue;
            }

            // check that the nutzap has a valid p2pk
            const rawP2pk = nutzap.rawP2pk;
            if (!rawP2pk) {
                this.updateNutzapState(nutzap.id, {
                    status: NdkNutzapStatus.INVALID_NUTZAP,
                    errorMessage: "Invalid nutzap: locked to an invalid public key (no p2pk)",
                });
                continue;
            }

            if (rawP2pk.length !== 66) {
                this.updateNutzapState(nutzap.id, {
                    status: NdkNutzapStatus.INVALID_NUTZAP,
                    errorMessage: `Invalid nutzap: locked to an invalid public key (length ${rawP2pk.length})`,
                });
                continue;
            }

            validNutzaps.push(nutzap);
        }

        if (validNutzaps.length === 0) return;

        // Get the necessary private key
        const cashuPubkey = proofP2pk(proofs[0]);
        if (!cashuPubkey) return;
        const nostrPubkey = cashuPubkeyToNostrPubkey(cashuPubkey);
        if (!nostrPubkey) return;

        const privkey = this.privkeys.get(nostrPubkey);
        if (!privkey) {
            for (const nutzap of validNutzaps) {
                this.updateNutzapState(nutzap.id, {
                    status: NdkNutzapStatus.MISSING_PRIVKEY,
                    errorMessage: "No privkey found for p2pk",
                });
            }
            return;
        }

        for (const nutzap of validNutzaps) {
            this.updateNutzapState(nutzap.id, { status: NdkNutzapStatus.PROCESSING });
        }

        try {
            const totalAmount = await this.wallet.redeemNutzaps(nutzaps, privkey.privateKey!, {
                cashuWallet,
                proofs,
                mint,
            });
            this.emit("redeemed", nutzaps, totalAmount);

            for (const nutzap of nutzaps) {
                const nutzapTotalAmount = proofsTotal(proofsIntersection(proofs, nutzap.proofs));
                this.updateNutzapState(nutzap.id, {
                    status: NdkNutzapStatus.REDEEMED,
                    redeemedAmount: nutzapTotalAmount,
                });
            }
        } catch (e: any) {
            console.error("❌ Failed to redeem nutzaps", e.message);

            // Handle "unknown public key size" as a permanent error
            if (e.message?.includes("unknown public key size")) {
                for (const nutzap of nutzaps) {
                    this.updateNutzapState(nutzap.id, {
                        status: NdkNutzapStatus.PERMANENT_ERROR,
                        errorMessage: "Invalid p2pk: unknown public key size",
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
        for (const [_id, state] of this.nutzapStates.entries()) {
            // Skip if there's no nutzap object
            if (!state.nutzap) continue;

            // Check if this nutzap should be redeemed
            if (this.shouldTryRedeem(state.nutzap)) {
                redeemableNutzaps.push(state.nutzap);
            }
        }
        if (redeemableNutzaps.length === 0) return;

        log(`We found ${redeemableNutzaps.length} redeemable nutzaps in the store`);

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
            log(`Processing group ${group.mint} with ${group.nutzaps.length} nutzaps`);
            try {
                await this.checkAndRedeemGroup(group, oldestUnspentNutzapTime);
                log(`Finished processing group ${group.mint}`);
            } catch (e) {
                log(`Failed to process group ${group.mint}`);
                console.error(`❌ Failed to process group ${group.mint}`, e);
            }
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
    const proofs2Cs = new Set(proofs2.map((p) => p.C));
    return proofs1.filter((p) => proofs2Cs.has(p.C));
}

/**
 * Returns the total amount of a list of proofs.
 * @param proofs
 * @returns
 */
function proofsTotal(proofs: Proof[]) {
    return proofs.reduce((acc, proof) => acc + proof.amount, 0);
}
