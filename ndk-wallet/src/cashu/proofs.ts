import type { MeltQuoteResponse, Proof } from "@cashu/cashu-ts";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "./wallet";
import { NDKCashuToken } from "./token";
import createDebug from "debug";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

const d = createDebug("ndk-wallet:cashu:proofs");

export type TokenSelection = {
    usedProofs: Proof[];
    movedProofs: Proof[];
    usedTokens: NDKCashuToken[];
    quote?: MeltQuoteResponse;
    mint: string;
};

/**
 * Gets a melt quote from a payment request for a mint and tries to get
 * proofs that satisfy the amount.
 * @param pr
 * @param mint
 * @param wallet
 */
export async function chooseProofsForPr(
    pr: string,
    mint: string,
    wallet: NDKCashuWallet
): Promise<TokenSelection | undefined> {
    const _wallet = new CashuWallet(new CashuMint(mint));
    const quote = await _wallet.meltQuote(pr);
    return chooseProofsForQuote(quote, wallet, mint);
}

export function chooseProofsForAmount(
    amount: number,
    mint: string,
    wallet: NDKCashuWallet
): TokenSelection | undefined {
    const mintTokens = wallet.mintTokens[mint];
    let remaining = amount;
    const usedProofs: Proof[] = [];
    const movedProofs: Proof[] = [];
    const usedTokens: NDKCashuToken[] = [];

    if (!mintTokens) {
        d("unexpected missing array of tokens for mint %s", mint);
        return;
    }

    for (const token of mintTokens) {
        if (remaining <= 0) break;

        let tokenUsed = false;
        for (const proof of token.proofs) {
            if (remaining > 0) {
                usedProofs.push(proof);
                remaining -= proof.amount;
                d(
                    "%s adding proof for amount %d, with %d remaining of total required",
                    mint,
                    proof.amount,
                    remaining,
                    amount
                );
                tokenUsed = true;
            } else {
                movedProofs.push(proof);
            }
        }

        if (tokenUsed) {
            usedTokens.push(token);
        }
    }

    if (remaining > 0) {
        d(
            "insufficient tokens to satisfy amount %d, mint %s had %d",
            amount,
            mint,
            amount - remaining
        );
        return;
    }

    d(
        "%s mint, used %d proofs and %d tokens to satisfy amount %d",
        mint,
        usedProofs.length,
        usedTokens.length,
        amount
    );

    return { usedProofs, movedProofs, usedTokens, mint };
}

function chooseProofsForQuote(
    quote: MeltQuoteResponse,
    wallet: NDKCashuWallet,
    mint: string
): TokenSelection | undefined {
    const amount = quote.amount + quote.fee_reserve;

    d("quote for mint %s is %o", mint, quote);

    const res = chooseProofsForAmount(amount, mint, wallet);
    if (!res) {
        d("failed to find proofs for amount %d", amount);
        return;
    }

    return { ...res, quote };
}

/**
 * Deletes and creates new events to reflect the new state of the proofs
 */
export async function rollOverProofs(
    proofs: TokenSelection,
    changes: Proof[],
    mint: string,
    wallet: NDKCashuWallet
) {
    const relaySet = wallet.relaySet;

    if (proofs.usedTokens.length > 0) {
        console.trace("rolling over proofs for mint %s %d tokens", mint, proofs.usedTokens.length);

        const deleteEvent = new NDKEvent(wallet.ndk);
        deleteEvent.kind = NDKKind.EventDeletion;
        deleteEvent.tags = [["k", NDKKind.CashuToken.toString()]];

        proofs.usedTokens.forEach((token) => {
            d(
                "adding to delete a token that was seen on relay %s %o",
                token.relay?.url,
                token.onRelays
            );
            deleteEvent.tag(["e", token.id]);
            if (token.relay) relaySet?.addRelay(token.relay);
        });

        await deleteEvent.sign();
        d("delete event %o sending to %s", deleteEvent.rawEvent(), relaySet?.relayUrls);
        deleteEvent.publish(relaySet);
    }
    wallet.addUsedTokens(proofs.usedTokens);

    const proofsToSave = proofs.movedProofs;
    for (const change of changes) {
        proofsToSave.push(change);
    }

    if (proofsToSave.length === 0) {
        d("no new proofs to save");
        return;
    }

    const tokenEvent = new NDKCashuToken(wallet.ndk);
    tokenEvent.proofs = proofsToSave;
    tokenEvent.mint = mint;
    tokenEvent.wallet = wallet;
    await tokenEvent.sign();
    d("saving %d new proofs", proofsToSave.length);

    wallet.addToken(tokenEvent);

    tokenEvent.publish(wallet.relaySet);
    d("created new token event", tokenEvent.rawEvent());
}
