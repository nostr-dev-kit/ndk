import { EventEmitter } from "tseep";
import {
    NDKWallet,
    NDKWalletBalance,
    NDKWalletEvents,
    NDKWalletStatus,
    NDKWalletTypes,
} from "../index.js";
import NDK, {
    NDKPool,
    LnPaymentInfo,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKRelaySet,
    NDKUser,
    NDKPrivateKeySigner,
    NDKRelay,
    NDKRelayAuthPolicies,
    NDKEventId,
} from "@nostr-dev-kit/ndk";
import { NutPayment } from "../cashu/pay/nut.js";
import { sendReq } from "./req.js";
import createDebug from "debug";
import {
    NDKNWCGetInfoResult,
    NDKNWCMakeInvoiceResult,
    NDKNWCRequestMap,
    NDKNWCResponseBase,
    NDKNWCResponseMap,
} from "./types.js";
import { CashuMint, CashuWallet, MintQuoteResponse } from "@cashu/cashu-ts";
import { redeemNutzaps } from "./nutzap.js";
import { mintProofs } from "../../utils/cashu.js";
import { getCashuWallet, MintInterface } from "../mint.js";
const d = createDebug("ndk-wallet:nwc");

export type NDKNWCWalletEvents = NDKWalletEvents & {
    connecting: () => void;
    error: () => void;

    timeout: (method: keyof NDKNWCRequestMap) => void;
};

export class NDKNWCWallet extends NDKWallet {
    get type(): NDKWalletTypes {
        return "nwc";
    }
    public status = NDKWalletStatus.INITIAL;
    public walletId = "nwc";

    public pairingCode?: string;

    public walletService?: NDKUser;
    public relaySet?: NDKRelaySet;
    public signer?: NDKPrivateKeySigner;

    private _balance?: NDKWalletBalance;

    private cachedInfo?: NDKNWCGetInfoResult;

    public pool?: NDKPool;

    public timeout?: number;

    /**
     *
     * @param ndk
     * @param timeout A timeeout to use for all operations.
     */
    constructor(
        ndk: NDK,
        {
            timeout,
            pairingCode,
            pubkey,
            relayUrls,
            secret,
        }: {
            timeout?: number;
            pairingCode?: string;
            pubkey?: string;
            relayUrls?: string[];
            secret?: string;
        }
    ) {
        super(ndk);

        if (pairingCode) {
            const u = new URL(pairingCode);
            pubkey = u.host ?? u.pathname;
            relayUrls = u.searchParams.getAll("relay");
            secret = u.searchParams.get("secret") as string;
            this.pairingCode = pairingCode;
        }

        if (!pubkey || !relayUrls || !secret)
            throw new Error("Incomplete initialization parameters");

        this.timeout = timeout;

        this.walletService = this.ndk.getUser({ pubkey });
        this.pool = this.getPool(relayUrls);
        this.relaySet = NDKRelaySet.fromRelayUrls(relayUrls, this.ndk, true, this.pool);

        // Initialize signer
        this.signer = new NDKPrivateKeySigner(secret);

        this.pool.on("connect", () => {
            this.status = NDKWalletStatus.READY;
            this.emit("ready");
        });
        this.pool.on("relay:disconnect", () => (this.status = NDKWalletStatus.LOADING));

        this.pool.connect();

        if (this.pool.connectedRelays().length > 0) {
            this.status = NDKWalletStatus.READY;
            this.emit("ready");
        }
    }

    private getPool(relayUrls: string[]) {
        for (const pool of this.ndk.pools) if (pool.name === "NWC") return pool;

        return new NDKPool(relayUrls, [], this.ndk, { name: "NWC" });
    }

    async lnPay(payment: LnPaymentInfo): Promise<NDKPaymentConfirmationLN | undefined> {
        if (!this.signer) throw new Error("Wallet not initialized");

        d("lnPay", payment.pr);

        // Create and sign NWC request event
        const res = await this.req("pay_invoice", { invoice: payment.pr });
        d("lnPay res", res);

        if (res.result) {
            return {
                preimage: res.result.preimage,
            };
        }

        this.updateBalance();

        throw new Error(res.error?.message || "Payment failed");
    }

    /**
     * Pay by minting tokens.
     *
     * This creates a quote on a mint, pays it using NWC and then mints the tokens.
     *
     * @param payment - The payment to pay
     * @param onLnPayment - A callback that is called when an LN payment will be processed
     * @returns The payment confirmation
     */
    async cashuPay(
        payment: NutPayment,
        onLnInvoice?: (pr: string) => void,
        onLnPayment?: (mint: string, invoice: string) => void
    ): Promise<NDKPaymentConfirmationCashu | undefined> {
        if (!payment.mints) throw new Error("No mints provided");

        for (const mint of payment.mints) {
            let amount = payment.amount;

            amount = amount / 1000;

            const wallet = new CashuWallet(new CashuMint(mint), { unit: "sat" });
            let quote: MintQuoteResponse | undefined;
            try {
                quote = await wallet.createMintQuote(amount);
                d("cashuPay quote", quote);
                onLnInvoice?.(quote.request);
            } catch (e) {
                console.error("error creating mint quote", e);
                throw e;
            }

            if (!quote) throw new Error("Didnt receive a mint quote");

            // todo check that the amount of the invoice matches the amount we want to pay

            try {
                const res = await this.req("pay_invoice", { invoice: quote.request });

                if (res.result?.preimage) {
                    onLnPayment?.(mint, res.result.preimage);
                }

                d("cashuPay res", res);
            } catch (e: any) {
                const message = e?.error?.message || e?.message || "unknown error";
                console.error("error paying invoice", e, { message });
                throw new Error(message);
            }

            this.updateBalance();

            return mintProofs(wallet, quote, amount, mint, payment.p2pk);
        }
    }

    /**
     * Redeem a set of nutzaps into an NWC wallet.
     *
     * This function gets an invoice from the NWC wallet until the total amount of the nutzaps is enough to pay for the invoice
     * when accounting for fees.
     *
     * @param cashuWallet - The cashu wallet to redeem the nutzaps into
     * @param nutzaps - The nutzaps to redeem
     * @param proofs - The proofs to redeem
     * @param mint - The mint to redeem the nutzaps into
     * @param privkey - The private key needed to redeem p2pk proofs.
     */
    public redeemNutzaps = redeemNutzaps.bind(this);

    /**
     * Fetch the balance of this wallet
     */
    async updateBalance(): Promise<void> {
        const res = await this.req("get_balance", {});

        if (!res.result) throw new Error("Failed to get balance");

        if (res.error) throw new Error(res.error.message);

        // update the cached balance property
        this._balance = {
            amount: res.result?.balance ?? 0,
        };

        // balance is always in sats
        this._balance.amount /= 1000;

        this.emit("balance_updated");
    }

    /**
     * Get the balance of this wallet
     */
    get balance(): NDKWalletBalance | undefined {
        return this._balance;
    }

    req = sendReq.bind(this) as <M extends keyof NDKNWCRequestMap>(
        method: M,
        params: NDKNWCRequestMap[M]
    ) => Promise<NDKNWCResponseBase<NDKNWCResponseMap[M]>>;

    async getInfo(refetch: boolean = false) {
        if (refetch) {
            this.cachedInfo = undefined;
        }

        if (this.cachedInfo) return this.cachedInfo;

        const res = await this.req("get_info", {});
        d("info", res);

        if (!res.result) throw new Error("Failed to get info");

        if (res.error) throw new Error(res.error.message);

        this.cachedInfo = res.result;

        if (res.result.alias) this.walletId = res.result.alias;

        return res.result;
    }

    async listTransactions() {
        const res = await this.req("list_transactions", {});

        if (!res.result) throw new Error("Failed to list transactions");

        return res.result;
    }

    async makeInvoice(amount: number, description: string): Promise<NDKNWCMakeInvoiceResult> {
        console.log("NDKWALLET making invoice", amount, description);
        const res = await this.req("make_invoice", { amount, description });
        console.log("NDKWALLET made invoice", res);

        if (!res.result) throw new Error("Failed to make invoice");

        return res.result;
    }
}
