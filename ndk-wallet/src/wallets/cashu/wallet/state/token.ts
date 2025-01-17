import { Proof } from "@cashu/cashu-ts";
import { WalletState } from ".";
import { NDKCashuToken } from "../../token";
import { NDKEventId } from "@nostr-dev-kit/ndk";

/**
 * Adds or updates the token in the wallet state, optionally associating proofs with the token
 */
export function addToken(
    this: WalletState,
    token: NDKCashuToken,
) {
    if (!token.mint) throw new Error("BUG: Token has no mint");

    if (this.tokens.get(token.id) === "deleted") {
        return;
    }

    this.tokens.set(token.id, token);

    // go through the proofs this token is claiming
    let added = 0;
    let invalid = 0;
    for (const proof of token.proofs) {
        const val = maybeAssociateProofWithToken(this, proof, token);
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
): boolean | null {
    const proofC = proof.C;
    const proofEntry = walletState.proofs.get(proofC);

    if (!proofEntry) {
        walletState.addProof(proof, {
            mint: token.mint!,
            state: "available",
            tokenId: token.id,
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
            const existingToken = walletState.tokens.get(proofEntry.tokenId) as NDKCashuToken | undefined;
            if (!existingToken) {
                throw new Error("BUG: Token id " + proofEntry.tokenId + " not found, was expected to be associated with proof " + proofC);
            }

            // existing token didnt have a timestamp or the incoming token is newer
            if (existingToken.created_at && (!token.created_at || token.created_at < existingToken.created_at)) {
                // either the incoming token is older or it doesnt have a timestamp
                return false;
            }

            // update the proof entry
            walletState.updateProof(proof, { tokenId: token.id });
            return true;
        } else { // not associated with any token
            walletState.updateProof(proof, { tokenId: token.id });
            return true;
        }
    }
}

export function removeTokenId(
    this: WalletState,
    tokenId: NDKEventId,
) {
    this.tokens.set(tokenId, "deleted");

    // remove all proofs associated with this token
    for (const proof of this.proofs.values()) {
        if (proof.tokenId === tokenId) {
            if (!proof.proof) {
                throw new Error("BUG: Proof entry has no proof");
            }
            this.proofs.delete(proof.proof.C);
        }
    }
}