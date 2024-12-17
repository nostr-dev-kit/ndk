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
import { NDKCashuWallet } from "../wallets/cashu/wallet";
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
    redeem: (event: NDKNutzap) => void;

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
        // if we are already running, stop the current subscription
        if (this.sub) {
            this.sub.stop();
        }
        
        // if we don't have a mint list, we need to get one
        if (!mintList) {
            const list = await this.ndk.fetchEvent([
                { kinds: [NDKKind.CashuMintList], authors: [this.user.pubkey] },
            ]);
            if (!list) {
                return false;
            }
    
            mintList = NDKCashuMintList.from(list);
        }

        // set the relay set
        this.relaySet = mintList.relaySet;

        if (!this.relaySet) {
            d("no relay set provided");
            throw new Error("no relay set provided");
        }

        this.sub = this.ndk.subscribe(
            { kinds: [NDKKind.Nutzap], "#p": [this.user.pubkey] },
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
        console.log('eose');

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

            let privkey: string | undefined;
            let wallet: NDKCashuWallet | undefined;

            if (nutzap.p2pk) {
                wallet = this.findWalletForNutzap(nutzap);

                if (!wallet) {
                    // if nutzap is p2pk to the active user, check if we have the private key
                    if (nutzap.p2pk === this.user.pubkey) {
                        if (this.ndk.signer instanceof NDKPrivateKeySigner)
                            privkey = (this.ndk.signer as NDKPrivateKeySigner).privateKey;
                        else {
                            throw new Error("nutzap p2pk to the active user directly and we don't have access to the private key");
                        }
                    }

                    // find the wallet that has one of these mints
                    const normalizedMint = normalizeUrl(mint);
                    wallet = this.allWallets.find(w => w.mints
                        .map(normalizeUrl)
                        .includes(normalizedMint));

                    if (!wallet) throw new Error("wallet not found for nutzap (mint: " + normalizedMint + ")");
                }
            }

            if (!wallet) throw new Error("wallet not found for nutzap");
            privkey = wallet.privkey;
            
            const _wallet = await wallet.walletForMint(mint);
            if (!_wallet) throw new Error("unable to load wallet for mint " + mint);
            const proofsWeHave = wallet.proofsForMint(mint);

            try {
                const res = await _wallet.receive(
                    { proofs, mint, },
                    { privkey, proofsWeHave }
                );
                d("redeemed nutzap %o", nutzap.rawEvent());
                this.emit("redeem", nutzap);

                const receivedAmount = computeBalanceDifference(res, proofsWeHave);

                // save new proofs in wallet
                wallet.saveProofs(res, mint, { nutzap, amount: receivedAmount });
            } catch (e: any) {
                console.log("failed to redeem nutzap", nutzap.id, e.message);
                this.emit("failed", nutzap, e.message);
            }
        } catch (e: any) {
            console.trace(e);
            this.emit("failed", nutzap, e.message);
        }
    }

    private findWalletForNutzap(nutzap: NDKNutzap): NDKCashuWallet | undefined {
        const p2pk = nutzap.p2pk;
        let wallet: NDKCashuWallet | undefined;

        if (p2pk) wallet = this.walletByP2pk.get(p2pk);
        wallet ??= this.walletByP2pk.values().next().value;

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