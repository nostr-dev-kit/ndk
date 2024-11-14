import {
    LnPaymentInfo,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { NutPayment } from "../cashu/pay/nut";

export enum NDKWalletStatus {
    INITIAL = "initial",

    /**
     * The wallet tokens are being loaded.
     * Queried balance will come from the wallet event cache
     */
    LOADING = "loading",

    /**
     * Token have completed loading.
     * Balance will come from the computed balance from known tokens
     */
    READY = "ready",

    FAILED = "failed",
}

export type NDKWalletBalance = { amount: number; unit: string };

export type NDKWalletEvents = {
    ready: () => void;
    balance_updated: (balance?: NDKWalletBalance) => void;
};

export interface NDKWallet
    extends EventEmitter<{
        /**
         * Emitted when the wallet is ready to be used.
         */
        ready: () => void;

        /**
         * Emitted when a balance is known to have been updated.
         */
        balance_updated: (balance?: NDKWalletBalance) => void;
    }> {
    get status(): NDKWalletStatus;
    get type(): string;

    /**
     * An ID of this wallet
     */
    get walletId(): string;

    lnPay(payment: LnPaymentInfo): Promise<NDKPaymentConfirmationLN | undefined>;
    cashuPay(payment: NutPayment): Promise<NDKPaymentConfirmationCashu | undefined>;

    /**
     * Fetch the balance of this wallet
     */
    updateBalance?(): Promise<void>;

    /**
     * Get the balance of this wallet
     */
    balance(): NDKWalletBalance[] | undefined;
}
