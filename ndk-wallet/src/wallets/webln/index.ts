import NDK, {
    LnPaymentInfo,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKZapDetails,
} from "@nostr-dev-kit/ndk";
import { requestProvider } from "webln";
import { type WebLNProvider } from "@webbtc/webln-types";
import {
    NDKWallet,
    NDKWalletBalance,
    NDKWalletEvents,
    NDKWalletStatus,
    NDKWalletTypes,
} from "../index.js";
import { NDKLnPay } from "./pay";
import { NutPayment } from "../cashu/pay/nut.js";

export class NDKWebLNWallet extends NDKWallet {
    get type(): NDKWalletTypes {
        return "webln";
    }
    public walletId = "webln";
    public status: NDKWalletStatus = NDKWalletStatus.INITIAL;
    public provider?: WebLNProvider;

    private _balance?: NDKWalletBalance;

    constructor(ndk: NDK) {
        super(ndk);
        requestProvider()
            .then((p: unknown) => {
                if (p) {
                    this.provider = p as WebLNProvider;
                    this.status = NDKWalletStatus.READY;
                    this.emit("ready");
                } else {
                    this.status = NDKWalletStatus.FAILED;
                }
            })
            .catch(() => (this.status = NDKWalletStatus.FAILED));
    }

    async pay(payment: LnPaymentInfo): Promise<NDKPaymentConfirmationLN | undefined> {
        if (!this.provider) throw new Error("Provider not ready");
        return this.provider.sendPayment(payment.pr);
    }

    async lnPay(payment: LnPaymentInfo): Promise<NDKPaymentConfirmationLN | undefined> {
        const pay = new NDKLnPay(this, payment);
        const preimage = await pay.payLn();
        if (!preimage) return;
        return { preimage };
    }

    async cashuPay(payment: NDKZapDetails<NutPayment>): Promise<NDKPaymentConfirmationCashu> {
        const pay = new NDKLnPay(this, payment);
        return pay.payNut();
    }

    async updateBalance?(): Promise<void> {
        if (!this.provider) {
            return new Promise((resolve) => {
                this.once("ready", () => {
                    resolve();
                });
            });
        }

        const b = await this.provider.getBalance?.();
        if (b) this._balance = { amount: b.balance };
        return;
    }

    get balance(): NDKWalletBalance | undefined {
        if (!this.provider) {
            return undefined;
        }

        return this._balance;
    }
}
