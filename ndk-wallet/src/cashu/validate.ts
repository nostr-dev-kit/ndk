import type { Proof } from "@cashu/cashu-ts";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import type { NDKCashuToken } from "./token";
import createDebug from "debug";
import { rollOverProofs } from "./proofs";
import type { NDKCashuWallet } from "./wallet";

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
        if (spentProofsSet.has(proof.id)) {
            dirty = true;
            spentProofs.push(proof);
        } else {
            unspentProofs.push(proof);
        }
    }

    return { dirty, unspentProofs, spentProofs };
}

export async function checkTokenProofs(this: NDKCashuWallet, tokens?: NDKCashuToken[]) {
    if (!tokens) {
        tokens = this.tokens;
    }

    d("checking %d tokens for spent proofs", tokens.length);

    const mints = new Set(tokens.map((t) => t.mint).filter((mint) => !!mint));

    d("found %d mints", mints.size);

    mints.forEach((mint) => {
        checkTokenProofsForMint(
            mint!,
            tokens.filter((t) => t.mint === mint),
            this
        );
    });
}

export async function checkTokenProofsForMint(
    mint: string,
    tokens: NDKCashuToken[],
    wallet: NDKCashuWallet
) {
    const allProofs = tokens.map((t) => t.proofs).flat();
    const _wallet = new CashuWallet(new CashuMint(mint));
    d(
        "checking %d proofs in %d tokens for spent proofs for mint %s",
        allProofs.length,
        tokens.length,
        mint
    );
    const spentProofs = await _wallet.checkProofsSpent(allProofs);
    d("found %d spent proofs for mint %s", spentProofs.length, mint);

    for (const spent of spentProofs) {
        d("%s: spent proof %s", mint, spent.id);
    }

    const spentProofsSet = new Set(spentProofs.map((p) => p.id));
    const tokensToDestroy: NDKCashuToken[] = [];
    const proofsToSave: Proof[] = [];

    for (const token of tokens) {
        const { dirty, unspentProofs, spentProofs } = checkInvalidToken(token, spentProofsSet);
        if (dirty) {
            tokensToDestroy.push(token);
            proofsToSave.push(...unspentProofs);
            console.log(
                "👉 token has spent proofs",
                spentProofs.map((p) => p.id),
                token.rawEvent(),
                token.onRelays,
                token.relay
            );
        }
    }

    d(
        "destroying %d tokens with %dspent proofs, moving %d proofs",
        tokensToDestroy.length,
        spentProofs.length,
        proofsToSave.length
    );

    rollOverProofs(
        {
            usedProofs: spentProofs,
            movedProofs: proofsToSave,
            usedTokens: tokensToDestroy,
            mint,
        },
        [],
        mint,
        wallet
    );

    return spentProofs;
}
