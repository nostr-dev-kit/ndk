import { Proof, MeltQuoteState, CashuWallet } from "@cashu/cashu-ts";
import { NDKCashuWallet } from "../wallet/index.js";
import { getBolt11Amount } from "../../../utils/ln.js";
import { calculateFee, UpdateStateResult, WalletChange, WalletChangeResult, withProofReserve } from "../wallet/state.js";
import { MintUrl } from "../mint/utils.js";
import { createOutTxEvent } from "../wallet/txs.js";

export type LNPaymentResult = {
    pr: string, // XXX: Need to add this
    preimage: string,
};

/**
 * Pay a Lightning Network invoice with a Cashu wallet.
 * 
 * @param wallet - The Cashu wallet to use for the payment.
 * @param pr - The Lightning Network payment request (invoice) to pay.
 * @param { amount, unit } - The intended amount and unit to pay. -- Intended amount could be what we wanted to pay and the amount in the bolt11 might have a fee.
 * @returns A Promise that resolves to the payment preimage as a string if successful, or null if the payment fails.
 */
export async function payLn(
    wallet: NDKCashuWallet,
    pr: string,
    { amount, unit }: { amount?: number, unit?: string } = {},
): Promise<WalletChangeResult<LNPaymentResult> | null> {
    let invoiceAmount = getBolt11Amount(pr);
    if (!invoiceAmount) throw new Error("invoice amount is required");

    invoiceAmount = invoiceAmount / 1000; // msat

    if (amount && unit) {
        if (unit === 'msat') {
            amount = amount / 1000;
        }
    }
    
    const eligibleMints = wallet.getMintsWithBalance(invoiceAmount);
    console.log("eligible mints", eligibleMints, {invoiceAmount});

    for (const mint of eligibleMints) {
        try {
            const result = await executePayment(mint, pr, invoiceAmount, wallet);
            if (result) {
                if (amount) {
                    result.fee = calculateFee(amount, result.stateChange?.destroy ?? [], result.stateChange?.store ?? []);
                }
                return result;
            }
        } catch (error: any) {
            console.log("Failed to execute payment for mint %s: %s", mint, error);
        }
    }

    return null;
}

/**
 * Attempts to pay using a selected set of Cashu tokens.
 *
 * @param selection - The TokenSelection object containing the chosen proofs and quote for the payment.
 * @param pr - The Lightning Network payment request (invoice) to pay.
 * @param wallet - The NDKCashuPay wallet instance.
 * @param debug - The debug function for logging.
 * @returns A Promise that resolves to the payment preimage as a string if successful, or null if the payment fails.
 *
 * @throws Will throw an error if the payment fails due to network issues or other problems.
 *
 * This function performs the following steps:
 * 1. Creates a new CashuWallet instance for the specific mint.
 * 2. Attempts to pay the Lightning invoice using the selected proofs.
 * 3. If successful, it rolls over any change proofs.
 * 4. If the proofs are already spent, it rolls over the selection without change.
 * 5. Logs the process and any errors for debugging purposes.
 */
async function executePayment(
    mint: string,
    pr: string,
    amount: number,
    wallet: NDKCashuWallet,
): Promise<WalletChangeResult<LNPaymentResult> | null> {
    console.log("executing payment from mint", mint);
    const cashuWallet = await wallet.cashuWallet(mint);

    try {
        const meltQuote = await cashuWallet.createMeltQuote(pr);
        const amountToSend = meltQuote.amount + meltQuote.fee_reserve;
        console.log('melt quote', {amountToSend}, JSON.stringify(meltQuote, null, 4));

        const result = await withProofReserve<LNPaymentResult>(
            wallet, cashuWallet, mint, amountToSend, async (proofsToUse, allOurProofs) => {
                const meltResult = await cashuWallet.meltProofs(meltQuote, proofsToUse);
                console.log("Melt result: %o", meltResult);

                if (meltResult.quote.state === MeltQuoteState.PAID) {
                    return {
                        result: {
                            pr,
                            preimage: meltResult.quote.payment_preimage ?? ""
                        },
                        change: meltResult.change,
                    }
                }

                return null;
            }
        )

        return result;
    } catch (e) {
        if (e instanceof Error) {
            console.log("Failed to pay with mint %s: %s", mint, e.message);
            // if (e.message.match(/already spent/i)) {
            //     debug("Proofs already spent, rolling over");
            //     rollOverProofs(selection, [], selection.mint, wallet);
            // }
            throw e;
        }

        return null;
    }
}
