import type {
    CashuPaymentInfo,
    NDKEventId,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKRelay,
    NDKTag,
    NDKZapDetails} from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import {
    NDKEvent,
    NDKKind,
    NDKPrivateKeySigner,
    NDKRelaySet
} from "@nostr-dev-kit/ndk";
import type { NostrEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuToken, proofsTotalBalance } from "./token.js";
import { NDKCashuDeposit } from "./deposit.js";
import createDebug from "debug";
import type { MintUrl } from "./mint/utils.js";
import { NDKCashuPay } from "./pay.js";
import type { Proof } from "@cashu/cashu-ts";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { NDKWalletChange } from "./history.js";
import { checkTokenProofs } from "./validate.js";

const d = createDebug("ndk-wallet:cashu:wallet");

export enum NDKCashuWalletState {
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
}

export class NDKCashuWallet extends NDKEvent {
    public tokens: NDKCashuToken[] = [];
    public usedTokenIds = new Set<NDKEventId>();
    private knownTokens: Set<NDKEventId> = new Set();
    private skipPrivateKey: boolean = false;
    public p2pk: string | undefined;

    public state: NDKCashuWalletState = NDKCashuWalletState.LOADING;

    static kind = NDKKind.CashuWallet;
    static kinds = [NDKKind.CashuWallet];

    public privateTags: NDKTag[] = [];
    public publicTags: NDKTag[] = [];

    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuWallet;
    }

    get walletId(): string {
        return this.dTag!;
    }

    set walletId(id: string) {
        this.dTag = id;
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
        this.emit("balance");
    }

    public checkProofs = checkTokenProofs.bind(this);

    static async from(event: NDKEvent): Promise<NDKCashuWallet | undefined> {
        const wallet = new NDKCashuWallet(event.ndk, event.rawEvent() as NostrEvent);
        // if (wallet.isDeleted) return;

        const prevContent = wallet.content;
        wallet.publicTags = wallet.tags;
        try {
            await wallet.decrypt();

            wallet.privateTags = JSON.parse(wallet.content);
        } catch (e) {
            d("unable to decrypt wallet", e);
        }
        wallet.content ??= prevContent;

        await wallet.getP2pk();

        console.log("wallet from event", {
            privateTags: wallet.privateTags,
            publicTags: wallet.publicTags,
        });

        return wallet;
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
        return this.privateTags.filter((t) => t[0] === name).map((t) => t[1]);
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
        this.setPrivateTag("name", value);
    }

    get name(): string | undefined {
        return this.getPrivateTag("name");
    }

    get unit(): string {
        return this.getPrivateTag("unit") ?? "sats";
    }

    set unit(unit: string) {
        this.setPrivateTag("unit", unit);
    }

    async getP2pk(): Promise<string | undefined> {
        if (this.p2pk) return this.p2pk;
        if (this.privkey) {
            const signer = new NDKPrivateKeySigner(this.privkey);
            const user = await signer.user();
            this.p2pk = user.pubkey;
            return this.p2pk;
        }
    }

    get privkey(): string | undefined {
        const privkey = this.getPrivateTag("privkey");
        if (privkey) return privkey;

        if (this.ndk?.signer instanceof NDKPrivateKeySigner) {
            return this.ndk.signer.privateKey;
        }
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
        return this.tags.some((t) => t[0] === "deleted");
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        if (this.isDeleted)
            return super.toNostrEvent(pubkey) as unknown as NostrEvent;
        
        // if we haven't been instructed to skip the private key
        // and we don't have one, generate it
        if (!this.skipPrivateKey && !this.privkey) {
            const signer = NDKPrivateKeySigner.generate();
            this.privkey = signer.privateKey;
        }

        // set the tags to the public tags
        this.tags = this.publicTags;

        // ensure we don't have a privkey in the public tags
        for (const tag of this.tags) {
            if (tag[0] === "privkey") {
                throw new Error("privkey should not be in public tags!");
            }
        }

        // encrypt private tags
        this.content = JSON.stringify(this.privateTags);
        const user = await this.ndk!.signer!.user();
        await this.encrypt(user);

        return super.toNostrEvent(pubkey) as unknown as NostrEvent;
    }

    get relaySet(): NDKRelaySet | undefined {
        if (this.relays.length === 0) return undefined;

        return NDKRelaySet.fromRelayUrls(this.relays, this.ndk!);
    }

    public deposit(amount: number, mint?: string, unit?: string): NDKCashuDeposit {
        const deposit = new NDKCashuDeposit(this, amount, mint, unit);
        deposit.on("success", (token) => {
            this.tokens.push(token);
            this.knownTokens.add(token.id);
            this.emit("update");
        });
        return deposit;
    }

    async lnPay({pr}: {pr:string}, useMint?: MintUrl): Promise<NDKPaymentConfirmationLN | undefined> {
        const pay = new NDKCashuPay(this, { pr });
        const preimage = await pay.payLn(useMint);
        if (!preimage) return;
        return {preimage};
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

    async redeemNutzap(nutzap: NDKEvent) {
        this.emit("nutzap:seen", nutzap);

        try {
            const mint = nutzap.tagValue("u");
            if (!mint) throw new Error("missing mint");
            const proofs = JSON.parse(nutzap.content);
            console.log(proofs);

            const _wallet = new CashuWallet(new CashuMint(mint));
            const res = await _wallet.receiveTokenEntry(
                { proofs, mint },
                {
                    privkey: this.privkey,
                }
            );

            if (res) {
                this.emit("nutzap:redeemed", nutzap);
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
            historyEvent.tag(this);
            historyEvent.tag(tokenEvent, NDKWalletChange.MARKERS.CREATED);
            await historyEvent.sign();
            historyEvent.publish(this.relaySet);
        } catch (e) {
            console.trace(e);
            this.emit("nutzap:failed", nutzap, e);
        }
    }

    /**
     * Generates a new token event with proofs to be stored for this wallet
     * @param proofs Proofs to be stored
     * @param mint Mint URL
     * @param nutzap Nutzap event if these proofs are redeemed from a nutzap
     * @returns
     */
    async saveProofs(proofs: Proof[], mint: MintUrl, nutzap?: NDKEvent) {
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

        if (nutzap) {
            const historyEvent = new NDKWalletChange(this.ndk);
            historyEvent.addRedeemedNutzap(nutzap);
            historyEvent.tag(this);
            historyEvent.tag(tokenEvent, NDKWalletChange.MARKERS.CREATED);
            await historyEvent.sign();
            historyEvent.publish(this.relaySet);
        }

        return tokenEvent;
    }

    public addToken(token: NDKCashuToken) {
        if (!this.knownTokens.has(token.id)) {
            this.knownTokens.add(token.id);
            this.tokens.push(token);
            this.emit("balance");
        }
    }

    /**
     * Removes a token that has been deleted
     */
    public removeTokenId(id: NDKEventId) {
        if (!this.knownTokens.has(id)) return false;

        this.tokens = this.tokens.filter((t) => t.id !== id);
        this.emit("balance");
    }

    async delete(reason?: string, publish = true): Promise<NDKEvent> {
        this.content = "";
        this.tags = [["d", this.dTag!], ["deleted"]];
        if (publish) this.publishReplaceable();

        return super.delete(reason, publish);
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

    get balance(): number | undefined {
        if (this.state === NDKCashuWalletState.LOADING) {
            const balance = this.getPrivateTag("balance");
            if (balance) return Number(balance);
            else return undefined;
        }

        // aggregate all token balances
        return proofsTotalBalance(this.tokens.map((t) => t.proofs).flat());
    }

    /**
     * Writes the wallet balance to relays
     */
    async updateBalance() {
        this.setPrivateTag("balance", this.balance?.toString() ?? "0");
        d("publishing balance (%d)", this.balance);
        this.publishReplaceable(this.relaySet);
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
