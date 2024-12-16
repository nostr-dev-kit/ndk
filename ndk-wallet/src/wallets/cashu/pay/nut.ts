import { SendResponse, type Proof } from "@cashu/cashu-ts";
import type { MintUrl } from "../mint/utils";
import type { NDKCashuPay } from "../pay";
import { NDKCashuWallet } from "../wallet";
import { CashuPaymentInfo, NDKZapDetails, normalizeUrl } from "@nostr-dev-kit/ndk";

export type NutPayment = CashuPaymentInfo & { amount: number; unit: string; };

export async function mintNuts(this: NDKCashuWallet, amounts: number[], unit: string) {
    throw new Error("not implemented");
}

/**
 * Generates proof to satisfy a payment.
 * Note that this function doesn't send the proofs to the recipient.
 */
export async function createTokenForPayment(this: NDKCashuPay, payment: NDKZapDetails<NutPayment>): Promise<TokenWithMint | undefined> {
    console.log("payNut %o", this.info);
    
    const data = this.info as NutPayment;
    if (!data.mints) throw new Error("missing mints");

    const recipientMints = data.mints;
    const senderMints = this.wallet.mints;

    const mintsInCommon = findMintsInCommon([recipientMints, senderMints]);

    console.log(
        "mints in common %o, recipient %o, sender %o",
        mintsInCommon,
        recipientMints,
        senderMints
    );

    if (mintsInCommon.length === 0) {
        console.log("no mints in common between sender and recipient");
    }

    for (const mint of mintsInCommon) {
        try {
            console.log("attempting payment with mint %s", mint);
            const res = await prepareTokenForPaymentFromMint(this, mint);
            if (res) return res;
        } catch (e) {
            console.log("failed to prepare token for payment from mint %s: %s", mint, e);
        }
    }

    console.log("attempting payment with mint transfer");

    return await createTokenForPaymentWithMintTransfer(this, payment);
}

/**
 * Iterate through the mints to find one that can satisfy a minting request
 * for the desired amount in any of the mints the recipient accepts.
 */
async function createTokenForPaymentWithMintTransfer(
    pay: NDKCashuPay, 
    payment: NDKZapDetails<CashuPaymentInfo>
): Promise<TokenWithMint | undefined> {
    const { mints, p2pk } = payment;
    const amount = pay.getAmount();

    const generateQuote = async () => {
        const generateQuoteFromSomeMint = async (mint: MintUrl) => {
            const wallet = await pay.wallet.walletForMint(mint);
            if (!wallet) throw new Error("unable to load wallet for mint " + mint);
            const quote = await wallet.createMintQuote(amount);
            return { quote, mint };
        };

        const quotesPromises = mints.map(generateQuoteFromSomeMint);
        const { quote, mint } = await Promise.any(quotesPromises);

        if (!quote) {
            console.log("failed to get quote from any mint");
            throw new Error("failed to get quote from any mint");
        }

        console.log("quote from mint %s: %o", mint, quote);

        return { quote, mint };
    }

    const { quote, mint } = await generateQuote();
    if (!quote) return;

    // TODO: create a CashuDeposit event

    const res = await pay.wallet.lnPay({ pr: quote.request, ...payment });
    console.log("payment result: %o", res);

    if (!res) {
        console.log("payment failed");
        return;
    }

    const wallet = await pay.wallet.walletForMint(mint);
    if (!wallet) throw new Error("unable to load wallet for mint " + mint);
    const proofs = await wallet.mintProofs(amount, quote.quote, {
        pubkey: p2pk,
    });

    console.log("minted tokens with proofs %o", proofs);

    return { keep: [], send: proofs, mint };
}

type TokenWithMint = SendResponse & { mint: MintUrl };

async function prepareTokenForPaymentFromMint(
    pay: NDKCashuPay,
    mint: MintUrl
): Promise<TokenWithMint | undefined> {
    const { amount, p2pk } = pay.info as NutPayment;
    const _wallet = await pay.wallet.walletForMint(mint);
    if (!_wallet) throw new Error("unable to load wallet for mint " + mint);
    try {
        // pay.debug
        console.log("Attempting with mint %s", mint);
        const proofsWeHave = pay.wallet.proofsForMint(mint);
        console.log("proofs we have: %o", proofsWeHave);
        const res = await _wallet.send(amount, proofsWeHave, {
            pubkey: p2pk,
            proofsWeHave,
        });
        console.log("token preparation result: %o", res);

        return { ...res, mint };
    } catch (e: any) {
        console.log(
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
