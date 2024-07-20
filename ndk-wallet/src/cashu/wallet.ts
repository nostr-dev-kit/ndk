import NDK, { NDKZapDetails, LnPaymentInfo, NDKEvent, NDKEventId, NDKKind, NDKPrivateKeySigner, NDKRelaySet, NDKSubscriptionCacheUsage, NDKTag, NDKUser, NDKZapConfirmation, NDKZapper, NutPaymentInfo } from "@nostr-dev-kit/ndk";
import { NostrEvent } from "nostr-tools";
import { NDKCashuToken, proofsTotalBalance } from "./token.js";
import { NDKCashuDeposit } from "./deposit.js";
import createDebug from "debug";
import { MintUrl } from "./mint/utils.js";
import { NDKCashuPay } from "./pay.js";
import { CashuMint, CashuWallet, Proof } from "@cashu/cashu-ts";
import { NDKWalletChange } from "./history.js";
import { checkTokenProofs } from "./validate.js";

const d = createDebug('ndk-wallet:cashu:wallet');

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
    public p2pkPubkey: string | undefined;

    public state: NDKCashuWalletState = NDKCashuWalletState.LOADING;

    static kind = NDKKind.CashuWallet;
    static kinds = [NDKKind.CashuWallet];

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
        return this.tokens.filter(t => !this.usedTokenIds.has(t.id));
    }

    /**
     * Adds a token to the list of used tokens
     * to make sure it's proofs are no longer available
     */
    public addUsedTokens(token: NDKCashuToken[]) {
        for (const t of token) {
            this.usedTokenIds.add(t.id);
        }
        this.emit('balance');
    }

    public checkProofs = checkTokenProofs.bind(this);

    static async from(event: NDKEvent): Promise<NDKCashuWallet | undefined> {
        const wallet = new NDKCashuWallet(event.ndk, event.rawEvent() as NostrEvent);
        if (wallet.isDeleted) return;

        const prevContent = wallet.content;
        try {
            await wallet.decrypt();
        } catch (e) {
            console.error(e);
        }
        wallet.content ??= prevContent;

        const contentTags = JSON.parse(wallet.content);
        wallet.tags = [...contentTags, ...wallet.tags];

        await wallet.getP2pk();
        
        return wallet;
    }

    set relays(urls: WebSocket['url'][]) {
        this.tags = this.tags.filter(t => t[0] !== "relay");
        for (const url of urls) {
            this.tags.push(["relay", url]);
        }
        console.log('setting relay tags to', {urls})
    }

    get relays(): WebSocket['url'][] {
        const r = [];
        for (const tag of this.tags) {
            if (tag[0] === "relay") { r.push(tag[1]); }
        }

        return r;
    }

    set mints(urls: WebSocket['url'][]) {
        this.tags = this.tags.filter(t => t[0] !== "mint");
        for (const url of urls) {
            this.tags.push(["mint", url]);
        }
    }

    get mints(): WebSocket['url'][] {
        const r = [];
        for (const tag of this.tags) {
            if (tag[0] === "mint") { r.push(tag[1]); }
        }

        return Array.from(new Set(r));
    }

    set name(url: string) {
        this.removeTag("name");
        this.tags.push(["name", url]);  
    }

    get name(): string | undefined {
        return this.tagValue("name");
    }
    
    get unit(): string {
        return this.tagValue("unit") ?? "sat";
    }

    set unit(unit: string) {
        this.removeTag("unit");
        this.tags.push(["unit", unit]);
    }

    async getP2pk(): Promise<string | undefined> {
        if (this.p2pkPubkey) return this.p2pkPubkey;
        if (this.privkey) {
            const signer = new NDKPrivateKeySigner(this.privkey);
            const user = await signer.user();
            this.p2pkPubkey = user.pubkey;
            return this.p2pkPubkey;
        }
    }

    get privkey(): string | undefined {
        const privkey = this.tagValue("privkey");
        if (privkey) return privkey;

        if (this.ndk?.signer instanceof NDKPrivateKeySigner) {
            return this.ndk.signer.privateKey;
        }
    }

    set privkey(privkey: string | undefined | false) {
        this.removeTag("privkey");
        if (privkey)
            this.tags.push(["privkey", privkey]);
        this.skipPrivateKey = privkey === false;
        this.p2pkPubkey = undefined;
    }

    /**
     * Whether this wallet has been deleted
     */
    get isDeleted(): boolean {
        return this.tags.some(t => t[0] === "deleted");
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        if (this.isDeleted)
            return super.toNostrEvent(pubkey) as unknown as NostrEvent;
        
        const encryptedTags: NDKTag[] = [];
        const unencryptedTags: NDKTag[] = [];

        const unencryptedTagNames = [ "d", "client", "mint" ]

        // if we haven't been instructed to skip the private key
        // and we don't have one, generate it
        if (!this.skipPrivateKey && !this.privkey) {
            const signer = NDKPrivateKeySigner.generate();
            this.privkey = signer.privateKey;
        }

        for (const tag of this.tags) {
            if (unencryptedTagNames.includes(tag[0])) { unencryptedTags.push(tag); }
            else { encryptedTags.push(tag); }
        }

        this.tags = unencryptedTags;
        this.content = JSON.stringify(encryptedTags);

        const user = await this.ndk!.signer!.user();
        await this.encrypt(user);
        
        return super.toNostrEvent(pubkey) as unknown as NostrEvent;
    }

    get relaySet(): NDKRelaySet | undefined {
        if (this.relays.length === 0) return undefined;

        return NDKRelaySet.fromRelayUrls(
            this.relays, this.ndk!
        )
    }

    public deposit(amount: number, mint?: string, unit?: string): NDKCashuDeposit {
        const deposit = new NDKCashuDeposit(this, amount, mint, unit);
        deposit.on('success', (token) => {
            this.tokens.push(token);
            this.knownTokens.add(token.id);
            this.emit('update');
        });
        return deposit;
    }

    async publishNutzap(
        proofs: Proof[],
        mint: string,
        amount: number,
        unit: string,
        target: NDKEvent | NDKUser,
        recipient: NDKUser,
        relays: WebSocket['url'][],
        comment?: string,
    ): Promise<NDKEvent> {
        const nutzapEvent = new NDKEvent(this.ndk, {
            kind: NDKKind.Nutzap,
            content: JSON.stringify(proofs),
            tags: [
                [ "u", mint ],
                [ "amount", amount.toString(), unit ],
            ],
        } as NostrEvent);

        // add comment
        if (comment) nutzapEvent.tags.push(["comment", comment]);
        
        nutzapEvent.tag(target);

        // ensure we only have a single "p"-tag
        nutzapEvent.tags = nutzapEvent.tags.filter(t => t[0] !== "p");
        nutzapEvent.tag(recipient);
        
        // publish
        await nutzapEvent.sign();

        d("publishing nutzap %o", nutzapEvent.rawEvent());
        
        nutzapEvent.publish().catch(e => {
            console.error("failed to publish nutzap", e, nutzapEvent.rawEvent());
        });

        if (relays.length > 0) {
            const relaySet = NDKRelaySet.fromRelayUrls(relays, this.ndk!);
            d("relaying nutzap to %o", relaySet);
            nutzapEvent.publish(relaySet)
                .catch(e => {
                    console.error("failed to relay nutzap to relay Set", e, nutzapEvent.rawEvent(), relaySet.relayUrls);
                });
        }
    
        return nutzapEvent;
    }

    async lnPay(pr: string, useMint?: MintUrl) {
        const pay = new NDKCashuPay(this, {pr});
        return pay.payLn(useMint);
    }

    /**
     * Swaps tokens to a specific amount, optionally locking to a p2pk.
     * @param amount
     */
    async nutPay(
        amount: number,
        unit: string,
        mints: MintUrl[],
        p2pk?: string,
    ) {
        const pay = new NDKCashuPay(this, { amount, unit, mints, p2pk });
        return pay.payNut();
    }

    async redeemNutzap(nutzap: NDKEvent) {
        this.emit('nutzap:seen', nutzap);

        try {
            const mint = nutzap.tagValue("u");
            if (!mint) throw new Error("missing mint");
            const proofs = JSON.parse(nutzap.content);
            console.log(proofs);

            const _wallet = new CashuWallet(new CashuMint(mint));
            const res = await _wallet.receiveTokenEntry({ proofs, mint }, {
                privkey: this.privkey,
            });

            if (res) {
                this.emit('nutzap:redeemed', nutzap);
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
            this.emit('nutzap:failed', nutzap, e);
        }
    }

    /**
     * Generates a new token event with proofs to be stored for this wallet
     * @param proofs Proofs to be stored
     * @param mint Mint URL
     * @param nutzap Nutzap event if these proofs are redeemed from a nutzap
     * @returns 
     */
    async saveProofs(
        proofs: Proof[],
        mint: MintUrl,
        nutzap?: NDKEvent
    ) {
        const tokenEvent = new NDKCashuToken(this.ndk);
        tokenEvent.proofs = proofs;
        tokenEvent.mint = mint;
        tokenEvent.wallet = this;
        await tokenEvent.sign();

        // we can add it to the wallet here
        this.addToken(tokenEvent);
        
        tokenEvent.publish(this.relaySet)
            .catch(e => {
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

        this.tokens = this.tokens.filter(t => t.id !== id);
        this.emit("balance");
    }

    async delete(reason?: string, publish = true): Promise<NDKEvent> {
        this.content = "";
        this.tags = [
            [ "d", this.dTag! ],
            [ "deleted" ]
        ];
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
            return Number(this.tagValue("balance"));
        }
        
        // aggregate all token balances
        return proofsTotalBalance(this.tokens.map(t => t.proofs).flat());
    }

    /**
     * Writes the wallet balance to relays
     */
    async updateBalance() {
        this.removeTag("balance");
        this.tags.push(["balance", this.balance?.toString() ?? "0"]);
        d("updating balance to %d", this.balance);
        this.publishReplaceable(this.relaySet);
    }

    public mintBalance(mint: MintUrl) {
        return proofsTotalBalance(
            this.tokens
                .filter(t => t.mint === mint)
                .map(t => t.proofs)
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