import NDK, {
    CashuPaymentInfo,
    LnPaymentInfo,
    NDKEvent,
    NDKNutzap,
    NDKPaymentConfirmation,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKWalletInterface,
    NDKZapDetails,
    NDKZapSplit,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { NDKNWCWallet } from "./nwc";
import { Proof } from "@cashu/cashu-ts";
import { NDKCashuWallet } from "./cashu/wallet";
import { CashuWallet } from "@cashu/cashu-ts";

/**
 * Different types of wallets supported.
 */
export type NDKWalletTypes = 'nwc' | 'nip-60' | 'webln';

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

export type NDKWalletBalance = { amount: number; };

export type NDKWalletEvents = {
    ready: () => void;
    balance_updated: (balance?: NDKWalletBalance) => void;
    insufficient_balance: (info: { amount: number; pr: string }) => void;
};

export interface NDKWallet
    extends NDKWalletInterface, EventEmitter<{
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
    get type(): NDKWalletTypes;

    /**
     * An ID of this wallet
     */
    get walletId(): string;

    /**
     * Pay a LN invoice
     * @param payment - The LN payment info
     */
    lnPay?(payment: NDKZapDetails<LnPaymentInfo>): Promise<NDKPaymentConfirmationLN | undefined>;

    /**
     * Pay a Cashu invoice
     * @param payment - The Cashu payment info
     */
    cashuPay?(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu | undefined>;

    /**
     * A callback that is called when a payment is complete
     */
    onPaymentComplete?(
        results: Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>
    ): void;

    /**
     * Force-fetch the balance of this wallet
     */
    updateBalance?(): Promise<void>;

    /**
     * Get the balance of this wallet
     */
    balance(): NDKWalletBalance | undefined;

    /**
     * Redeem a set of nutzaps into an NWC wallet.
     * 
     * This function gets an invoice from the NWC wallet until the total amount of the nutzaps is enough to pay for the invoice
     * when accounting for fees.
     * 
     * @param cashuWallet - The cashu wallet to redeem the nutzaps into
     * @param nutzapIds - The IDs of the nutzaps to redeem
     * @param proofs - The proofs to redeem
     * @param privkey - The private key needed to redeem p2pk proofs.
     */
    redeemNutzaps?(cashuWallet: CashuWallet,nutzaps: NDKNutzap[], proofs: Proof[], mint: string, privkey: string): Promise<number>;

    /**
     * Redeem a single nutzap
     * @param nutzap - The nutzap to redeem
     * @param privkey - The private key needed to redeem the nutzap
     */
    redeemNutzap?(
        nutzap: NDKNutzap,
        { onRedeemed }: { onRedeemed?: (res: Proof[]) => void }
    ): Promise<NDKPaymentConfirmation | Error | boolean | undefined>;
}