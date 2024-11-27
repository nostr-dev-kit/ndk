import { EventEmitter } from "tseep";
import { NDKWalletBalance, NDKWalletEvents, NDKWalletStatus, type NDKWallet } from "../wallet/index.js";
import NDK, { NDKPool, LnPaymentInfo, NDKEvent, NDKPaymentConfirmationCashu, NDKPaymentConfirmationLN, NDKRelaySet, NDKUser, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NutPayment } from "../cashu/pay/nut.js";
import { hexToBytes } from "@noble/hashes/utils";
import { NWCResponseBase, sendReq } from "./req.js";
import { NWCRequestMap, NWCResponseMap } from "./types.js";

export class NDKNWCWallet extends EventEmitter<NDKWalletEvents> implements NDKWallet {
    readonly type = "nwc";
    readonly status = NDKWalletStatus.INITIAL;
    readonly walletId = "nwc";

    public ndk: NDK;

    public walletService?: NDKUser;
    public relaySet?: NDKRelaySet;
    private _status?: NDKWalletStatus;
    public signer?: NDKPrivateKeySigner;

    private _balance?: NDKWalletBalance[];

    public pool?: NDKPool;

    constructor(ndk: NDK) {
        super();
        this.ndk = ndk;
    }

    async init(pubkey: string, relayUrls: string[], secret: string) {
        this.walletService = this.ndk.getUser({ pubkey });
        this.pool = new NDKPool(relayUrls, [], this.ndk);
        await this.pool.connect();
        
        // Initialize signer
        this.signer = new NDKPrivateKeySigner(
            typeof secret === 'string' ? hexToBytes(secret) : secret
        );
        
        this._status = NDKWalletStatus.READY;
        this.emit('ready');
    }

    /**
     * Initialize the wallet via a nostr+walletconnect URI
     */
    async initWithPairingCode(uri: string) {
        const u = new URL(uri);
        const pubkey = u.host ?? u.pathname;
        const relayUrls = u.searchParams.getAll("relay");
        const secret = u.searchParams.get("secret");

        if (!pubkey || !relayUrls || !secret) {
            throw new Error("Invalid URI");
        }

        return this.init(pubkey, relayUrls, secret);
    }

    async lnPay(payment: LnPaymentInfo): Promise<NDKPaymentConfirmationLN | undefined> {
        if (!this.signer) throw new Error("Wallet not initialized");
        
        // Create and sign NWC request event
        const res = await this.req("pay_invoice", { invoice: payment.pr });
        
        if (res.result?.preimage) {
            return {
                preimage: res.result.preimage
            };
        }
        
        throw new Error(res.error?.message || "Payment failed");
    }

    async cashuPay(payment: NutPayment): Promise<NDKPaymentConfirmationCashu | undefined> {
        throw "not implemented";
    }

    /**
     * Fetch the balance of this wallet
     */
    async updateBalance?(): Promise<void> {
        const res = await this.req("get_balance", {});

        if (!res.result) throw new Error("Failed to get balance");

        if (res.error) throw new Error(res.error.message);



        // update the cached balance property
        this._balance = [{
            unit: "sat",
            amount: res.result.balance
        }];

        this.emit("balance_updated");
    }

    /**
     * Get the balance of this wallet
     */
    balance(): NDKWalletBalance[] | undefined {
        return this._balance;
    }
    
    req = sendReq.bind(this) as <M extends keyof NWCRequestMap>(method: M, params: NWCRequestMap[M]) => Promise<NWCResponseBase<NWCResponseMap[M]>>;
}
