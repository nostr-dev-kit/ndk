import { CheckStateEnum, ProofState, type Proof } from "@cashu/cashu-ts";
import { NDKCashuToken } from "./token";
import createDebug from "debug";
import type { NDKCashuWallet } from "./wallet/index.js";
import { NDKEvent, NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
import { walletForMint } from "./mint";

const d = createDebug("ndk-wallet:cashu:validate");

/**
 * Checks for spent proofs and consolidates all unspent proofs into a single token, destroying all old tokens
 */
export async function consolidateTokens(this: NDKCashuWallet) {
    d("checking %d tokens for spent proofs", this.tokens.length);

    const mints = new Set(this.tokens.map((t) => t.mint).filter((mint) => !!mint));

    d("found %d mints", mints.size);

    mints.forEach((mint) => {
        consolidateMintTokens(
            mint!,
            this.tokens.filter((t) => t.mint === mint),
            this
        );
    });
}

export async function consolidateMintTokens(
    mint: string,
    tokens: NDKCashuToken[],
    wallet: NDKCashuWallet
) {
    const allProofs = tokens.map((t) => t.proofs).flat();
    const _wallet = await walletForMint(mint, wallet.unit);
    if (!_wallet) return;
    d(
        "checking %d proofs in %d tokens for spent proofs for mint %s",
        allProofs.length,
        tokens.length,
        mint
    );
    const proofStates = await _wallet.checkProofsStates(allProofs);

    const spentProofs: Proof[] = [];
    const unspentProofs: Proof[] = [];

    allProofs.forEach((proof, index) => {
        const { state } = proofStates[index];
        if (state === CheckStateEnum.SPENT) {
            spentProofs.push(proof);
        } else if (state === CheckStateEnum.UNSPENT) {
            unspentProofs.push(proof);
        }
    });
        
    d("Found %d spent proofs and %d unspent proofs", spentProofs.length, unspentProofs.length);
    
    // if no spent proofs and we already had a single token, return as a noop
    if (spentProofs.length === 0 && tokens.length === 1) {
        d("No spent proofs and we already had a single token, skipping %s", mint);
        return;
    }

    // Use wallet state update to handle the changes
    await wallet.state.update({
        store: unspentProofs,
        destroy: spentProofs,
        mint,
    });
}
