import { Proof, MeltQuoteState } from "@cashu/cashu-ts";
import { NDKCashuWallet } from "../wallet/index.js";
import { getBolt11Amount } from "../../../utils/ln.js";
import { WalletChange } from "../wallet/state.js";

export type LNPaymentResult = {
    walletChange: WalletChange,
    preimage: string,
    fee?: number
};

export async function payLn(
    wallet: NDKCashuWallet,
    pr: string,
): Promise<LNPaymentResult | undefined | null> {
    let invoiceAmount = getBolt11Amount(pr);
    if (!invoiceAmount) throw new Error("invoice amount is required");

    invoiceAmount = invoiceAmount / 1000; // msat
    
    const eligibleMints = wallet.getMintsWithBalance(invoiceAmount);
    console.log("eligible mints", eligibleMints, {invoiceAmount});

    for (const mint of eligibleMints) {
        try {
            const result = await executePayment(mint, pr, invoiceAmount, wallet);
            if (result) {
                return result;
            }
        } catch (error: any) {
            console.log("Failed to execute payment for mint %s: %s", mint, error);
        }
    }
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
): Promise<LNPaymentResult | undefined | null> {
    console.log("executing payment from mint", mint);
    const result: LNPaymentResult = { walletChange: { mint }, preimage: "" };
    const cashuWallet = await wallet.cashuWallet(mint);
    const mintProofs = wallet.proofsForMint(mint);

    // Add up the amounts of the proofs
    const amountAvailable = mintProofs.reduce((acc, proof) => acc + proof.amount, 0);
    if (amountAvailable < amount) return null;

    try {
        const meltQuote = await cashuWallet.createMeltQuote(pr);
        const amountToSend = meltQuote.amount + meltQuote.fee_reserve;

        const proofs = cashuWallet.selectProofsToSend(mintProofs, amountToSend);
        console.log('proofs to send', proofs)

        result.walletChange.destroy = proofs.send;

        const meltResult = await cashuWallet.meltProofs(meltQuote, proofs.send);
        console.log("Melt result: %o", meltResult);

        // generate history event
        if (meltResult.quote.state === MeltQuoteState.PAID) {
            console.log("Payment successful");
            result.walletChange.store = meltResult.change;
            result.fee = calculateFee(amount, proofs.send, meltResult.change);
            result.preimage = meltResult.quote.payment_preimage ?? "";

            return result;
        }

        return null;
    } catch (e) {
        if (e instanceof Error) {
            console.log("Failed to pay with mint %s", e.message);
            // if (e.message.match(/already spent/i)) {
            //     debug("Proofs already spent, rolling over");
            //     rollOverProofs(selection, [], selection.mint, wallet);
            // }
            throw e;
        }

        return null;
    }
}

function calculateFee(sentAmount: number, proofs: Proof[], change: Proof[]) {
    let fee = -sentAmount;
    for (const proof of proofs) fee += proof.amount;
    for (const proof of change) fee -= proof.amount;
    return fee;
}