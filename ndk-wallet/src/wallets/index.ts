import NDK, {
    CashuPaymentInfo,
    LnPaymentInfo,
    NDKEvent,
    NDKNutzap,
    NDKPaymentConfirmation,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKPrivateKeySigner,
    NDKRelay,
    NDKWalletInterface,
    NDKZapDetails,
    NDKZapSplit,
} from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { NDKNWCWallet } from "./nwc";
import { Proof } from "@cashu/cashu-ts";
import { NDKCashuWallet } from "./cashu/wallet";
import { CashuWallet } from "@cashu/cashu-ts";
import {
    MintInfoNeededCb,
    MintInfoLoadedCb,
    MintInterface,
    MintKeysLoadedCb,
    MintKeysNeededCb,
    getCashuWallet,
} from "./mint";

/**
 * Different types of wallets supported.
 */
export type NDKWalletTypes = "nwc" | "nip-60" | "webln";

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

export type NDKWalletBalance = { amount: number };

export type NDKWalletEvents = {
    ready: () => void;
    balance_updated: (balance?: NDKWalletBalance) => void;
    insufficient_balance: (info: { amount: number; pr: string }) => void;
    warning: (warning: { msg: string; event?: NDKEvent; relays?: NDKRelay[] }) => void;
};

export class NDKWallet
    extends EventEmitter<NDKWalletEvents>
    implements NDKWalletInterface, MintInterface
{
    public cashuWallets = new Map<string, CashuWallet>();

    public onMintInfoNeeded?: MintInfoNeededCb;
    public onMintInfoLoaded?: MintInfoLoadedCb;
    public onMintKeysNeeded?: MintKeysNeededCb;
    public onMintKeysLoaded?: MintKeysLoadedCb;

    public getCashuWallet = getCashuWallet.bind(this) as MintInterface["getCashuWallet"];

    public ndk: NDK;

    constructor(ndk: NDK) {
        super();
        this.ndk = ndk;
    }

    public status: NDKWalletStatus = NDKWalletStatus.INITIAL;

    get type(): NDKWalletTypes {
        throw new Error("Not implemented");
    }

    /**
     * An ID of this wallet
     */
    public walletId = "unknown";

    /**
     * Pay a LN invoice
     * @param payment - The LN payment info
     */
    lnPay?(payment: NDKZapDetails<LnPaymentInfo>): Promise<NDKPaymentConfirmationLN | undefined>;

    /**
     * Pay a Cashu invoice
     * @param payment - The Cashu payment info
     */
    cashuPay?(
        payment: NDKZapDetails<CashuPaymentInfo>
    ): Promise<NDKPaymentConfirmationCashu | undefined>;

    /**
     * A callback that is called when a payment is complete
     */
    onPaymentComplete?(results: Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>): void;

    /**
     * Force-fetch the balance of this wallet
     */
    updateBalance?(): Promise<void>;

    /**
     * Get the balance of this wallet
     */
    get balance(): NDKWalletBalance | undefined {
        throw new Error("Not implemented");
    }

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
    redeemNutzaps(nutzaps: NDKNutzap[], privkey: string, opts: RedeemNutzapsOpts): Promise<number> {
        throw new Error("Not implemented");
    }
}

export interface RedeemNutzapsOpts {
    cashuWallet?: CashuWallet;
    proofs?: Proof[];
    mint?: string;
}
