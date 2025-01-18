import { CheckStateEnum, ProofState, type Proof } from "@cashu/cashu-ts";
import createDebug from "debug";
import type { NDKCashuWallet } from "./wallet/index.js";
import { walletForMint } from "./mint";
import { WalletProofChange } from "./wallet/state/index.js";
import { createOutTxEvent } from "./wallet/txs.js";

const d = createDebug("ndk-wallet:cashu:validate");

/**
 * Checks for spent proofs and consolidates all unspent proofs into a single token, destroying all old tokens
 */
export async function consolidateTokens(this: NDKCashuWallet) {
    d("checking %d tokens for spent proofs", this.state.tokens.size);

    const mints = new Set(this.state.getMintsProofs({ validStates: new Set(["available"]) }).keys());

    d("found %d mints", mints.size);

    mints.forEach((mint) => {
        consolidateMintTokens(
            mint!,
            this
        );
    });
}

export async function consolidateMintTokens(
    mint: string,
    wallet: NDKCashuWallet
) {
    const allProofs = wallet.state.getProofs({ mint });
    const _wallet = await walletForMint(mint, wallet.unit);
    if (!_wallet) {
        console.log("could not get wallet for mint %s", mint);
        return;
    }
    console.log(
        "checking %d proofs for spent proofs for mint %s",
        allProofs.length,
        mint
    );
    let proofStates: ProofState[] = [];
    try {
        proofStates = await _wallet.checkProofsStates(allProofs);
    } catch (e: any) {
        console.log("failed to check proof states", e.message);
        return;
    }

    const spentProofs: Proof[] = [];
    const unspentProofs: Proof[] = [];

    // index stability is guaranteed by cashu-ts
    allProofs.forEach((proof, index) => {
        const { state } = proofStates[index];
        if (state === CheckStateEnum.SPENT) {
            spentProofs.push(proof);
        } else if (state === CheckStateEnum.UNSPENT) {
            unspentProofs.push(proof);
        }
    });

    const walletChange: WalletProofChange = {
        mint,
        store: unspentProofs,
        destroy: spentProofs,
    }

    const totalSpentProofs = spentProofs.reduce((acc, proof) => acc + proof.amount, 0);

    console.log("Found %d spent proofs and %d unspent proofs", walletChange.destroy?.length, walletChange.store?.length);
    
    // if no spent proofs return as a noop
    if (walletChange.destroy?.length === 0) return;
    
    // Use wallet state update to handle the changes
    return wallet.state.update(walletChange);
}
