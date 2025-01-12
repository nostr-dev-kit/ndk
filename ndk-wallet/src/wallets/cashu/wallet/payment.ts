import { CashuPaymentInfo, LnPaymentInfo, NDKPaymentConfirmationCashu, NDKZapDetails, NDKEvent, NDKUser, NDKTag } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from ".";
import { createToken } from "../pay/nut";
import { LNPaymentResult, payLn } from "../pay/ln";
import { getBolt11Amount } from "../../../utils/ln";
import { Proof } from "@cashu/cashu-ts";
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
     * Pay a LN invoice with this wallet
     */
    async lnPay(
        payment: PaymentWithOptionalZapInfo<LnPaymentInfo>,
        createTxEvent = true,
    ): Promise<LNPaymentResult | undefined> {
        if (!payment.pr) throw new Error("pr is required");

        const invoiceAmount = getBolt11Amount(payment.pr);
        if (!invoiceAmount) throw new Error("invoice amount is required");

        // if amount was passed in, we want to check that the invoice amount is not more than it
        if (payment.amount && invoiceAmount > payment.amount) {
            throw new Error("invoice amount is more than the amount passed in");
        }

        const res = await payLn(this.wallet, payment.pr); // msat to sat
        if (!res?.preimage) return;

        const updateRes = await this.wallet.state.update(res.walletChange);

        if (createTxEvent) createOutTxEvent(this.wallet, payment, res, updateRes);

        return res;
    }

    /**
     * Swaps tokens to a specific amount, optionally locking to a p2pk.
     */
    async cashuPay(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu | undefined> {
        let { amount, unit } = payment;
        
        if (unit.startsWith("msat")) {
            unit = 'sat';
            amount = amount / 1000;
        }
        
        const createResult = await createToken(
            this.wallet,
            amount,
            unit,
            payment.mints,
            payment.p2pk,
        )
        if (!createResult) {
            console.log("failed to pay with cashu");
            return;
        }

        const isP2pk = (p: Proof) => p.secret.startsWith('["P2PK"');
        const isNotP2pk = (p: Proof) => !isP2pk(p);

        createResult.walletChange.reserve = createResult.send.proofs?.filter(isNotP2pk) ?? []
        this.wallet.state.update(createResult.walletChange).then((updateRes) => {
            createOutTxEvent(this.wallet, payment, createResult, updateRes);
        })

        return createResult.send;
    }
}
