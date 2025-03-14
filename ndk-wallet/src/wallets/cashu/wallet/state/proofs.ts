import { Proof } from "@cashu/cashu-ts";
import { ProofC, ProofEntry, WalletState } from "./index.js";
import { MintUrl } from "../../mint/utils.js";

export function addProof(this: WalletState, proofEntry: ProofEntry) {
    this.proofs.set(proofEntry.proof.C, proofEntry);
    this.journal.push({
        memo: "Added proof",
        timestamp: Date.now(),
        metadata: {
            type: "proof",
            id: proofEntry.proof.C,
            amount: proofEntry.proof.amount,
            mint: proofEntry.mint,
        },
    });
}

export function reserveProofs(this: WalletState, proofs: Proof[], amount: number) {
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
        throw new Error("BUG: Amount " + amount + " not found in reserveAmounts");
    }
}

export type GetOpts = {
    mint?: MintUrl;
    onlyAvailable?: boolean;
    includeDeleted?: boolean;
};

export function getProofEntries(this: WalletState, opts: GetOpts = {}): Array<ProofEntry> {
    const proofs = new Map<ProofC, ProofEntry>();

    const validStates = new Set(["available"]);
    let { mint, onlyAvailable, includeDeleted } = opts;
    onlyAvailable ??= true;
    if (!onlyAvailable) validStates.add("reserved");
    if (includeDeleted) validStates.add("deleted");

    for (const proofEntry of this.proofs.values()) {
        if (mint && proofEntry.mint !== mint) continue;
        if (!validStates.has(proofEntry.state)) continue;
        if (!proofEntry.proof) continue;

        proofs.set(proofEntry.proof.C, proofEntry as ProofEntry);
    }

    return Array.from(proofs.values());
}

export function updateProof(this: WalletState, proof: Proof, state: Partial<ProofEntry>) {
    const proofC = proof.C;
    const currentState = this.proofs.get(proofC);
    if (!currentState) throw new Error("Proof not found");
    const newState = { ...currentState, ...state };
    this.proofs.set(proofC, newState as ProofEntry);

    this.journal.push({
        memo: "Updated proof state: " + JSON.stringify(state),
        timestamp: Date.now(),
        metadata: {
            type: "proof",
            id: proofC,
            amount: proof.amount,
            mint: currentState.mint,
        },
    });
}
