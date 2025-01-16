import type {
    CashuPaymentInfo,
    Hexpubkey,
    LnPaymentInfo,
    NDKEventId,
    NDKFilter,
    NDKNutzap,
    NDKPaymentConfirmationCashu,
    NDKZapDetails,
    NDKSubscription,
    NDKSubscriptionOptions,
    NDKTag,
    NDKRelay,
    NDKPaymentConfirmationLN,
} from "@nostr-dev-kit/ndk";
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKRelaySet, NDKUser, normalizeUrl } from "@nostr-dev-kit/ndk";
import { NDKCashuToken, proofsTotalBalance } from "../token.js";
import { NDKCashuDeposit } from "../deposit.js";
import createDebug from "debug";
import type { MintUrl } from "../mint/utils.js";
import type { CashuWallet, Proof, SendResponse } from "@cashu/cashu-ts";
import { getDecodedToken } from "@cashu/cashu-ts";
import { consolidateTokens } from "../validate.js";
import { NDKWallet, NDKWalletBalance, NDKWalletEvents, NDKWalletStatus } from "../../index.js";
import { EventEmitter } from "tseep";
import { decrypt } from "../decrypt.js";
import { eventHandler } from "../event-handlers/index.js";
import { NDKCashuDepositMonitor } from "../deposit-monitor.js";
import { walletForMint } from "../mint.js";

const d = createDebug("ndk-wallet:cashu:wallet");

export type WalletWarning = {
    msg: string;
    event?: NDKEvent;
    relays?: NDKRelay[];
}

import { PaymentHandler, PaymentWithOptionalZapInfo } from "./payment.js";
import { createInTxEvent } from "./txs.js";
import { WalletState } from "./state.js";

/**
 * This class tracks state of a NIP-60 wallet
 */
export class NDKCashuWallet extends EventEmitter<NDKWalletEvents & {
    warning: (warning: WalletWarning) => void;
}> implements NDKWallet {
    readonly type = "nip-60";
    
    private skipPrivateKey: boolean = false;
    public p2pk: string | undefined;
    private sub?: NDKSubscription;
    public ndk: NDK;

    public status: NDKWalletStatus = NDKWalletStatus.INITIAL;

    static kind = NDKKind.CashuWallet;
    static kinds = [NDKKind.CashuWallet];

    public privateTags: NDKTag[] = [];
    public publicTags: NDKTag[] = [];

    public _event?: NDKEvent;

    public walletId: string = "";

    public depositMonitor = new NDKCashuDepositMonitor();

    /**
     * Warnings that have been raised
     */
    public warnings: WalletWarning[] = [];

    private paymentHandler: PaymentHandler;
    public state: WalletState;

    constructor(ndk: NDK, event?: NDKEvent) {
        super();
        if (!ndk) throw new Error("no ndk instance");
        this.ndk = ndk;
        if (!event) {
            event = new NDKEvent(ndk);
            event.kind = NDKKind.CashuWallet;
            event.dTag = Math.random().toString(36).substring(3);
            event.tags = [];
        }
        
        this.event = event;
        this.ndk = ndk;
        this.paymentHandler = new PaymentHandler(this);
        this.state = new WalletState(this);
    }

    /**
     * Creates a new NIP-60 wallet
     * @param ndk 
     * @param mints 
     * @param relayUrls 
     * @returns 
     */
    static create(ndk: NDK, mints: string[] = [], relayUrls: string[] = []) {
        const wallet = new NDKCashuWallet(ndk);
        wallet.mints = mints;
        wallet.relays = relayUrls;
        return wallet;
    }

    set event(e: NDKEvent | undefined) {
        this.walletId = e?.dTag ?? "";
        this._event = e;
    }

    get event(): NDKEvent | undefined {
        return this._event;
    }

    tagId() {
        return this.event?.tagId();
    }

    get tokens(): NDKCashuToken[] {
        return this.state.tokens;
    }

    public checkProofs = consolidateTokens.bind(this);
    public consolidateTokens = consolidateTokens.bind(this);

    public toLoadingString() {
        return JSON.stringify({
            type: 'nip60',
            bech32: this.event!.encode(),
        });
    }

    async mintNuts(amounts: number[], unit: string) {
        let result: SendResponse | undefined;
        const totalAmount = amounts.reduce((acc, amount) => acc + amount, 0);
        
        for (const mint of this.mints) {
            const wallet = await this.cashuWallet(mint);
            const mintProofs = await this.state.proofsForMint(mint);
             result = await wallet.send(totalAmount, mintProofs, {
                proofsWeHave: mintProofs,
                includeFees: true,
                outputAmounts: {
                    sendAmounts: amounts
                }
            });

            if (result.send.length > 0) break;
        }

        return result;
    }

    static async from(event: NDKEvent): Promise<NDKCashuWallet | undefined> {
        if (!event.ndk) throw new Error("no ndk instance on event");
        const wallet = new NDKCashuWallet(event.ndk, event);
        if (!wallet.event) return;
        if (wallet.isDeleted) return;

        const prevContent = wallet.event.content;
        wallet.publicTags = wallet.event.tags;
        try {
            await decrypt(wallet.event);
            wallet.privateTags = JSON.parse(wallet.event.content);
        } catch (e) {
            // see if perhaps this has already been decrypted
            try {
                wallet.privateTags = JSON.parse(wallet.event.content);
            } catch (e) {
                throw e;
            }
        }
        wallet.event.content ??= prevContent;

        await wallet.getP2pk();

        return wallet;
    }

    /**
     * Starts monitoring the wallet
     */
    start(opts?: NDKSubscriptionOptions & { pubkey?: Hexpubkey }) {
        const pubkey = opts?.pubkey ?? this.event?.pubkey;
        if (!pubkey) throw new Error("no pubkey");
        
        const filters: NDKFilter[] = [
            { kinds: [NDKKind.CashuToken], authors: [pubkey], ...this.event?.filter() },
            { kinds: [NDKKind.WalletChange], authors: [pubkey] },
            { kinds: [NDKKind.CashuQuote], authors: [pubkey] },
            { kinds: [NDKKind.EventDeletion], authors: [pubkey], "#k": [NDKKind.CashuToken.toString()] },
        ];

        // if we have an event add it to the filter
        if (this.event) {
            filters[0] = { ...filters[0], ...this.event.filter() }; // add to CashuToken filter
            filters[1] = { ...filters[1], ...this.event.filter() }; // add to WalletChange filter
            filters[2] = { ...filters[2], ...this.event.filter() }; // add to CashuQuote filter
        }

        this.sub = this.ndk.subscribe(filters, opts, this.relaySet, false);
        
        this.sub.on("event", eventHandler.bind(this));
        this.sub.on("eose", () => {
            this.emit("ready");
            this.status = NDKWalletStatus.READY;
        });
        this.sub.start();
    }

    stop() {
        this.sub?.stop();
    }

    get allTags(): NDKTag[] {
        return this.privateTags.concat(this.publicTags);
    }

    private setPrivateTag(name: string, value: string | string[]) {
        this.privateTags = this.privateTags.filter((t) => t[0] !== name);
        if (Array.isArray(value)) {
            for (const v of value) {
                this.privateTags.push([name, v]);
            }
        } else {
            this.privateTags.push([name, value]);
        }
    }

    private getPrivateTags(name: string): string[] {
        return this.privateTags.filter((t) => t[0] === name).map((t) => t[1]).flat();
    }

    private getPrivateTag(name: string): string | undefined {
        return this.privateTags.find((t) => t[0] === name)?.[1];
    }

    private setPublicTag(name: string, value: string | string[]) {
        this.publicTags = this.publicTags.filter((t) => t[0] !== name);
        if (Array.isArray(value)) {
            for (const v of value) {
                this.publicTags.push([name, v]);
            }
        } else {
            this.publicTags.push([name, value]);
        }
    }

    private getPublicTags(name: string): string[] {
        return this.publicTags.filter((t) => t[0] === name).map((t) => t[1]);
    }

    set relays(urls: WebSocket["url"][]) {
        this.setPrivateTag("relay", urls);
    }

    get relays(): WebSocket["url"][] {
        return this.getPrivateTags("relay");
    }

    set mints(urls: string[]) {
        this.setPublicTag("mint", urls);
    }

    get mints(): string[] {
        return this.getPublicTags("mint");
    }

    set name(value: string) {
        this.setPublicTag("name", value);
    }

    get name(): string | undefined {
        return this.getPrivateTag("name") ?? this.event?.tagValue("name");
    }

    get unit(): string {
        return this.getPrivateTag("unit") ?? "sats";
    }

    set unit(unit: string) {
        this.setPrivateTag("unit", unit);
    }

    /**
     * Returns the p2pk of this wallet or generates a new one if we don't have one
     */
    async getP2pk(): Promise<string | undefined> {
        if (this.p2pk) return this.p2pk;

        let signer: NDKPrivateKeySigner;
        if (this.privkey) {
            signer = new NDKPrivateKeySigner(this.privkey);
        } else {
            signer = NDKPrivateKeySigner.generate();
            this.privkey = signer.privateKey;
        }

        const user = await signer.user();
        this.p2pk = user.pubkey;
        return this.p2pk;
    }

    get privkeyUint8Array(): Uint8Array | undefined {
        const privkey = this.getPrivateTag("privkey");
        if (privkey) return new TextEncoder().encode(privkey);
    }

    /**
     * Returns the private key of this wallet
     */
    get privkey(): string | undefined {
        const privkey = this.getPrivateTag("privkey");
        if (privkey) return privkey;
    }

    set privkey(privkey: string | undefined | false) {
        if (privkey) {
            this.setPrivateTag("privkey", privkey ?? false);
        } else {
            this.skipPrivateKey = privkey === false;
            this.p2pk = undefined;
        }
    }

    /**
     * Whether this wallet has been deleted
     */
    get isDeleted(): boolean {
        if (!this.event?.tags) return false;
        return this.event.tags.some((t) => t[0] === "deleted");
    }

    async publish() {
        if (!this.event) throw new Error("wallet event not available");
        
        if (!this.isDeleted) {
            // if we haven't been instructed to skip the private key
            // and we don't have one, generate it
            if (!this.skipPrivateKey && !this.privkey) {
                const signer = NDKPrivateKeySigner.generate();
                this.privkey = signer.privateKey;
            }

            // set the tags to the public tags
            this.event.tags = this.publicTags;

            // ensure we don't have a privkey in the public tags
            for (const tag of this.event.tags) {
                if (tag[0] === "privkey") {
                    throw new Error("privkey should not be in public tags!");
                }
            }

            // encrypt private tags
            this.event.content = JSON.stringify(this.privateTags);
            const user = await this.ndk!.signer!.user();
            await this.event.encrypt(user, undefined, "nip44");
        }

        return this.event.publishReplaceable(this.relaySet);
    }

    get relaySet(): NDKRelaySet | undefined {
        if (!this.event) return undefined;
        if (this.relays.length === 0) return undefined;

        return NDKRelaySet.fromRelayUrls(this.relays, this.ndk!);
    }

    /**
     * Prepares a deposit
     * @param amount
     * @param mint
     * @param unit
     *
     * @example
     * const wallet = new NDKCashuWallet(...);
     * const deposit = wallet.deposit(1000, "https://mint.example.com", "sats");
     * deposit.on("success", (token) => {
     *   console.log("deposit successful", token);
     * });
     * deposit.on("error", (error) => {
     *   console.log("deposit failed", error);
     * });
     *
     * // start monitoring the deposit
     * deposit.start();
     */
    public deposit(amount: number, mint?: string, unit?: string): NDKCashuDeposit {
        console.log("[WALLET DEPOSIT] creating deposit", {amount, mint, unit});
        const deposit = new NDKCashuDeposit(this, amount, mint, unit);
        deposit.on("success", (token) => {
            this.addToken(token);
        });
        return deposit;
    }

    /**
     * Receives a token and adds it to the wallet
     * @param token
     * @returns the token event that was created
     */
    public async receiveToken(
        token: string,
        description?: string,
    ) {
        let { mint, unit } = getDecodedToken(token);
        const wallet = await this.cashuWallet(mint);
        const proofs = await wallet.receive(token);

        const updateRes = await this.state.update({
            store: proofs,
            mint,
        });
        const tokenEvent = updateRes.created;

        if (tokenEvent) this.addToken(tokenEvent);

        unit ??= this.unit;

        createInTxEvent(this, proofs, unit, mint, updateRes, { description });

        return tokenEvent;
    }

    /**
     * Pay a LN invoice with this wallet
     */
    async lnPay(payment: PaymentWithOptionalZapInfo<LnPaymentInfo>, createTxEvent = true): Promise<NDKPaymentConfirmationLN | undefined> {
        return this.paymentHandler.lnPay(payment, createTxEvent);
    }

    /**
     * Swaps tokens to a specific amount, optionally locking to a p2pk.
     * 
     * This function has side effects:
     * - It swaps tokens at the mint
     * - It updates the wallet state (deletes affected tokens, might create new ones)
     * - It creates a wallet transaction event
     * 
     * This function returns the proofs that need to be sent to the recipient.
     * @param amount
     */
    async cashuPay(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu | undefined> {
        return this.paymentHandler.cashuPay(payment);
    }

    private wallets = new Map<string, CashuWallet>();
    async cashuWallet(mint: string): Promise<CashuWallet> {
        if (this.wallets.has(mint)) return this.wallets.get(mint) as CashuWallet;

        const w = await walletForMint(mint, this.unit);
        if (!w) throw new Error("unable to load wallet for mint " + mint);
        this.wallets.set(mint, w);
        return w;
    }

    async redeemNutzap(
        nutzap: NDKNutzap,
        { onRedeemed, onTxEventCreated }: { onRedeemed?: (res: Proof[]) => void, onTxEventCreated?: (event: NDKEvent) => void } 
    ) {
        const user = this.ndk.activeUser;

        if (!user) throw new Error("no active user");
        
        let privkey = this.privkey;

        // if the nutzap is p2pk to the user's pubkey, check if we have the private key in memory
        if (nutzap.p2pk === user.pubkey) {
            if (this.ndk.signer instanceof NDKPrivateKeySigner)
                privkey = (this.ndk.signer as NDKPrivateKeySigner).privateKey;
            else {
                throw new Error("nutzap p2pk to the active user directly and we don't have access to the private key; login with your nsec to redeem this nutzap");
            }
        }
        
        try {
            const mint = nutzap.mint;
            const proofs = nutzap.proofs;
            if (!mint) throw new Error("missing mint");

            const _wallet = await this.cashuWallet(mint);
            const proofsWeHave = this.state.proofsForMint(mint);
            const res = await _wallet.receive(
                { proofs, mint },
                { proofsWeHave, privkey }
            );

            d("redeemed nutzap %o", nutzap.rawEvent());
            onRedeemed?.(res);

            const receivedAmount = proofs.reduce((acc, proof) => acc + proof.amount, 0);
            const redeemedAmount = res.reduce((acc, proof) => acc + proof.amount, 0);
            const fee = receivedAmount - redeemedAmount;

            const updateRes = await this.state.update({
                store: res,
                mint,
            });

            const txEvent = await createInTxEvent(this, res, nutzap.unit, mint, updateRes, {nutzap, fee});
            onTxEventCreated?.(txEvent);
        } catch (e) {
            console.trace(e);
            // this.emit("nutzap:failed", nutzap, e);
        }
    }

    /**
     * Updates the internal state to add a token,
     * there is no change published anywhere when calling this function.
     */
    public addToken(token: NDKCashuToken): boolean {
        return this.state.addToken(token);
    }

    public warn(msg: string, event?: NDKEvent, relays?: NDKRelay[]) {
        relays ??= event?.onRelays;
        this.warnings.push({ msg, event, relays });
        this.emit("warning", { msg, event, relays });
    }

    /**
     * Removes a token that has been deleted
     */
    public removeTokenId(id: NDKEventId) {
        this.state.removeTokenId(id);
    }

    /**
     * Deletes this wallet
     */
    async delete(reason?: string, publish = true): Promise<NDKEvent> {
        if (!this.event) throw new Error("wallet event not available");
        this.event.content = "";
        this.event.tags = [["d", this.walletId], ["deleted"]];
        if (publish) this.event.publishReplaceable();

        return this.event.delete(reason, publish);
    }

    /**
     * Gets all tokens, grouped by mint
     */
    get mintTokens(): Record<MintUrl, NDKCashuToken[]> {
        const tokens: Record<MintUrl, NDKCashuToken[]> = {};

        for (const token of this.tokens) {
            if (token.mint) {
                tokens[token.mint] ??= [];
                tokens[token.mint].push(token);
            }
        }

        return tokens;
    }

    balance(): NDKWalletBalance | undefined {
        if (this.status === NDKWalletStatus.LOADING) {
            const balance = this.getPrivateTag("balance");
            if (balance)
                return {
                    amount: Number(balance),
                    unit: this.unit,
                };
        }

        const proofBalances = proofsTotalBalance(this.tokens.map((t) => t.proofs).flat());
        const reservedAmounts = this.state.reserveAmounts.reduce((acc, amount) => acc + amount, 0);
        
        return {
            amount: proofBalances - reservedAmounts,
            unit: this.unit,
        };
    }

    /**
     * Writes the wallet balance to relays
     */
    async syncBalance() {
        const amount = this.balance()?.amount;
        if (!amount) return;

        this.setPrivateTag("balance", amount.toString() ?? "0");
        console.log("publishing balance (%d)", amount);
        this.publish();
    }

    /**
     * Gets the total balance for a specific mint, including reserved proofs
     */
    public mintBalance(mint: MintUrl): number {
        return this.mintBalances[mint] || 0;
    }

    /**
     * Gets all tokens, grouped by mint with their total balances
     */
    get mintBalances(): Record<MintUrl, number> {
        return this.state.mintBalances;
    }

    /**
     * Returns a list of mints that have enough available balance (excluding reserved proofs)
     * to cover the specified amount
     */
    getMintsWithBalance(amount: number): MintUrl[] {
        const availableBalances = this.state.getAvailableMintBalances();
        return Object.entries(availableBalances)
            .filter(([_, balance]) => balance >= amount)
            .map(([mint]) => mint);
    }
}
