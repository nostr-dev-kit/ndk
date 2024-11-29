import { SendResponse, Token, type Proof } from "@cashu/cashu-ts";
import type { MintUrl } from "../mint/utils";
import type { NDKCashuPay } from "../pay";
import { NDKCashuWallet } from "../wallet";
import { normalizeUrl } from "@nostr-dev-kit/ndk";

export type NutPayment = { amount: number; unit: string; mints: MintUrl[]; p2pk?: string };

export async function mintNuts(this: NDKCashuWallet, amounts: number[], unit: string) {
    throw new Error("not implemented");
}

/**
 * Generates proof to satisfy a payment.
 * Note that this function doesn't send the proofs to the recipient.
 */
export async function createTokenForPayment(this: NDKCashuPay): Promise<TokenWithMint | undefined> {
    this.debug("payNut %o", this.info);
    
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

    if (mintsInCommon.length === 0) {
        this.debug("no mints in common between sender and recipient");
        return;
    }

    for (const mint of mintsInCommon) {
        const res = await prepareTokenForPaymentFromMint(this, mint);
        if (res) return res;
    }

    return await createTokenForPaymentWithMintTransfer(this);
}

/**
 * Iterate through the mints to find one that can satisfy a minting request
 * for the desired amount in any of the mints the recipient accepts.
 */
async function createTokenForPaymentWithMintTransfer(
    pay: NDKCashuPay
): Promise<TokenWithMint | undefined> {
    const { mints, p2pk } = pay.info as NutPayment;
    const amount = pay.getAmount();

    const generateQuote = async () => {
        const generateQuoteFromSomeMint = async (mint: MintUrl) => {
            const wallet = await pay.wallet.walletForMint(mint);
            const quote = await wallet.createMintQuote(amount);
            return { quote, mint };
        };

        const quotesPromises = mints.map(generateQuoteFromSomeMint);
        const { quote, mint } = await Promise.any(quotesPromises);

        if (!quote) {
            pay.debug("failed to get quote from any mint");
            throw new Error("failed to get quote from any mint");
        }

        pay.debug("quote from mint %s: %o", mint, quote);

        return { quote, mint };
    }

    const { quote, mint } = await generateQuote();
    if (!quote) return;

    // TODO: create a CashuDeposit event

    const res = await pay.wallet.lnPay({ pr: quote.request });
    pay.debug("payment result: %o", res);

    if (!res) {
        pay.debug("payment failed");
        return;
    }

    const wallet = await pay.wallet.walletForMint(mint);
    const proofs = await wallet.mintProofs(amount, quote.quote, {
        pubkey: p2pk,
    });

    pay.debug("minted tokens with proofs %o", proofs);

    return { keep: [], send: proofs, mint };
}

type TokenWithMint = SendResponse & { mint: MintUrl };

async function prepareTokenForPaymentFromMint(
    pay: NDKCashuPay,
    mint: MintUrl
): Promise<TokenWithMint | undefined> {
    const { amount, p2pk } = pay.info as NutPayment;
    const _wallet = await pay.wallet.walletForMint(mint);
    
    try {
        pay.debug("Attempting with mint %s", mint);
        const proofsWeHave = pay.wallet.proofsForMint(mint);
        pay.debug("proofs we have: %o", proofsWeHave);
        const res = await _wallet.send(amount, proofsWeHave, {
            pubkey: p2pk,
            proofsWeHave,
        });
        pay.debug("token preparation result: %o", res);

        return { ...res, mint };
    } catch (e: any) {
        pay.debug(
            "failed to pay with mint %s using proofs %o: %s",
            mint,
            e.message
        );
    }
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
            const normalizedMint = normalizeUrl(mint);
            
            if (!mintCounts.has(normalizedMint)) {
                mintCounts.set(normalizedMint, 1);
            } else {
                mintCounts.set(normalizedMint, mintCounts.get(normalizedMint)! + 1);
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
