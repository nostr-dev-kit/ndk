import type { Proof, SendResponse } from "@cashu/cashu-ts";
import { type CashuPaymentInfo, normalizeUrl } from "@nostr-dev-kit/ndk";
import { ensureIsCashuPubkey, mintProofs } from "../../../utils/cashu";
import { getBolt11Amount } from "../../../utils/ln";
import { walletForMint } from "../mint";
import type { MintUrl } from "../mint/utils";
import { type WalletOperation, withProofReserve } from "../wallet/effect";
import type { NDKCashuWallet } from "../wallet/index.js";
import { payLn } from "./ln";

export type NutPayment = CashuPaymentInfo & { amount: number };

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
    recipientMints?: MintUrl[],
    p2pk?: string,
    proofTags?: [string, string][],
): Promise<WalletOperation<TokenCreationResult> | null> {
    console.log("[createToken] Starting token creation", {
        amount,
        recipientMints,
        p2pk,
    });

    p2pk = ensureIsCashuPubkey(p2pk);
    const myMintsWithEnoughBalance = wallet.getMintsWithBalance(amount);
    console.log("[createToken] My mints with enough balance", myMintsWithEnoughBalance);

    const hasRecipientMints = recipientMints && recipientMints.length > 0;
    const mintsInCommon = hasRecipientMints
        ? findMintsInCommon([recipientMints, myMintsWithEnoughBalance])
        : myMintsWithEnoughBalance;

    console.log("[createToken] Mints in common", {
        hasRecipientMints,
        mintsInCommon,
    });

    for (const mint of mintsInCommon) {
        console.log("[createToken] Attempting to create token in mint", mint);
        try {
            const res = await createTokenInMint(wallet, mint, amount, p2pk, proofTags);

            if (res) {
                console.log("[createToken] Successfully created token in mint", mint);
                return res;
            }
            console.log("[createToken] Failed to create token in mint", mint);
        } catch (e: any) {
            console.error("[createToken] Error creating token in mint", mint, e);
        }
    }

    if (hasRecipientMints) {
        console.log("[createToken] Attempting cross-mint transfer");
        return await createTokenWithMintTransfer(wallet, amount, recipientMints, p2pk, proofTags);
    }

    console.error("[createToken] All token creation attempts failed");
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
    proofTags?: [string, string][],
): Promise<WalletOperation<TokenCreationResult> | null> {
    console.log("[createTokenInMint] Starting", { mint, amount, p2pk });

    const cashuWallet = await wallet.getCashuWallet(mint);
    console.log("[createTokenInMint] Got cashu wallet for mint", mint);

    try {
        const result = await withProofReserve<TokenCreationResult>(
            wallet,
            cashuWallet,
            mint,
            amount,
            amount,
            async (proofsToUse, allOurProofs) => {
                console.log("[createTokenInMint] Inside withProofReserve callback", {
                    proofsToUseCount: proofsToUse.length,
                    allOurProofsCount: allOurProofs.length,
                });

                const sendResult = await cashuWallet.send(amount, proofsToUse, {
                    pubkey: p2pk,
                    proofsWeHave: allOurProofs,
                    ...(proofTags && proofTags.length > 0 ? { tags: proofTags } : {}),
                });

                console.log("[createTokenInMint] Send result", {
                    sendCount: sendResult.send.length,
                    keepCount: sendResult.keep.length,
                });

                return {
                    result: {
                        proofs: sendResult.send,
                        mint,
                    },
                    change: sendResult.keep,
                    mint,
                };
            },
        );

        console.log("[createTokenInMint] Success", result);
        return result;
    } catch (e: any) {
        console.error("[createTokenInMint] Error", { mint, error: e.message, stack: e.stack });
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
    recipientMints: MintUrl[],
    p2pk?: string,
    proofTags?: [string, string][],
): Promise<WalletOperation<TokenCreationResult> | null> {
    const generateQuote = async () => {
        const generateQuoteFromSomeMint = async (mint: MintUrl) => {
            const targetMintWallet = await walletForMint(mint);
            if (!targetMintWallet) throw new Error(`unable to load wallet for mint ${mint}`);
            const quote = await targetMintWallet.createMintQuote(amount);
            return { quote, mint, targetMintWallet };
        };

        const quotesPromises = recipientMints.map(generateQuoteFromSomeMint);
        const { quote, mint, targetMintWallet } = await Promise.any(quotesPromises);

        if (!quote) {
            throw new Error("failed to get quote from any mint");
        }

        return { quote, mint, targetMintWallet };
    };

    // generate quote
    const { quote, mint: targetMint, targetMintWallet } = await generateQuote();
    if (!quote) {
        return null;
    }

    // TODO: create a CashuDeposit event?

    const invoiceAmount = getBolt11Amount(quote.request);
    if (!invoiceAmount) throw new Error("invoice amount is required");
    const invoiceAmountInSat = invoiceAmount / 1000;
    if (invoiceAmountInSat > amount)
        throw new Error(`invoice amount is more than the amount passed in (${invoiceAmountInSat} vs ${amount})`);

    const payLNResult = await payLn(wallet, quote.request, { amount });
    if (!payLNResult) {
        return null;
    }

    const { proofs, mint } = await mintProofs(targetMintWallet, quote, amount, targetMint, p2pk, proofTags);

    return {
        ...payLNResult,
        result: { proofs, mint },
        fee: payLNResult.fee,
    };
}

/**
 * The result of generating proofs to pay something, whether it's funded with a swap or LN.
 */
export type TokenCreationResult = {
    proofs: Proof[];
    mint: MintUrl;
};

export type TokenWithMint = SendResponse & { mint: MintUrl; fee?: number };

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
