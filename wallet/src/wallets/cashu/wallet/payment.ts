import type {
    CashuPaymentInfo,
    LnPaymentInfo,
    NDKEvent,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKTag,
    NDKUser,
    NDKZapDetails,
} from "@nostr-dev-kit/ndk";
import { getBolt11Amount } from "../../../utils/ln";
import { payLn } from "../pay/ln";
import { createToken } from "../pay/nut";
import type { NDKCashuWallet } from ".";
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
            createOutTxEvent(this.wallet.ndk, payment, res, this.wallet.relaySet);
        }

        return res.result;
    }

    /**
     * Swaps tokens to a specific amount, optionally locking to a p2pk.
     */
    async cashuPay(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu | undefined> {
        console.log('[PaymentHandler.cashuPay] Starting cashu payment', {
            originalAmount: payment.amount,
            unit: payment.unit,
            mints: payment.mints,
            p2pk: payment.p2pk,
            allowIntramintFallback: payment.allowIntramintFallback,
        });

        const satPayment = { ...payment };
        if (satPayment.unit?.startsWith("msat")) {
            satPayment.amount = satPayment.amount / 1000;
            satPayment.unit = "sat";
            console.log('[PaymentHandler.cashuPay] Converted msat to sat', {
                newAmount: satPayment.amount,
                newUnit: satPayment.unit,
            });
        }

        console.log('[PaymentHandler.cashuPay] Creating token with mints', payment.mints);
        let createResult = await createToken(this.wallet, satPayment.amount, payment.mints, payment.p2pk);

        if (!createResult?.result) {
            console.log('[PaymentHandler.cashuPay] Token creation failed with specified mints');
            if (payment.allowIntramintFallback) {
                console.log('[PaymentHandler.cashuPay] Attempting intramint fallback');
                createResult = await createToken(this.wallet, satPayment.amount, undefined, payment.p2pk);
            }

            if (!createResult?.result) {
                console.error('[PaymentHandler.cashuPay] Token creation failed completely');
                return;
            }
        }

        console.log('[PaymentHandler.cashuPay] Token created successfully', {
            proofsCount: createResult.result.proofs.length,
            mint: createResult.result.mint,
        });

        createOutTxEvent(this.wallet.ndk, satPayment, createResult, this.wallet.relaySet);

        return createResult.result;
    }
}
