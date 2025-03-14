import { CashuWallet, Proof, CheckStateEnum } from "@cashu/cashu-ts";
import { NDKNutzap } from "@nostr-dev-kit/ndk";

/**
 * Checks which proofs are unspent and returns the nutzap ids and proofs.
 *
 * It performs a sanity check on the proofs to ensure that we can spend them.
 * @param wallet
 * @param nutzaps
 * @param pubkeys -- Pubkeys the caller has the private key to, to make sure the proofs are not p2pk-locked to a key we do not have access to
 * @returns
 */
export async function getProofSpendState(
    wallet: CashuWallet,
    nutzaps: NDKNutzap[]
): Promise<GetProofSpendStateResult> {
    const result: GetProofSpendStateResult = {
        unspentProofs: [],
        spentProofs: [],
        nutzapsWithUnspentProofs: [],
        nutzapsWithSpentProofs: [],
    };

    const proofCs = new Set<string>();
    const proofs: Proof[] = [];
    const nutzapMap = new Map<string, NDKNutzap>(); // Map proof C to nutzap

    // Collect unique proofs
    for (const nutzap of nutzaps) {
        for (const proof of nutzap.proofs) {
            if (proofCs.has(proof.C)) continue;
            proofCs.add(proof.C);
            proofs.push(proof);
            nutzapMap.set(proof.C, nutzap);
        }
    }

    const states = await wallet.checkProofsStates(proofs);

    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        const proof = proofs[i];
        const nutzap = nutzapMap.get(proof.C);

        if (!nutzap) continue;

        if (state.state === CheckStateEnum.SPENT) {
            result.spentProofs.push(proof);
            if (!result.nutzapsWithSpentProofs.some((n) => n.id === nutzap.id)) {
                result.nutzapsWithSpentProofs.push(nutzap);
            }
        } else if (state.state === CheckStateEnum.UNSPENT) {
            result.unspentProofs.push(proof);
            if (!result.nutzapsWithUnspentProofs.some((n) => n.id === nutzap.id)) {
                result.nutzapsWithUnspentProofs.push(nutzap);
            }
        }
    }

    return result;
}

type GetProofSpendStateResult = {
    unspentProofs: Proof[];
    spentProofs: Proof[];
    nutzapsWithUnspentProofs: NDKNutzap[];
    nutzapsWithSpentProofs: NDKNutzap[];
};
