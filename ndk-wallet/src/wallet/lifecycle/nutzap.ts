import type { NDKEvent, NDKEventId} from "@nostr-dev-kit/ndk";
import { NDKNutzap } from "@nostr-dev-kit/ndk";
import type { NDKWalletChange } from "../../cashu/history";
import createDebug from "debug";
import type NDKWalletLifecycle from ".";
import type { Proof } from "@cashu/cashu-ts";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "../../cashu/wallet";
import type { MintUrl } from "../../cashu/mint/utils";

const d = createDebug("ndk-wallet:lifecycle:nutzap");

class NutzapHandler {
    private lifecycle: NDKWalletLifecycle;
    private _eosed = false;
    private redeemQueue = new Map<NDKEventId, NDKNutzap>();
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
            this.redeem(event);
        }
    }

    /**
     * Called when a wallet change is seen
     */
    public addWalletChange(event: NDKWalletChange) {
        const redeemedIds = event.getMatchingTags("e").map((t) => t[1]);
        redeemedIds.forEach((id) => this.knownRedeemedTokens.add(id));
    }

    async eosed() {
        this._eosed = true;

        // start processing queue of nutzaps
        await this.processRedeemQueue();
    }

    private pushToRedeemQueue(event: NDKEvent) {
        if (this.redeemQueue.has(event.id)) return;

        const nutzap = NDKNutzap.from(event);
        if (!nutzap) return;
        this.redeemQueue.set(nutzap.id, nutzap);
    }

    private async processRedeemQueue() {
        // go through knownRedeemedTokens and remove them from the queue
        for (const id of this.knownRedeemedTokens) {
            this.redeemQueue.delete(id);
        }

        // get a list of all the proofs we are going to try to redeem, group them by mint
        // then validate that we can redeem them
        const mintProofs: Record<string, Proof[]> = {};

        for (const nutzap of this.redeemQueue.values()) {
            const { mint, proofs } = nutzap;
            let existingVal = mintProofs[mint] ?? [];
            existingVal = existingVal.concat(proofs);
            mintProofs[mint] = existingVal;
        }

        // talk to each mint
        for (const [mint, proofs] of Object.entries(mintProofs)) {
            const wallet = this.cashuWallet(mint);
            wallet
                .checkProofsSpent(proofs)
                .then(async (spentProofs) => {
                    const spentProofSecrets = spentProofs.map((p) => p.secret);

                    for (const nutzap of this.redeemQueue.values()) {
                        if (nutzap.mint === mint) {
                            const nutzapProofs = nutzap.proofs;
                            const validProofs = nutzapProofs.filter(
                                (p) => !spentProofSecrets.includes(p.secret)
                            );
                            if (validProofs.length) {
                                nutzap.proofs = validProofs;
                                await this.redeem(nutzap);
                            }
                        }
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
        }
    }

    private findWalletForNutzap(nutzap: NDKNutzap): NDKCashuWallet | undefined {
        const p2pk = nutzap.p2pk;
        let wallet: NDKCashuWallet | undefined;

        if (p2pk) wallet = this.lifecycle.walletsByP2pk.get(p2pk);

        return wallet ?? this.lifecycle.defaultWallet;
    }

    private cashuWallets: Map<string, CashuWallet> = new Map();
    private cashuWallet(mint: MintUrl, unit: string = "sat"): CashuWallet {
        const key = `${mint}:${unit}`;
        let wallet = this.cashuWallets.get(key);
        if (!wallet) {
            wallet = new CashuWallet(new CashuMint(mint), { unit });
            this.cashuWallets.set(key, wallet);
        }

        return wallet;
    }

    private async redeem(event: NDKEvent) {
        if (this.knownRedeemedTokens.has(event.id)) return;
        this.knownRedeemedTokens.add(event.id);

        const nutzap = await NDKNutzap.from(event);
        if (!nutzap) return;

        try {
            const { proofs, mint } = nutzap;
            const wallet = this.findWalletForNutzap(nutzap);
            if (!wallet) {
                const p2pk = nutzap.p2pk;
                throw new Error(
                    "wallet not found for nutzap (p2pk: " + p2pk + ") " + nutzap.content
                );
            }

            // we emit a nutzap:seen event only once we know that we have the private key to attempt to redeem it
            this.lifecycle.emit("nutzap:seen", nutzap);

            const _wallet = this.cashuWallet(mint);

            try {
                const res = await _wallet.receiveTokenEntry(
                    { proofs, mint },
                    {
                        privkey: wallet.privkey,
                    }
                );
                d("redeemed nutzap %o", nutzap.rawEvent());
                this.lifecycle.emit("nutzap:redeemed", nutzap);

                // save new proofs in wallet
                wallet.saveProofs(res, mint, nutzap);
            } catch (e: any) {
                console.error(e.message);
                this.lifecycle.emit("nutzap:failed", nutzap, e.message);
            }
        } catch (e) {
            console.trace(e);
            this.lifecycle.emit("nutzap:failed", nutzap, e);
        }
    }
}

export default NutzapHandler;
