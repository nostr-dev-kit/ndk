import type { Proof } from "@cashu/cashu-ts";
import type { MintUrl } from "../mint/utils";
import type { NDKCashuPay } from "../pay";
import { chooseProofsForAmount, chooseProofsForAmounts, rollOverProofs } from "../proofs";
import { NDKCashuWallet } from "../wallet";

export type NutPayment = { amount: number; unit: string; mints: MintUrl[]; p2pk?: string };

export async function mintNuts(this: NDKCashuWallet, amounts: number[], unit: string) {
    return await chooseProofsForAmounts(amounts, this);
}

/**
 * Generates proof to satisfy a payment.
 * Note that this function doesn't send the proofs to the recipient.
 */
export async function payNut(this: NDKCashuPay): Promise<{ proofs: Proof[]; mint: MintUrl }> {
    const data = this.info as NutPayment;
    if (!data.mints) throw new Error("missing mints");

    const recipientMints = data.mints;
    const senderMints = this.wallet.mints;

    const mintsInCommon = findMintsInCommon([recipientMints, senderMints]);

    this.debug(
        "mints in common %o, recipient %o, sender %o",
        mintsInCommon,
        recipientMints,
        senderMints
    );

    if (mintsInCommon.length > 0) {
        try {
            const res = await payNutWithMintBalance(this, mintsInCommon);
            return res;
        } catch (e: any) {
            this.debug("failed to pay with mints in common: %s %o", e.message, mintsInCommon);
        }
    } else {
        this.debug("no mints in common between sender and recipient");
    }

    return await payNutWithMintTransfer(this);
}

async function payNutWithMintTransfer(
    pay: NDKCashuPay
): Promise<{ proofs: Proof[]; mint: MintUrl }> {
    const quotes = [];
    const { mints, p2pk } = pay.info as NutPayment;
    const amount = pay.getAmount();

    // get quotes from the mints the recipient has
    const quotesPromises = mints.map(async (mint) => {
        const wallet = await pay.wallet.walletForMint(mint);
        const quote = await wallet.createMintQuote(amount);
        return { quote, mint };
    });

    // get the first quote that is successful
    const { quote, mint } = await Promise.any(quotesPromises);

    if (!quote) {
        pay.debug("failed to get quote from any mint");
        throw new Error("failed to get quote from any mint");
    }

    pay.debug("quote from mint %s: %o", mint, quote);

    const res = await pay.wallet.lnPay({ pr: quote.request });
    pay.debug("payment result: %o", res);

    if (!res) {
        pay.debug("payment failed");
        throw new Error("payment failed");
    }

    const wallet = await pay.wallet.walletForMint(mint);

    const proofs = await wallet.mintProofs(amount, quote.quote, {
        pubkey: p2pk,
    });

    pay.debug("minted tokens with proofs %o", proofs);

    return { proofs, mint };
}

async function payNutWithMintBalance(
    pay: NDKCashuPay,
    mints: string[]
): Promise<{ proofs: Proof[]; mint: MintUrl }> {
    const { amount, p2pk } = pay.info as NutPayment;

    const mintsWithEnoughBalance = mints.filter((mint) => {
        pay.debug("checking mint %s, balance %d", mint, pay.wallet.mintBalances[mint]);
        return pay.wallet.mintBalances[mint] >= amount;
    });

    pay.debug("mints with enough balance %o", mintsWithEnoughBalance);

    if (mintsWithEnoughBalance.length === 0) {
        pay.debug("no mints with enough balance to satisfy amount %d", amount);
        throw new Error("insufficient balance");
    }

    for (const mint of mintsWithEnoughBalance) {
        const _wallet = await pay.wallet.walletForMint(mint);
        const selection = chooseProofsForAmount(amount, mint, pay.wallet);

        if (!selection) {
            pay.debug("failed to find proofs for amount %d", amount);
            throw new Error("insufficient balance");
        }

        try {
            const res = await _wallet.send(amount, selection.usedProofs, {
                pubkey: p2pk,
            });
            pay.debug("payment result: %o", res);

            rollOverProofs(selection, res.keep, mint, pay.wallet);

            return { proofs: res.send, mint };
        } catch (e: any) {
            pay.debug(
                "failed to pay with mint %s using proofs %o: %s",
                mint,
                selection.usedProofs,
                e.message
            );
            rollOverProofs(selection, [], mint, pay.wallet);
            throw new Error("failed to pay with mint " + e?.message);
        }
    }

    pay.debug("failed to pay with any mint");
    throw new Error("failed to find a mint with enough balance");
}

/**
 * Finds mints in common in the intersection of the arrays of mints
 * @example
 * const user1Mints = ["mint1", "mint2"];
 * const user2Mints = ["mint2", "mint3"];
 * const user3Mints = ["mint1", "mint2"];
 *
 * findMintsInCommon([user1Mints, user2Mints, user3Mints]);
 *
 * // returns ["mint2"]
 */
export function findMintsInCommon(mintCollections: string[][]) {
    const mintCounts = new Map<string, number>();

    for (const mints of mintCollections) {
        for (const mint of mints) {
            if (!mintCounts.has(mint)) {
                mintCounts.set(mint, 1);
            } else {
                mintCounts.set(mint, mintCounts.get(mint)! + 1);
            }
        }
    }

    const commonMints: string[] = [];
    for (const [mint, count] of mintCounts.entries()) {
        if (count === mintCollections.length) {
            commonMints.push(mint);
        }
    }

    return commonMints;
}
