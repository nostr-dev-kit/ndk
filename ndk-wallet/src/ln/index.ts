import { CashuPaymentInfo, LnPaymentInfo, NDKPaymentConfirmationCashu, NDKPaymentConfirmationLN, NDKZapDetails } from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { requestProvider } from "webln";
import { type WebLNProvider} from "@webbtc/webln-types";
import { NDKWallet, NDKWalletBalance, NDKWalletEvents, NDKWalletStatus } from "../wallet";
import { NDKLnPay } from "./pay";



export class NDKWebLNWallet extends EventEmitter<NDKWalletEvents> implements NDKWallet {
    readonly type = 'ln';
    readonly walletId = 'ln';
    public status: NDKWalletStatus = NDKWalletStatus.INITIAL;
    public provider?: WebLNProvider;

    constructor() {
        super();
        requestProvider().then((p: unknown) => {
            if (p) {
                this.provider = p as WebLNProvider;
                this.status = NDKWalletStatus.READY;
                this.emit("ready");
            } else {
                this.status = NDKWalletStatus.FAILED;
            }
        }).catch(() => this.status = NDKWalletStatus.FAILED);
    }

    async pay(payment: LnPaymentInfo): Promise<NDKPaymentConfirmationLN | undefined> {
        if (!this.provider) throw new Error("Provider not ready");
        return this.provider.sendPayment(payment.pr);
    }

    async lnPay(payment: LnPaymentInfo): Promise<NDKPaymentConfirmationLN | undefined> {
        const pay = new NDKLnPay(this, payment);
        const preimage = await pay.payLn();
        if (!preimage) return;
        return {preimage};
    }

    async cashuPay(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu> {
        const { amount, unit, mints, p2pk } = payment;
        const pay = new NDKLnPay(this, { amount, unit, mints, p2pk });
        return pay.payNut();
    }

    async balance(): Promise<NDKWalletBalance[] | undefined> {
        if (!this.provider) {
            return new Promise((resolve) => {
                this.once("ready", () => {
                    this.balance().then(resolve);
                });
            });
        }
        
        const balance = await this.provider.getBalance?.();
        if (balance) return [{
            amount: balance.balance,
            unit: balance.currency || "sats"
        }]
    }
}