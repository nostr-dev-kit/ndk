import { CheckStateEnum, ProofState, type Proof } from "@cashu/cashu-ts";
import { NDKCashuToken } from "./token";
import createDebug from "debug";
import type { NDKCashuWallet } from "./wallet/index.js";
import { hashToCurve } from '@cashu/crypto/modules/common';
import { rollOverProofs } from "./proofs";
import { NDKEvent, NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
import { walletForMint } from "./mint";

const d = createDebug("ndk-wallet:cashu:validate");

function checkInvalidToken(token: NDKCashuToken, spentProofsSet: Set<string>) {
    const unspentProofs: Proof[] = [];
    const spentProofs: Proof[] = [];
    let dirty = false;

    if (token.proofs.length === 0) {
        d("token %s has no proofs", token.id);
        return { dirty: true, unspentProofs, spentProofs };
    }

    for (const proof of token.proofs) {
        if (spentProofsSet.has(proof.secret)) {
            dirty = true;
            spentProofs.push(proof);
        } else {
            unspentProofs.push(proof);
        }
    }

    return { dirty, unspentProofs, spentProofs };
}

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
        
    console.log({
        spentProofs,
        unspentProofs,
    })
    
    // if no spent proofs and we already had a single token, return as a noop
    if (spentProofs.length === 0 && tokens.length === 1) {
        console.log("no spent proofs and we already had a single token, skipping", mint);
        return;
    }

    if (unspentProofs.length > 0) {
        // create a new token with all the unspent proofs
        const newToken = new NDKCashuToken(wallet.ndk);
        newToken.proofs = unspentProofs;
        newToken.mint = mint;
        newToken.wallet = wallet;
        await newToken.publish(wallet.relaySet);

        console.log("published new token", newToken.id)
    } else {
        console.log("no unspent proofs, skipping creating new token", mint);
    }

    // mark the tokens as used
    wallet.addUsedTokens(tokens)
    console.log('destroying ', tokens.length, 'tokens')
    
    // destroy all old tokens
    const deleteEvent = new NDKEvent(wallet.ndk, { kind: NDKKind.EventDeletion } as NostrEvent);

    for (const token of tokens) {
        deleteEvent.tags.push([ "e", token.id ]);
    }
    await deleteEvent.publish(wallet.relaySet);
}
