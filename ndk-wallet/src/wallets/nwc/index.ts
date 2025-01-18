import { EventEmitter } from "tseep";
import { NDKWalletBalance, NDKWalletEvents, NDKWalletStatus, type NDKWallet } from "../index.js";
import NDK, { NDKPool, LnPaymentInfo, NDKPaymentConfirmationCashu, NDKPaymentConfirmationLN, NDKRelaySet, NDKUser, NDKPrivateKeySigner, NDKRelay, NDKRelayAuthPolicies } from "@nostr-dev-kit/ndk";
import { NutPayment } from "../cashu/pay/nut.js";
import { sendReq } from "./req.js";
import createDebug from "debug";
import { NDKNWCGetInfoResult, NDKNWCRequestMap, NDKNWCResponseBase, NDKNWCResponseMap } from "./types.js";
import { CashuMint, CashuWallet, MintQuoteResponse } from "@cashu/cashu-ts";

const d = createDebug("ndk-wallet:nwc");

export type NDKNWCWalletEvents = NDKWalletEvents & {
    connecting: () => void;
    error: () => void;
}

export class NDKNWCWallet extends EventEmitter<NDKNWCWalletEvents> implements NDKWallet {
    readonly type = "nwc";
    public status = NDKWalletStatus.INITIAL;
    readonly walletId = "nwc";

    public pairingCode?: string;

    public ndk: NDK;

    public walletService?: NDKUser;
    public relaySet?: NDKRelaySet;
    public signer?: NDKPrivateKeySigner;

    private _balance?: NDKWalletBalance;

    private cachedInfo?: NDKNWCGetInfoResult;

    public pool: NDKPool;

    constructor(ndk: NDK) {
        super();
        this.ndk = ndk;
        this.pool = new NDKPool([], [], this.ndk);
    }

    async init(pubkey: string, relayUrls: string[], secret: string) {
        this.walletService = this.ndk.getUser({ pubkey });
        this.pool = new NDKPool(relayUrls, [], this.ndk, { name: 'nwc' });

        // Initialize signer
        this.signer = new NDKPrivateKeySigner(secret);

        this.pool.on("connect", () => {
            if (!this.pool) return;
            this.status = NDKWalletStatus.READY;
            this.emit('ready');
        })
        this.pool.on("relay:disconnect", () => this.status = NDKWalletStatus.LOADING);

        this.pool.connect()
    }

    /**
     * Initialize the wallet via a nostr+walletconnect URI
     */
    async initWithPairingCode(uri: string) {
        const u = new URL(uri);
        const pubkey = u.host ?? u.pathname;
        const relayUrls = u.searchParams.getAll("relay");
        const secret = u.searchParams.get("secret");

        this.pairingCode = uri;

        if (!pubkey || !relayUrls || !secret) {
            throw new Error("Invalid URI");
        }

        return this.init(pubkey, relayUrls, secret);
    }

    toLoadingString(): string {
        return JSON.stringify({
            type: 'nwc',
            pairingCode: this.pairingCode
        });
    }

    async lnPay(payment: LnPaymentInfo): Promise<NDKPaymentConfirmationLN | undefined> {
        if (!this.signer) throw new Error("Wallet not initialized");

        d('lnPay', payment.pr);
        
        // Create and sign NWC request event
        const res = await this.req("pay_invoice", { invoice: payment.pr });
        d('lnPay res', res);
        
        if (res.result) {
            return {
                preimage: res.result.preimage
            };
        }

        this.updateBalance();
        
        throw new Error(res.error?.message || "Payment failed");
    }

    async cashuPay(payment: NutPayment): Promise<NDKPaymentConfirmationCashu | undefined> {
        if (!payment.mints) throw new Error("No mints provided");
        
        for (const mint of payment.mints) {
            let unit = payment.unit;
            let amount = payment.amount;

            if (unit === 'msat') {
                unit = 'sat';
                amount = amount / 1000;
            }

            const wallet = new CashuWallet(new CashuMint(mint), { unit });
            let quote: MintQuoteResponse | undefined;
            try {
                quote = await wallet.createMintQuote(amount);
                d('cashuPay quote', quote);
            } catch (e) {
                console.error('error creating mint quote', e);
                throw e;
            }

            if (!quote) throw new Error("Didnt receive a mint quote");

            try {
                const res = await this.req("pay_invoice", { invoice: quote.request });
                d('cashuPay res', res);
            } catch (e: any) {
                const message = e?.error?.message || e?.message || 'unknown error';
                console.error('error paying invoice', e, {message});
                throw new Error(message);
            }

            this.updateBalance();

            // todo check that the amount of the invoice matches the amount we want to pay

            try {
                // mint the tokens
                const mintProofs = await wallet.mintProofs(amount, quote.quote, {
                    pubkey: payment.p2pk
                });
                d('minted tokens', mintProofs);

                return {
                    proofs: mintProofs,
                    mint: mint
                };
            } catch (e) {
                console.error('error minting tokens', e);
                throw e;
            }
        }
    }

    /**
     * Fetch the balance of this wallet
     */
    async updateBalance(): Promise<void> {
        const res = await this.req("get_balance", {});

        if (!res.result) throw new Error("Failed to get balance");

        if (res.error) throw new Error(res.error.message);

        // update the cached balance property
        this._balance = {
            unit: "msats",
            amount: res.result?.balance ?? 0
        };

        this.emit("balance_updated");
    }

    /**
     * Get the balance of this wallet
     */
    balance(): NDKWalletBalance | undefined {
        return this._balance;
    }
    
    req = sendReq.bind(this) as <M extends keyof NDKNWCRequestMap>(method: M, params: NDKNWCRequestMap[M]) => Promise<NDKNWCResponseBase<NDKNWCResponseMap[M]>>;

    async getInfo(refetch: boolean = false) {
        if (refetch) {
            this.cachedInfo = undefined;
        }

        if (this.cachedInfo) return this.cachedInfo;

        const res = await this.req("get_info", {});
        d('info', res);

        if (!res.result) throw new Error("Failed to get info");

        if (res.error) throw new Error(res.error.message);

        this.cachedInfo = res.result;

        return res.result;
    }
}
