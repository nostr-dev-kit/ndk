import { CheckStateEnum, type Proof, type ProofState } from "@cashu/cashu-ts";
import createDebug from "debug";
import { walletForMint } from "./mint";
import type { NDKCashuWallet } from "./wallet/index.js";
import type { WalletProofChange } from "./wallet/state/index.js";

const d = createDebug("ndk-wallet:cashu:validate");

/**
 * Checks for spent proofs and consolidates all unspent proofs into a single token, destroying all old tokens
 */
export async function consolidateTokens(this: NDKCashuWallet) {
    d("checking %d tokens for spent proofs", this.state.tokens.size);

    const mints = new Set(
        this.state.getMintsProofs({ validStates: new Set(["available", "reserved", "deleted"]) }).keys(),
    );

    d("found %d mints", mints.size);

    mints.forEach((mint) => {
        consolidateMintTokens(mint!, this);
    });
}

export async function consolidateMintTokens(
    mint: string,
    wallet: NDKCashuWallet,
    allProofs?: Proof[],
    onResult?: (walletChange: WalletProofChange) => void,
    onFailure?: (error: string) => void,
) {
    allProofs ??= wallet.state.getProofs({ mint, includeDeleted: true, onlyAvailable: false });
    const _wallet = await walletForMint(mint);
    if (!_wallet) {
        return;
    }
    let proofStates: ProofState[] = [];
    try {
        proofStates = await _wallet.checkProofsStates(allProofs);
    } catch (e: any) {
        onFailure?.(e.message);
        return;
    }

    const spentProofs: Proof[] = [];
    const unspentProofs: Proof[] = [];
    const pendingProofs: Proof[] = [];

    // index stability is guaranteed by cashu-ts
    allProofs.forEach((proof, index) => {
        const { state } = proofStates[index];
        if (state === CheckStateEnum.SPENT) {
            spentProofs.push(proof);
        } else if (state === CheckStateEnum.UNSPENT) {
            unspentProofs.push(proof);
        } else {
            pendingProofs.push(proof);
        }
    });

    const walletChange: WalletProofChange = {
        mint,
        store: unspentProofs,
        destroy: spentProofs,
    };

    onResult?.(walletChange);

    const _totalSpentProofs = spentProofs.reduce((acc, proof) => acc + proof.amount, 0);

    // if no spent proofs return as a noop
    if (walletChange.destroy?.length === 0) return;

    // mark pending proofs as unspent and reserve them
    walletChange.store?.push(...pendingProofs);
    const totalPendingProofs = pendingProofs.reduce((acc, proof) => acc + proof.amount, 0);
    wallet.state.reserveProofs(pendingProofs, totalPendingProofs);

    // Use wallet state update to handle the changes
    return wallet.state.update(walletChange, "Consolidate");
}
