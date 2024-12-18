import { CashuWallet, CashuMint, Proof, MeltQuoteState, SendResponse } from "@cashu/cashu-ts";
import { NDKEvent, NDKTag, NDKUser, NDKZapDetails, type LnPaymentInfo } from "@nostr-dev-kit/ndk";
import { rollOverProofs, type TokenSelection } from "../proofs";
import type { MintUrl } from "../mint/utils";
import { NDKCashuWallet } from "../wallet";
import { NDKWalletChange } from "../history";

type LNPaymentResult = SendResponse & { preimage: string, change: Proof[], mint: MintUrl };

export async function payLn(
    wallet: NDKCashuWallet,
    amount: number,
    pr: string,
): Promise<LNPaymentResult | undefined | null> {
    const eligibleMints = wallet.getMintsWithBalance(amount);
    console.log("eligible mints", eligibleMints, {amount});

    for (const mint of eligibleMints) {
        try {
            const result = await executePayment(mint, pr, amount, wallet);
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
    const _wallet = await wallet.walletForMint(mint);
    if (!_wallet) throw new Error("unable to load wallet for mint " + mint);
    const mintProofs = wallet.proofsForMint(mint);

    // Add up the amounts of the proofs
    const amountAvailable = mintProofs.reduce((acc, proof) => acc + proof.amount, 0);
    if (amountAvailable < amount) return null;

    try {
        const meltQuote = await _wallet.createMeltQuote(pr);
        const amountToSend = meltQuote.amount + meltQuote.fee_reserve;

        const proofs = _wallet.selectProofsToSend(mintProofs, amountToSend);

        const meltResult = await _wallet.meltProofs(meltQuote, proofs.send);
        console.log("Melt result: %o", meltResult);

        const fee = calculateFee(amount, mintProofs, meltResult.change);

        function calculateFee(sentAmount: number, proofs: Proof[], change: Proof[]) {
            let fee = -sentAmount;
            for (const proof of proofs) fee += proof.amount;
            for (const proof of change) fee -= proof.amount;
            return fee;
        }

        // generate history event
        if (meltResult.quote.state === MeltQuoteState.PAID && meltResult.quote.payment_preimage) {
            console.log("Payment successful");

            // const historyEvent = new NDKWalletChange(wallet.ndk);
            // historyEvent.destroyedTokens = sendProofs;
            // historyEvent.createdTokens = meltResult.change;
            // if (wallet.event) historyEvent.tag(wallet.event);
            // historyEvent.direction = 'out';
            // historyEvent.description = payment.paymentDescription;
            
            // if (payment.target) {
            //     let tag: NDKTag | undefined;
                
            //     if (payment.target instanceof NDKEvent) {
            //         tag = payment.target.tagReference();
            //     } else if (payment.target instanceof NDKUser && !payment.recipientPubkey) {
            //         tag = ['p', payment.target.pubkey];
            //     }

            //     if (tag) {
            //         console.log("adding tag", tag);
            //         historyEvent.tags.push(tag);
            //     }
            // }

            // if (payment.recipientPubkey) {
            //     historyEvent.tags.push(['p', payment.recipientPubkey]);
            // }

            // historyEvent.tags.push(['preimage', meltResult.quote.payment_preimage]);
            // historyEvent.amount = meltResult.quote.amount;
            // historyEvent.fee = fee;
            // historyEvent.publish(wallet.relaySet);

            return { preimage: meltResult.quote.payment_preimage, change: meltResult.change, ...proofs, mint };
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