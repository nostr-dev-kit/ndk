import { NDKEvent, NDKEventId } from "@nostr-dev-kit/ndk";
import { NDKWalletChange } from "../../cashu/history";
import createDebug from "debug";
import NDKWalletLifecycle from ".";
import { CashuMint, CashuWallet, Proof } from "@cashu/cashu-ts";
import { NDKCashuToken } from "../../cashu/token";

const d = createDebug("ndk-wallet:lifecycle:nutzap");

class NutzapHandler {
    private lifecycle: NDKWalletLifecycle;
    private _eosed = false;
    private redeemQueue = new Map<NDKEventId, NDKEvent>();
    private knownRedeemedTokens = new Set<NDKEventId>();

    constructor(lifecycle: NDKWalletLifecycle) {
        this.lifecycle = lifecycle;
    }

    get wallet() {
        return this.lifecycle.wallet;
    }

    /**
     * Called when a new nutzap needs to be processed
     */
    public addNutzap(event: NDKEvent) {
        if (!this._eosed) {
            this.pushToRedeemQueue(event);
        } else {
            d("received nutzap after eose %o", event.rawEvent());
            this.redeem(event);
        }
    }

    /**
     * Called when a wallet change is seen
     */
    public addWalletChange(event: NDKWalletChange) {
        const redeemedIds = event.getMatchingTags("e").map(t => t[1]);
        redeemedIds.forEach(id => this.knownRedeemedTokens.add(id));
    }

    set eosed(eosed: boolean) {
        this._eosed = eosed;

        // start processing queue of nutzaps
        if (eosed) this.processRedeemQueue();
    }

    private pushToRedeemQueue(nutzap: NDKEvent) {
        this.redeemQueue.set(nutzap.id, nutzap);
    }

    private processRedeemQueue() {
        // go through knownRedeemedTokens and remove them from the queue
        for (const id of this.knownRedeemedTokens) {
            this.redeemQueue.delete(id);
        }

        // process the queue
        for (const nutzap of this.redeemQueue.values()) {
            this.redeem(nutzap);
        }
    }

    private findWalletForProof(proof: Proof) {
        try {
            const secretPayload = JSON.parse(proof.secret);
            d("secret payload %o", secretPayload);
            const decodedPayload = JSON.parse(secretPayload);
            d("decoded payload %o", decodedPayload);

            const isP2PKLocked = decodedPayload[0] === 'P2PK' && decodedPayload[1]?.data;
            
            if (isP2PKLocked) {
                const paddedp2pk = decodedPayload[1].data;
                d("padded p2pk %o", paddedp2pk);
                const p2pk = paddedp2pk.slice(2, -1);
                d("p2pk %o", p2pk);

                const wallet = this.lifecycle.walletsByP2pk.get(p2pk);
                if (!wallet) {
                    d("wallet not found for p2pk %o", p2pk);
                    return;
                }

                return wallet;
            }
        } catch {}

        return this.lifecycle.defaultWallet;
    }

    private async redeem(nutzap: NDKEvent) {
        if (this.knownRedeemedTokens.has(nutzap.id)) return;
        this.knownRedeemedTokens.add(nutzap.id);
        
        try {
            const mint = nutzap.tagValue("u");
            if (!mint) throw new Error("missing mint");
            const proofs = JSON.parse(nutzap.content);
            d('attempting to redeem proof %o', proofs);
            const firstProof = proofs[0];
            const wallet = this.findWalletForProof(firstProof);
            if (!wallet) throw new Error("wallet not found for proof");

            // we emit a nutzap:seen event only once we know that we have the private key to attempt to redeem it
            this.lifecycle.emit('nutzap:seen', nutzap);

            const _wallet = new CashuWallet(new CashuMint(mint), { unit: wallet.unit });
            
            d("will attempt to redeem %d proofs with wallet %s, with privkey %s", proofs.length, wallet.walletId, wallet.privkey);
            try {
                const res = await _wallet.receiveTokenEntry({ proofs, mint }, {
                    privkey: wallet.privkey,
                });
                this.lifecycle.emit('nutzap:redeemed', nutzap);

                // save new proofs in wallet
                wallet.saveProofs(res, mint, nutzap);
            } catch (e: any) {
                console.error(e.message);
                this.lifecycle.emit('nutzap:failed', nutzap, e.message);
            }
        } catch (e) {
            console.trace(e);
            this.lifecycle.emit('nutzap:failed', nutzap, e);
        }
    }
}

export default NutzapHandler;