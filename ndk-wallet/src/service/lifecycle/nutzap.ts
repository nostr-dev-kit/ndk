import type { NDKEvent, NDKEventId } from "@nostr-dev-kit/ndk";
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
}

export default NutzapHandler;
