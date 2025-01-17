import { SendResponse, type Proof } from "@cashu/cashu-ts";
import type { MintUrl } from "../mint/utils";
import { NDKCashuWallet } from "../wallet/index.js";
import { CashuPaymentInfo, normalizeUrl } from "@nostr-dev-kit/ndk";
import { correctP2pk } from "../pay";
import { getBolt11Amount } from "../../../utils/ln";
import { walletForMint } from "../mint";
import { WalletOperation, withProofReserve } from "../wallet/effect";
import { payLn } from "./ln";

export type NutPayment = CashuPaymentInfo & { amount: number; unit: string; };

/**
 * Generates proof to satisfy a payment.
 * 
 * This function exclusively creates the sendable proofs in the mint, it doesn't modify
 * the state of the wallet, send tokens or generate any type of event.
 * 
 * When no recipientMints are provided, the function will mint in one of the mints the wallet has enough balance for.
 */
export async function createToken(
    wallet: NDKCashuWallet,
    amount: number,
    unit: string,
    recipientMints?: MintUrl[],
    p2pk?: string,
): Promise<WalletOperation<TokenCreationResult> | null>
{
    p2pk = correctP2pk(p2pk);
    const myMintsWithEnoughBalance = wallet.getMintsWithBalance(amount);
    const hasRecipientMints = recipientMints && recipientMints.length > 0;
    const mintsInCommon = hasRecipientMints ? findMintsInCommon([recipientMints, myMintsWithEnoughBalance]) : myMintsWithEnoughBalance;

    if (unit === 'msat') throw new Error("msat should not reach createToken");

    for (const mint of mintsInCommon) {
        try {
            const res = await createTokenInMint(wallet, mint, amount, p2pk);

            if (res) {
                return res;
            }
        } catch (e) {
            console.log("failed to prepare token for payment from mint %s: %s", mint, e);
        }
    }

    if (hasRecipientMints) {
        return await createTokenWithMintTransfer(wallet, amount, unit, recipientMints, p2pk);
    }

    return null;
}

/**
 * Generates sendable proofs in a specific mint.
 * @param pay 
 * @param mint 
 * @returns 
 */
async function createTokenInMint(
    wallet: NDKCashuWallet,
    mint: MintUrl,
    amount: number,
    p2pk?: string,
): Promise<WalletOperation<TokenCreationResult> | null> {
    const cashuWallet = await wallet.cashuWallet(mint);
    try {
        console.log("Attempting with mint %s", mint);

        const result = await withProofReserve<TokenCreationResult>(
            wallet, cashuWallet, mint, amount, amount, async (proofsToUse, allOurProofs) => {
                const sendResult = await cashuWallet.send(amount, proofsToUse, {
                    pubkey: p2pk,
                    proofsWeHave: allOurProofs,
                });

                return {
                    result: {
                        proofs: sendResult.send,
                        mint,
                    },
                    change: sendResult.keep,
                    mint,
                }
            }
        )

        return result;
    } catch (e: any) {
        console.log(
            "failed to pay with mint %s using proofs %o: %s",
            mint,
            e.message
        );
    }

    return null;
}

/**
 * Iterate through the mints to find one that can satisfy a minting request
 * for the desired amount in any of the mints the recipient accepts.
 */
async function createTokenWithMintTransfer(
    wallet: NDKCashuWallet,
    amount: number,
    unit: string,
    recipientMints: MintUrl[],
    p2pk?: string,
): Promise<WalletOperation<TokenCreationResult> | null> {
    const generateQuote = async () => {
        const generateQuoteFromSomeMint = async (mint: MintUrl) => {
            const targetMintWallet = await walletForMint(mint, unit);
            if (!targetMintWallet) throw new Error("unable to load wallet for mint " + mint);
            const quote = await targetMintWallet.createMintQuote(amount);
            return { quote, mint, targetMintWallet };
        };

        const quotesPromises = recipientMints.map(generateQuoteFromSomeMint);
        const { quote, mint, targetMintWallet } = await Promise.any(quotesPromises);

        if (!quote) {
            console.log("failed to get quote from any mint");
            throw new Error("failed to get quote from any mint");
        }

        return { quote, mint, targetMintWallet };
    }

    // generate quote
    const { quote, mint: targetMint, targetMintWallet } = await generateQuote();
    if (!quote) {
        return null;
    }

    // TODO: create a CashuDeposit event?

    const invoiceAmount = getBolt11Amount(quote.request);
    if (!invoiceAmount) throw new Error("invoice amount is required");
    const invoiceAmountInSat = invoiceAmount / 1000;
    if (invoiceAmountInSat > amount) throw new Error(`invoice amount is more than the amount passed in (${invoiceAmountInSat} vs ${amount})`);

    const payLNResult = await payLn(wallet, quote.request, { amount, unit });
    if (!payLNResult) {
        console.log("payment failed");
        return null;
    }

    let proofs: Proof[] = [];

    try {
        proofs = await targetMintWallet.mintProofs(amount, quote.quote, {
            pubkey: p2pk,
        });
    } catch (e) {
        console.log("failed to mint proofs, fuck, the mint ate the cashu", e);

        // return new Promise((resolve, reject) => {
        //     const retryInterval = setInterval(async () => {
        //         console.log("retrying mint proofs", { quote: quote.quote, mint: targetMintWallet.mint });
        //         try {
        //             proofs = await targetMintWallet.mintProofs(amount, quote.quote, {
        //                 pubkey: p2pk,
        //             });
        //             clearInterval(retryInterval);
        //             resolve({ keep: res.change, send: proofs, mint: targetMint, fee: res.fee });
        //         } catch (e) {
        //             console.log("failed to mint proofs", e);
        //         }
        //     }, 5000);
        //     setTimeout(() => {
        //         reject(e);
        //     }, 1000);
        // });
    }

    return {
        ...payLNResult,
        result: { proofs, mint: targetMint },
        fee: payLNResult.fee,
    }
}

/**
 * The result of generating proofs to pay something, whether it's funded with a swap or LN.
 */
export type TokenCreationResult = {
    proofs: Proof[],
    mint: MintUrl,
}

export type TokenWithMint = SendResponse & { mint: MintUrl, fee?: number };

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
