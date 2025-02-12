import { CashuPaymentInfo, LnPaymentInfo, NDKPaymentConfirmationCashu, NDKZapDetails, NDKEvent, NDKUser, NDKTag, NDKPaymentConfirmationLN } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from ".";
import { createToken } from "../pay/nut";
import { payLn } from "../pay/ln";
import { getBolt11Amount } from "../../../utils/ln";
import { createOutTxEvent } from "./txs";

export type PaymentWithOptionalZapInfo<T extends LnPaymentInfo | CashuPaymentInfo> = T & {
    target?: NDKEvent | NDKUser;
    comment?: string;
    tags?: NDKTag[];
    amount?: number;
    unit?: string;
    recipientPubkey?: string;
    paymentDescription?: string;
};

export class PaymentHandler {
    private wallet: NDKCashuWallet;
    
    constructor(wallet: NDKCashuWallet) {
        this.wallet = wallet;
    }

    /**
     * Pay a LN invoice with this wallet. This will used cashu proofs to pay a bolt11.
     */
    async lnPay(
        payment: PaymentWithOptionalZapInfo<LnPaymentInfo>,
        createTxEvent = true,
    ): Promise<NDKPaymentConfirmationLN | undefined> {
        if (!payment.pr) throw new Error("pr is required");

        const invoiceAmount = getBolt11Amount(payment.pr);
        if (!invoiceAmount) throw new Error("invoice amount is required");

        // if amount was passed in, we want to check that the invoice amount is not more than it
        if (payment.amount && invoiceAmount > payment.amount) {
            throw new Error("invoice amount is more than the amount passed in");
        }

        const res = await payLn(this.wallet, payment.pr, {
            amount: payment.amount,
            unit: payment.unit,
        }); // msat to sat
        if (!res?.result?.preimage) return;

        if (createTxEvent) {
            createOutTxEvent(this.wallet, payment, res);
        }

        return res.result;
    }

    /**
     * Swaps tokens to a specific amount, optionally locking to a p2pk.
     */
    async cashuPay(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu | undefined> {
        const satPayment = { ...payment };
        if (satPayment.unit?.startsWith("msat")) {
            satPayment.amount = satPayment.amount / 1000;
            satPayment.unit = "sat";
        }

        let createResult = await createToken(
            this.wallet,
            satPayment.amount,
            payment.mints,
            payment.p2pk,
        )
        if (!createResult) {
            if (payment.allowIntramintFallback) {
                createResult = await createToken(
                    this.wallet,
                    satPayment.amount,
                    undefined,
                    payment.p2pk,
                )
            }
            
            if (!createResult) {
                return;
            }
        }

        createOutTxEvent(this.wallet, satPayment, createResult);

        return createResult.result;
    }
}
