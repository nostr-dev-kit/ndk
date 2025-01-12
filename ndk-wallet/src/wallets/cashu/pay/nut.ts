import { SendResponse, type Proof } from "@cashu/cashu-ts";
import type { MintUrl } from "../mint/utils";
import { NDKCashuWallet } from "../wallet/index.js";
import { CashuPaymentInfo, normalizeUrl } from "@nostr-dev-kit/ndk";
import { correctP2pk } from "../pay";
import { payLn } from "./ln";
import { getBolt11Amount } from "../../../utils/ln";
import { walletForMint } from "../mint";
import { WalletChange } from "../wallet/state.js";

export type NutPayment = CashuPaymentInfo & { amount: number; unit: string; };

/**
 * Generates proof to satisfy a payment.
 * 
 * This function exclusively creates the sendable proofs in the mint, it doesn't modify
 * the state of the wallet, send tokens or generate any type of event.
 */
export async function createToken(
    wallet: NDKCashuWallet,
    amount: number,
    unit: string,
    recipientMints: MintUrl[],
    p2pk?: string,
): Promise<TokenCreationResult | undefined> {
    p2pk = correctP2pk(p2pk);
    const senderMints = wallet.mints;
    const mintsInCommon = findMintsInCommon([recipientMints, senderMints]);

    if (unit === 'msat') throw new Error("msat should not reach createToken");

    console.log( "mints in common", {mintsInCommon, recipientMints, senderMints} );

    for (const mint of mintsInCommon) {
        try {
            const res = await createTokenInMint(wallet, mint, amount, p2pk);

            if (res) {
                console.log("result of paying within the same mint", res);
                return res;
            }
        } catch (e) {
            console.log("failed to prepare token for payment from mint %s: %s", mint, e);
        }
    }

    return await createTokenWithMintTransfer(wallet, amount, unit, recipientMints, p2pk);
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
): Promise<TokenCreationResult | undefined> {
    const walletChange: WalletChange = { mint };

    const cashuWallet = await wallet.cashuWallet(mint);
    try {
        console.log("Attempting with mint %s", mint);

        const proofsWeHave = wallet.proofsForMint(mint);
        const proofs = cashuWallet.selectProofsToSend(proofsWeHave, amount);
        console.log('keeping %d proofs, providing proofs to send: %o', proofs.keep.length, proofs.send)
        
        const sendResult = await cashuWallet.send(amount, proofs.send, {
            pubkey: p2pk,
            proofsWeHave,
        });
        console.log("token preparation result: %o", sendResult);

        walletChange.destroy = proofs.send;
        walletChange.store = sendResult.keep;

        return {
            walletChange,
            send: { proofs: sendResult.send, mint },
            fee: calculateFee(proofs.send, [...sendResult.send, ...sendResult.keep])
        };
    } catch (e: any) {
        console.log(
            "failed to pay with mint %s using proofs %o: %s",
            mint,
            e.message
        );
    }
}

/**
 * Calculates the difference between the provided proofs and the return proof totals;
 * @param providedProofs 
 * @param returnedProofs 
 */
function calculateFee(providedProofs: Proof[], returnedProofs: Proof[]) {
    const totalProvided = providedProofs.reduce((acc, p) => acc + p.amount, 0);
    const totalReturned = returnedProofs.reduce((acc, p) => acc + p.amount, 0);

    if (totalProvided < totalReturned) {
        console.log("BUG: calculate fee thinks we received back a higher amount of proofs than we sent to the mint", {
            providedProofs,
            returnedProofs
        })
    }

    return totalProvided - totalReturned;
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
): Promise<TokenCreationResult | undefined> {
    const generateQuote = async () => {
        const generateQuoteFromSomeMint = async (mint: MintUrl) => {
            const targetMintWallet = await walletForMint(mint, unit);
            if (!targetMintWallet) throw new Error("unable to load wallet for mint " + mint);
            const quote = await targetMintWallet.createMintQuote(amount);
            console.log('received a quote from mint', {quoteId: quote.quote, mint})
            return { quote, mint, targetMintWallet };
        };

        const quotesPromises = recipientMints.map(generateQuoteFromSomeMint);
        const { quote, mint, targetMintWallet } = await Promise.any(quotesPromises);

        if (!quote) {
            console.log("failed to get quote from any mint");
            throw new Error("failed to get quote from any mint");
        }

        console.log("quote from mint %s: %o", mint, quote, targetMintWallet.mint);

        return { quote, mint, targetMintWallet };
    }

    // generate quote
    const { quote, mint: targetMint, targetMintWallet } = await generateQuote();
    if (!quote) return;

    // TODO: create a CashuDeposit event?

    console.log('instructing local wallet to pay', {quoteId: quote.quote, targetMint, m: targetMintWallet.mint})

    const invoiceAmount = getBolt11Amount(quote.request);
    if (!invoiceAmount) throw new Error("invoice amount is required");
    const invoiceAmountInSat = invoiceAmount / 1000;
    if (invoiceAmountInSat > amount) throw new Error(`invoice amount is more than the amount passed in (${invoiceAmountInSat} vs ${amount})`);

    const payLNResult = await payLn(wallet, quote.request);
    console.log("LN payment result: %o", payLNResult);

    if (!payLNResult) {
        console.log("payment failed");
        return;
    }

    let proofs: Proof[] = [];

    try {
        console.log('will try to mint proofs', { w: targetMintWallet.mint, quoteId: quote.quote })
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

    console.log("minted tokens with proofs %o", proofs);

    return {
        walletChange: payLNResult.walletChange,
        send: { proofs, mint: targetMint },
        fee: payLNResult.fee,
    }
}

/**
 * The result of generating proofs to pay something, whether it's funded with a swap or LN.
 */
export type TokenCreationResult = {
    /**
     * Information of the wallet state change. The proofs that were used and the proofs that
     * were created that we need to store.
     */
    walletChange: WalletChange,
    send: { proofs: Proof[], mint: MintUrl },
    fee?: number
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
