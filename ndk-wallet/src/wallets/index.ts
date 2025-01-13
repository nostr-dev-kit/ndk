import NDK, {
    CashuPaymentInfo,
    LnPaymentInfo,
    NDKPaymentConfirmation,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKWalletInterface,
    NDKZapDetails,
    NDKZapSplit,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { NDKNWCWallet } from "./nwc";
import { NDKCashuWallet } from "./cashu/wallet";

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

export type NDKWalletBalance = { amount: number; unit: string };

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
     * Serializes the wallet configuration in a way that can be restored later.
     */
    toLoadingString?(): string;
}

export async function walletFromLoadingString(ndk: NDK, str: string): Promise<NDKNWCWallet | NDKCashuWallet | undefined> {
    const payload = JSON.parse(str);

    switch (payload.type) {
        case 'nwc':
            const w = new NDKNWCWallet(ndk);
            await w.initWithPairingCode(payload.pairingCode);
            return w;
        case 'nip60':
            const event = await ndk.fetchEvent(payload.bech32);
            if (!event) return undefined;
            return await NDKCashuWallet.from(event);
    }
}
