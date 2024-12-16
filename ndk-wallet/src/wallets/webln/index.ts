import {
    CashuPaymentInfo,
    LnPaymentInfo,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKZapDetails,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { requestProvider } from "webln";
import { type WebLNProvider } from "@webbtc/webln-types";
import { NDKWallet, NDKWalletBalance, NDKWalletEvents, NDKWalletStatus } from "../index.js";
import { NDKLnPay } from "./pay";
import { NutPayment } from "../cashu/pay/nut.js";

export class NDKWebLNWallet extends EventEmitter<NDKWalletEvents> implements NDKWallet {
    readonly type = "webln";
    readonly walletId = "webln";
    public status: NDKWalletStatus = NDKWalletStatus.INITIAL;
    public provider?: WebLNProvider;

    private _balance?: NDKWalletBalance[];

    constructor() {
        super();
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
        if (b) this._balance = [{ amount: b.balance, unit: b.currency || "sats" }];
        return;
    }

    balance(): NDKWalletBalance[] | undefined {
        if (!this.provider) {
            return undefined;
        }

        return this._balance;
    }
}
