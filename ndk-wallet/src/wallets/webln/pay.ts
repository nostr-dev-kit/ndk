import { LnPaymentInfo } from "@nostr-dev-kit/ndk";
import { NDKWebLNWallet } from ".";
import { NutPayment } from "../cashu/pay/nut";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";

export class NDKLnPay {
    public wallet: NDKWebLNWallet;
    public info: LnPaymentInfo | NutPayment;
    public type: "ln" | "nut" = "ln";

    constructor(wallet: NDKWebLNWallet, info: LnPaymentInfo | NutPayment) {
        this.wallet = wallet;
        this.info = info;
    }

    public async pay() {
        if (this.type === "ln") {
            return this.payLn();
        } else {
            return this.payNut();
        }
    }

    /**
     * Uses LN balance to pay to a mint
     */
    async payNut() {
        const { mints, p2pk } = this.info as NutPayment;
        let { amount, unit } = this.info as NutPayment;

        if (!mints) throw new Error("No mints provided");

        if (unit === "msat") {
            amount /= 1000;
            unit = "sat";
        }

        // get quotes from the mints the recipient has
        const quotesPromises = mints.map(async (mint) => {
            const wallet = new CashuWallet(new CashuMint(mint), { unit: unit });
            const quote = await wallet.createMintQuote(amount);
            return { quote, mint };
        });

        const { quote, mint } = await Promise.any(quotesPromises);
        if (!quote) {
            console.warn("failed to get quote from any mint");
            throw new Error("failed to get quote from any mint");
        }

        const res = await this.wallet.pay({ pr: quote.request });

        if (!res) {
            console.warn("payment failed");
            throw new Error("payment failed");
        }

        const wallet = new CashuWallet(new CashuMint(mint), { unit });
        const proofs = await wallet.mintProofs(amount, quote.quote, {
            pubkey: p2pk,
        });

        console.warn("minted tokens with proofs %o", proofs);

        return { proofs, mint };
    }

    /**
     * Straightforward; uses LN balance to pay a LN invoice
     */
    async payLn() {
        const data = this.info as LnPaymentInfo;
        if (!data.pr) throw new Error("missing pr");

        let paid = false;
        const ret = await this.wallet.pay(data);
        return ret ? ret.preimage : undefined;
    }
}
