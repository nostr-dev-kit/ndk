import type {
    CashuPaymentInfo,
    Hexpubkey,
    NDKEventId,
    NDKFilter,
    NDKNutzap,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKSubscription,
    NDKSubscriptionOptions,
    NDKTag,
    NDKZapDetails,
} from "@nostr-dev-kit/ndk";
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKRelaySet } from "@nostr-dev-kit/ndk";
import { NDKCashuToken, proofsTotalBalance } from "./token.js";
import { NDKCashuDeposit } from "./deposit.js";
import createDebug from "debug";
import type { MintUrl } from "./mint/utils.js";
import { NDKCashuPay } from "./pay.js";
import type { Proof } from "@cashu/cashu-ts";
import { CashuMint, CashuWallet, getDecodedToken } from "@cashu/cashu-ts";
import { NDKWalletChange } from "./history.js";
import { checkTokenProofs } from "./validate.js";
import { NDKWallet, NDKWalletBalance, NDKWalletEvents, NDKWalletStatus } from "../wallet/index.js";
import { EventEmitter } from "tseep";
import { decrypt } from "./decrypt.js";
import { chooseProofsForAmounts, rollOverProofs } from "./proofs.js";
import { eventHandler } from "./event-handlers/index.js";

const d = createDebug("ndk-wallet:cashu:wallet");

interface SaveProofsOptions {
    nutzap?: NDKNutzap;
    direction?: "in" | "out";
    amount?: number;
}

/**
 * This class tracks state of a NIP-60 wallet
 */
export class NDKCashuWallet extends EventEmitter<NDKWalletEvents> implements NDKWallet {
    readonly type = "nip-60";

    public tokens: NDKCashuToken[] = [];
    public usedTokenIds = new Set<NDKEventId>();
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

    private _wallets: Record<MintUrl, CashuWallet> = {};

    public walletId: string = "";

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

    public checkProofs = checkTokenProofs.bind(this);

    async mintNuts(amounts: number[], unit: string) {
        const tokenSelection = await chooseProofsForAmounts(amounts, this);
        if (tokenSelection?.needsSwap) {
            const wallet = await this.walletForMint(tokenSelection.mint);
            const currentProofs = this.proofsForMint(tokenSelection.mint);
            const proofs = await wallet.send(
                undefined as unknown as number,
                currentProofs,
                {
                    proofsWeHave: currentProofs,
                    includeFees: true,
                    outputAmounts: {
                        sendAmounts: amounts
                    }
                }
            );

            await rollOverProofs(tokenSelection, proofs.keep, tokenSelection.mint, this);

            return proofs.send;
        } else if (tokenSelection) {
            await rollOverProofs(tokenSelection, [], tokenSelection.mint, this);
        }
        return tokenSelection?.usedProofs;
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
            throw e;
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
        
        d("start %s", this.walletId);
        const filters: NDKFilter[] = [
            { kinds: [NDKKind.CashuToken], authors: [pubkey], ...this.event?.filter() },
            { kinds: [NDKKind.WalletChange], authors: [pubkey] },
            { kinds: [NDKKind.EventDeletion], authors: [pubkey], "#k": [NDKKind.CashuToken.toString()] },
        ];

        // if we have an event add it to the filter
        if (this.event) {
            // add to CashuToken filter
            filters[0] = { ...filters[0], ...this.event.filter() };

            // add to WalletChange filter
            filters[1] = { ...filters[1], ...this.event.filter() };
        }

        d("filters %j", filters);
        
        this.sub = this.ndk.subscribe(filters, opts, this.relaySet, false);
        
        this.sub.on("event", eventHandler.bind(this));
        // this.sub.on("eose", tokensSubEose.bind(this));
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
     * Returns the p2pk of this wallet
     */
    async getP2pk(): Promise<string | undefined> {
        if (this.p2pk) return this.p2pk;
        if (this.privkey) {
            const signer = new NDKPrivateKeySigner(this.privkey);
            const user = await signer.user();
            this.p2pk = user.pubkey;
            return this.p2pk;
        }
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
    public async receiveToken(token: string) {
        const mint = getDecodedToken(token).mint
        const wallet = await this.walletForMint(mint);
        const proofs = await wallet.receive(token);
        const amount = proofsTotalBalance(proofs);
        const tokenEvent = await this.saveProofs(proofs, mint, { direction: "in", amount });
        return tokenEvent;
    }

    public async addHistoryItem(
        direction: "in" | "out",
        amount: number,
        token?: NDKCashuToken
    ) {
        const historyEvent = new NDKWalletChange(this.ndk);
        if (this.event) historyEvent.tag(this.event);
        await historyEvent.sign();
        historyEvent.publish(this.relaySet);
    }

    /**
     * Pay a LN invoice with this wallet
     */
    async lnPay(
        { pr }: { pr: string },
        useMint?: MintUrl
    ): Promise<NDKPaymentConfirmationLN | undefined> {
        const pay = new NDKCashuPay(this, { pr });
        const preimage = await pay.payLn(useMint);
        if (!preimage) return;
        return { preimage };
    }

    /**
     * Swaps tokens to a specific amount, optionally locking to a p2pk.
     * @param amount
     */
    async cashuPay(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu> {
        const { amount, unit, mints, p2pk } = payment;
        const pay = new NDKCashuPay(this, { amount, unit, mints, p2pk });
        return pay.payNut();
    }

    public proofsForMint(mint: MintUrl) {
        const res = this.tokens.filter((t) => t.mint === mint).map((t) => t.proofs).flat();

        d("providing proofs for mint %s: %d (amounts: %o)", mint, res.length, res.map((p) => p.amount));
        
        return res;
    }

    public async walletForMint(mint: MintUrl): Promise<CashuWallet> {
        if (this._wallets[mint]) return this._wallets[mint];

        let unit = this.unit;

        if (unit === 'sats') {
            unit = 'sat';
            d("changing unit from sats to sat");
        }

        const wallet = new CashuWallet(new CashuMint(mint), { unit });
        const loadMint = await wallet.loadMint();
        d("load mint %o", loadMint);
        this._wallets[mint] = wallet;
        return wallet;
    }

    async redeemNutzap(nutzap: NDKEvent) {
        // this.emit("nutzap:seen", nutzap);

        try {
            const mint = nutzap.tagValue("u");
            if (!mint) throw new Error("missing mint");
            const proofs = JSON.parse(nutzap.content);
            console.log(proofs);

            const _wallet = await this.walletForMint(mint);
            const res = await _wallet.receive(
                { proofs, mint },
                {
                    proofsWeHave: this.proofsForMint(mint),
                    privkey: this.privkey,
                }
            );

            if (res) {
                // this.emit("nutzap:redeemed", nutzap);
            }

            const tokenEvent = new NDKCashuToken(this.ndk);
            tokenEvent.proofs = proofs;
            tokenEvent.mint = mint;
            tokenEvent.wallet = this;
            await tokenEvent.sign();
            tokenEvent.publish(this.relaySet);
            console.log("new token event", tokenEvent.rawEvent());

            const historyEvent = new NDKWalletChange(this.ndk);
            historyEvent.addRedeemedNutzap(nutzap);
            if (this.event) historyEvent.tag(this.event);
            historyEvent.tag(tokenEvent, NDKWalletChange.MARKERS.CREATED);
            await historyEvent.sign();
            historyEvent.publish(this.relaySet);
        } catch (e) {
            console.trace(e);
            // this.emit("nutzap:failed", nutzap, e);
        }
    }

    /**
     * Generates a new token event with proofs to be stored for this wallet
     * @param proofs Proofs to be stored
     * @param mint Mint URL
     * @param nutzap Nutzap event if these proofs are redeemed from a nutzap
     * @returns
     */
    async saveProofs(proofs: Proof[], mint: MintUrl, { nutzap, direction, amount } : SaveProofsOptions = {}) {
        const tokenEvent = new NDKCashuToken(this.ndk);
        tokenEvent.proofs = proofs;
        tokenEvent.mint = mint;
        tokenEvent.wallet = this;
        await tokenEvent.sign();

        // we can add it to the wallet here
        this.addToken(tokenEvent);

        tokenEvent.publish(this.relaySet).catch((e) => {
            console.error("failed to publish token", e, tokenEvent.rawEvent());
        });

        const historyEvent = new NDKWalletChange(this.ndk);
        if (this.event) historyEvent.tags.push(this.event.tagReference());

        if (nutzap) {
            historyEvent.addRedeemedNutzap(nutzap);
            historyEvent.direction = "in";

            historyEvent.amount = nutzap.amount;
        } else {
            historyEvent.direction = direction;
            if (amount) historyEvent.amount = amount;
        }
        
        historyEvent.tag(tokenEvent, NDKWalletChange.MARKERS.CREATED);
        await historyEvent.sign();
        historyEvent.publish(this.relaySet);

        return tokenEvent;
    }

    /**
     * Updates the internal state to add a token,
     * there is no change published anywhere when calling this function.
     */
    public addToken(token: NDKCashuToken) {
        if (!this.knownTokens.has(token.id)) {
            this.knownTokens.add(token.id);
            this.tokens.push(token);
            this.emit("balance_updated");
        }
    }

    /**
     * Removes a token that has been deleted
     */
    public removeTokenId(id: NDKEventId) {
        if (!this.knownTokens.has(id)) return false;

        this.tokens = this.tokens.filter((t) => t.id !== id);
        this.emit("balance_updated");
    }

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
        d("publishing balance (%d)", balance);
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
}
