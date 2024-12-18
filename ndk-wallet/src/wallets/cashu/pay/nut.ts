import { SendResponse, type Proof } from "@cashu/cashu-ts";
import type { MintUrl } from "../mint/utils";
import { NDKCashuWallet } from "../wallet";
import { CashuPaymentInfo, NDKZapDetails, normalizeUrl } from "@nostr-dev-kit/ndk";
import { correctP2pk } from "../pay";
import { NDKCashuDeposit } from "../deposit";

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
): Promise<TokenWithMint | undefined> {
    p2pk = correctP2pk(p2pk);
    const senderMints = wallet.mints;
    const mintsInCommon = findMintsInCommon([recipientMints, senderMints]);

    if (unit === 'msat') throw new Error("msat should not reach createToken");

    console.log( "mints in common", {mintsInCommon, recipientMints, senderMints} );

    for (const mint of mintsInCommon) {
        try {
            console.log("attempting payment with mint %s", mint);
            const res = await createTokenInMint(wallet, mint, amount, p2pk);

            if (res) {
                console.log('updating wallet state');
                const isP2pk = (p: Proof) => p.secret.startsWith('["P2PK"');
                const isNotP2pk = (p: Proof) => !isP2pk(p);

                // fee could be calculated here with the difference between the 
                const totalSent = res.send.reduce((acc, p) => acc + p.amount, 0);
                const totalChange = res.keep.reduce((acc, p) => acc + p.amount, 0);
                const fee = totalSent - amount - totalChange;

                console.log("fee for mint payment calculated", {
                    fee,
                    totalSent,
                    totalChange,
                    amount,
                });

                if (fee > 0) {
                    res.fee = fee;
                }
        
                wallet.updateState({
                    reserve: res.send.filter(isNotP2pk),
                    destroy: res.send.filter(isP2pk), // no point in reserving p2pk proofs since they will be published already
                    store: res.keep,
                    mint: res.mint,
                });
                
                return res;
            }
        } catch (e) {
            console.log("failed to prepare token for payment from mint %s: %s", mint, e);
        }
    }

    // console.log("attempting payment with mint transfer");

    return await createTokenForPaymentWithMintTransfer(wallet, amount, unit, recipientMints, p2pk);
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
): Promise<TokenWithMint | undefined> {
    const _wallet = await wallet.walletForMint(mint);
    if (!_wallet) throw new Error("unable to load wallet for mint " + mint);
    try {
        console.log("Attempting with mint %s", mint);
        const proofsWeHave = wallet.proofsForMint(mint);
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
 * Iterate through the mints to find one that can satisfy a minting request
 * for the desired amount in any of the mints the recipient accepts.
 */
async function createTokenForPaymentWithMintTransfer(
    wallet: NDKCashuWallet,
    amount: number,
    unit: string,
    recipientMints: MintUrl[],
    p2pk?: string,
): Promise<TokenWithMint | undefined> {
    const generateQuote = async () => {
        const generateQuoteFromSomeMint = async (mint: MintUrl) => {
            const _wallet = await wallet.walletForMint(mint);
            if (!_wallet) throw new Error("unable to load wallet for mint " + mint);
            const quote = await _wallet.createMintQuote(amount);
            return { quote, mint };
        };

        const quotesPromises = recipientMints.map(generateQuoteFromSomeMint);
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

    // TODO: create a CashuDeposit event?

    const res = await wallet.lnPay({ pr: quote.request, amount, unit });
    console.log("payment result: %o", res);

    if (!res) {
        console.log("payment failed");
        return;
    }

    const _wallet = await wallet.walletForMint(mint);
    if (!_wallet) throw new Error("unable to load wallet for mint " + mint);
    const proofs = await _wallet.mintProofs(amount, quote.quote, {
        pubkey: p2pk,
    });

    console.log("minted tokens with proofs %o", proofs);

    return { keep: [], send: proofs, mint };
}

type TokenWithMint = SendResponse & { mint: MintUrl, fee?: number };

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
