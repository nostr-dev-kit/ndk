import { Proof } from "@cashu/cashu-ts";
import { WalletState } from ".";
import { NDKCashuToken, NDKEventId } from "@nostr-dev-kit/ndk";

/**
 * Adds or updates the token in the wallet state, optionally associating proofs with the token
 */
export function addToken(this: WalletState, token: NDKCashuToken) {
    if (!token.mint) throw new Error("BUG: Token has no mint");

    const currentEntry = this.tokens.get(token.id);
    const state = currentEntry?.state ?? "available";

    this.tokens.set(token.id, { token, state });

    // go through the proofs this token is claiming
    let added = 0;
    let invalid = 0;
    for (const proof of token.proofs) {
        const val = maybeAssociateProofWithToken(this, proof, token, state);
        if (val === false) {
            invalid++;
        } else {
            added++;
        }
    }
}

function maybeAssociateProofWithToken(
    walletState: WalletState,
    proof: Proof,
    token: NDKCashuToken,
    state: "available" | "reserved" | "deleted"
): boolean | null {
    const proofC = proof.C;
    const proofEntry = walletState.proofs.get(proofC);

    if (!proofEntry) {
        walletState.addProof({
            mint: token.mint!,
            state,
            tokenId: token.id,
            timestamp: token.created_at!,
            proof: proof,
        });
        return true;
    } else {
        // already associated
        if (proofEntry.tokenId) {
            if (proofEntry.tokenId === token.id) {
                // already associated with this token, nothing to do
                return null;
            }

            // different token id, ensure the incoming token is newer
            const existingTokenEntry = walletState.tokens.get(proofEntry.tokenId);
            if (!existingTokenEntry) {
                throw new Error(
                    "BUG: Token id " +
                        proofEntry.tokenId +
                        " not found, was expected to be associated with proof " +
                        proofC
                );
            }
            const existingToken = existingTokenEntry.token;

            if (existingToken) {
                // existing token didnt have a timestamp or the incoming token is newer
                if (
                    existingToken.created_at &&
                    (!token.created_at || token.created_at < existingToken.created_at)
                ) {
                    // either the incoming token is older or it doesnt have a timestamp
                    return false;
                }
            }

            // update the proof entry
            walletState.updateProof(proof, { tokenId: token.id, state });
            return true;
        } else {
            // not associated with any token
            walletState.updateProof(proof, { tokenId: token.id, state });
            return true;
        }
    }
}

export function removeTokenId(this: WalletState, tokenId: NDKEventId) {
    const currentEntry = this.tokens.get(tokenId) || {};

    this.tokens.set(tokenId, { ...currentEntry, state: "deleted" });

    // remove all proofs associated with this token
    for (const proofEntry of this.proofs.values()) {
        const { proof } = proofEntry;
        if (proofEntry.tokenId === tokenId) {
            if (!proof) {
                throw new Error("BUG: Proof entry has no proof");
            }

            this.updateProof(proof, { state: "deleted" });
        }
    }
}
