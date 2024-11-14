import type { Proof } from "@cashu/cashu-ts";
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
    const _wallet = await wallet.walletForMint(mint);
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
    const proofsToSave: Map<string, Proof> = new Map();

    for (const token of tokens) {
        const { dirty, unspentProofs, spentProofs } = checkInvalidToken(token, spentProofsSet);
        if (dirty) {
            tokensToDestroy.push(token);

            for (const proof of unspentProofs) {
                const id = proof.secret;
                proofsToSave.set(id, proof);
            }
            
            d(
                "👉 token %s has spent proofs",
                token.id.slice(0, 6),
                spentProofs.map((p) => p.secret.slice(0, 4)),
            );
        }
    }

    d(
        "destroying %d tokens with %d spent proofs, moving %d proofs",
        tokensToDestroy.length,
        spentProofs.length,
        proofsToSave.size
    );

    const res = await rollOverProofs(
        {
            usedProofs: spentProofs,
            movedProofs: Array.from(proofsToSave.values()),
            usedTokens: tokensToDestroy,
            mint,
        },
        [],
        mint,
        wallet
    );

    d(
        "rolled over proofs for mint %s, destroyed %d tokens, created %s token",
            mint,
            res.destroyedTokens.length,
            res.createdToken?.id ?? "no new"
    );

    return res;
}
