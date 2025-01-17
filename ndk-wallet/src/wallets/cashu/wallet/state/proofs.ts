import { Proof } from "@cashu/cashu-ts";
import { ProofC, type ProofState, ProofEntryWithProof, WalletState, ProofEntry } from "./index.js";
import { MintUrl } from "../../mint/utils.js";
import { NDKEventId } from "@nostr-dev-kit/ndk";

export function addProof(this: WalletState,
    proof: Proof,
    {
        mint,
        state,
        tokenId,
    }: {
        mint: MintUrl,
        state: ProofState,
        tokenId?: NDKEventId,
    }
) {
    this.proofs.set(proof.C, {
        proof,
        mint,
        state,
        tokenId,
    });
}

export function reserveProofs(
    this: WalletState,
    proofs: Proof[],
    amount: number
) {
    for (const proof of proofs) {
        this.updateProof(proof, { state: "reserved" });
    }

    this.reserveAmounts.push(amount);
}

export function unreserveProofs(
    this: WalletState,
    proofs: Proof[],
    amount: number,
    newState: "available" | "deleted"
) {
    for (const proof of proofs) {
        this.updateProof(proof, { state: newState });
    }

    const index = this.reserveAmounts.indexOf(amount);
    if (index !== -1) {
        this.reserveAmounts.splice(index, 1);
    } else {
        throw new Error("BUG: Amount "+ amount +" not found in reserveAmounts");
    }
}


export type GetProofsOpts = {
    mint?: MintUrl,
    onlyAvailable?: boolean,
};

export function getProofEntries(
    this: WalletState,
    { mint, onlyAvailable }: GetProofsOpts = { onlyAvailable: true }
): Array<ProofEntryWithProof> {
    const proofs = new Map<ProofC, ProofEntryWithProof>();

    const validStates = new Set(['available']);
    if (!onlyAvailable) validStates.add('reserved');

    for (const proofEntry of this.proofs.values()) {
        if (mint && proofEntry.mint !== mint) continue;
        if (!validStates.has(proofEntry.state)) continue;
        if (!proofEntry.proof) continue;

        proofs.set(proofEntry.proof.C, proofEntry as ProofEntryWithProof);
    }

    return Array.from(proofs.values());
}

export function updateProof(
    this: WalletState,
    proof: Proof,
    state: Partial<ProofEntry>
) {
    const proofC = proof.C;
    const currentState = this.proofs.get(proofC) || {};
    const newState = { ...currentState, ...state };
    if (!newState.mint) throw new Error("Proof has no mint");
    this.proofs.set(proofC, newState as ProofEntry);
}