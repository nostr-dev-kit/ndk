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
import { LNPaymentResult } from "../pay/ln.js";
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

    /**
     * Active tokens in this wallet
     */
    public tokens: NDKCashuToken[] = [];

    /**
     * Token ids that have been used
     */
    public usedTokenIds = new Set<NDKEventId>();

    /**
     * Known tokens in this wallet
     */
    public knownTokens: Set<NDKEventId> = new Set();
    
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

    /**
     * Returns the tokens that are available for spending
     */
    get availableTokens(): NDKCashuToken[] {
        return this.tokens.filter((t) => !this.usedTokenIds.has(t.id));
    }

    /**
     * Adds a token to the list of used tokens
     * to make sure it's proofs are no longer available
     */
    public addUsedTokens(token: NDKCashuToken[]) {
        for (const t of token) {
            this.usedTokenIds.add(t.id);
        }
        this.emit("balance_updated");
    }

    public checkProofs = consolidateTokens.bind(this);
    public consolidateTokens = consolidateTokens.bind(this);

    async mintNuts(amounts: number[], unit: string) {
        let result: SendResponse | undefined;
        const totalAmount = amounts.reduce((acc, amount) => acc + amount, 0);
        
        for (const mint of this.mints) {
            const wallet = await this.cashuWallet(mint);
            const mintProofs = await this.proofsForMint(mint);
             result = await wallet.send(totalAmount, mintProofs, {
                proofsWeHave: mintProofs,
                includeFees: true,
                outputAmounts: {
                    sendAmounts: amounts
                }
            });

            if (result.send.length > 0) break;
        }
        
        // await rollOverProofs(tokenSelection, proofs.keep, tokenSelection.mint, this);

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
        
        console.log("start %s", this.walletId);
        
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
    async lnPay(payment: PaymentWithOptionalZapInfo<LnPaymentInfo>, createTxEvent = true): Promise<LNPaymentResult | undefined> {
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

    /**
     * Returns a map of the proof C values to the token where it was found
     * @param mint 
     * @returns 
     */
    private getAllMintProofTokens(mint?: MintUrl): Map<string, NDKCashuToken> {
        const allMintProofs = new Map<string, NDKCashuToken>();

        this.tokens
            .filter((t) => mint ? t.mint === mint : true)
            .forEach((t) => {
            t.proofs.forEach((p) => {
                allMintProofs.set(p.C, t);
            });
        });

        return allMintProofs;
    }

    private wallets = new Map<string, CashuWallet>();
    async cashuWallet(mint: string): Promise<CashuWallet> {
        if (this.wallets.has(mint)) return this.wallets.get(mint) as CashuWallet;

        const w = await walletForMint(mint, this.unit);
        if (!w) throw new Error("unable to load wallet for mint " + mint);
        this.wallets.set(mint, w);
        return w;
    }

    
    // TODO: this is not efficient, we should use a set
    public hasProof(secret: string) {
        return this.tokens.some((t) => t.proofs.some((p) => p.secret === secret));
    }

    /**
     * Returns all proofs for a given mint
     * @param mint 
     * @returns 
     */
    public proofsForMint(mint: MintUrl): Proof[] {
        mint = normalizeUrl(mint);

        return this.tokens
            .filter((t) => t.mint === mint)
            .map((t) => t.proofs)
            .flat();
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
            const proofsWeHave = this.proofsForMint(mint);
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
        // check for proofs we already have
        if (!token.mint) throw new Error("token " + token.encode() + " has no mint");

        // double check we don't already have this tokem
        if (this.knownTokens.has(token.id)) {
            const stackTrace = new Error().stack;
            d("Refusing to add the same token twice", token.id, stackTrace);
            return false;
        }

        const allMintProofs = this.getAllMintProofTokens(token.mint);

        for (const proof of token.proofs) {
            if (allMintProofs.has(proof.C)) {
                const collidingToken = allMintProofs.get(proof.C);

                if (!collidingToken) {
                    console.trace("BUG: unable to find colliding token", {
                        token: token.id,
                        proof: proof.C,
                    });
                    throw new Error("BUG: unable to find colliding token");
                }

                // keep newer token, remove old
                if (token.created_at! <= collidingToken.created_at!) {
                    // we don't have to do anything
                    console.log('skipping adding requested token since we have a newer token with the same proof', {
                        requestedTokenId: token.id,
                        relay: token.onRelays.map((r) => r.url),
                    })

                    this.warn("Received an older token with proofs that were already known, this is likely a relay that didn't receive (or respected) a delete event", token);
                    
                    return false; 
                }

                // remove old token
                this.removeTokenId(collidingToken.id);
            }
        } 
        
        if (!this.knownTokens.has(token.id)) {
            this.knownTokens.add(token.id);
            this.tokens.push(token);
            this.emit("balance_updated");
        }

        return true;
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
        if (!this.knownTokens.has(id)) {
            return false;
        }

        this.tokens = this.tokens.filter((t) => t.id !== id);
        this.emit("balance_updated");
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

    balance(): NDKWalletBalance[] | undefined {
        if (this.status === NDKWalletStatus.LOADING) {
            const balance = this.getPrivateTag("balance");
            if (balance)
                return [
                    {
                        amount: Number(balance),
                        unit: this.unit,
                    },
                ];
        }

        // aggregate all token balances
        const proofBalances = proofsTotalBalance(this.tokens.map((t) => t.proofs).flat());
        return [
            {
                amount: proofBalances,
                unit: this.unit,
            },
        ];
    }

    /**
     * Writes the wallet balance to relays
     */
    async syncBalance() {
        const balance = (await this.balance())?.[0].amount;
        if (!balance) return;

        this.setPrivateTag("balance", balance.toString() ?? "0");
        console.log("publishing balance (%d)", balance);
        this.publish();
    }

    public mintBalance(mint: MintUrl) {
        return proofsTotalBalance(
            this.tokens
                .filter((t) => t.mint === mint)
                .map((t) => t.proofs)
                .flat()
        );
    }

    get mintBalances(): Record<MintUrl, number> {
        const balances: Record<MintUrl, number> = {};

        for (const token of this.tokens) {
            if (token.mint) {
                balances[token.mint] ??= 0;
                balances[token.mint] += token.amount;
            }
        }

        return balances;
    }

    getMintsWithBalance(amount: number) {
        return Object.entries(this.mintBalances)
            .filter(([_, balance]) => balance >= amount)
            .map(([mint]) => mint);
    }
}
