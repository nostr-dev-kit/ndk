import type {
    CashuPaymentInfo,
    Hexpubkey,
    LnPaymentInfo,
    NDKEventId,
    NDKFilter,
    NDKNutzap,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKZapDetails,
    NDKSubscription,
    NDKSubscriptionOptions,
    NDKTag,
    NostrEvent,
    NDKRelay,
} from "@nostr-dev-kit/ndk";
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKRelaySet, NDKUser, normalizeUrl } from "@nostr-dev-kit/ndk";
import { NDKCashuToken, proofsTotalBalance } from "./token.js";
import { NDKCashuDeposit } from "./deposit.js";
import createDebug from "debug";
import type { MintUrl } from "./mint/utils.js";
import type { Proof, SendResponse } from "@cashu/cashu-ts";
import { CashuMint, CashuWallet, getDecodedToken } from "@cashu/cashu-ts";
import { NDKWalletChange } from "./history.js";
import { consolidateTokens } from "./validate.js";
import { NDKWallet, NDKWalletBalance, NDKWalletEvents, NDKWalletStatus } from "../index.js";
import { EventEmitter } from "tseep";
import { decrypt } from "./decrypt.js";
import { eventHandler } from "./event-handlers/index.js";
import { NDKCashuDepositMonitor } from "./deposit-monitor.js";
import { createToken } from "./pay/nut.js";
import { payLn } from "./pay/ln.js";

const d = createDebug("ndk-wallet:cashu:wallet");

interface SaveProofsOptions {
    nutzap?: NDKNutzap;
    direction?: "in" | "out";
    amount: number;
}

/**
 * Represents a change to the wallet state
 */
export type WalletChange = {
    // reserve proofs are moved into an NDKKind.CashuReserve event until we verify that the recipient has received them
    reserve: Proof[],

    // destroy proofs are deleted from the wallet
    destroy?: Proof[],

    // store proofs are added to the wallet
    store: Proof[],
    mint: MintUrl,
}

export type WalletStateChange = {
    // token ids that are to be deleted
    deletedTokenIds: Set<string>;

    // these are the Cs of the proofs that are getting deleted
    deletedProofs: Set<string>;

    // proofs that are to be moved to a reserve
    reserveProofs: Proof[];

    // proofs that are to be added to the wallet in a new token
    saveProofs: Proof[];
}

export type WalletWarning = {
    msg: string;
    event?: NDKEvent;
    relays?: NDKRelay[];
}

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

    private _wallets: Record<MintUrl, CashuWallet> = {};

    public walletId: string = "";

    public depositMonitor = new NDKCashuDepositMonitor();

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
            const wallet = await this.walletForMint(mint);
            if (!wallet) continue;
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

        console.log("filters %j", filters);
        
        this.sub = this.ndk.subscribe(filters, opts, this.relaySet, false);
        
        this.sub.on("event", eventHandler.bind(this));
        // this.sub.on("eose");
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
    public async receiveToken(token: string) {
        const mint = getDecodedToken(token).mint
        const wallet = await this.walletForMint(mint);
        if (!wallet) throw new Error("unable to load wallet for mint " + mint);
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
    async lnPay(payment: Partial<NDKZapDetails<LnPaymentInfo>>): Promise<NDKPaymentConfirmationLN | undefined> {
        if (!payment.amount) throw new Error("amount is required");
        if (!payment.pr) throw new Error("pr is required");

        const res = await payLn(this, payment.amount, payment.pr);
        if (!res?.preimage) return;

        console.trace('updating state for', res.mint);

        await this.updateState({
            reserve: [],
            destroy: res.send,
            store: [ ...res.keep, ...res.change ],
            mint: res.mint,
        });
        
        return { preimage: res.preimage };
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
        let { amount, unit } = payment;
        
        if (unit.startsWith("msat")) {
            unit = 'sat';
            amount = amount / 1000;
        }
        
        const createResult = await createToken(
            this,
            amount,
            unit,
            payment.mints,
            payment.p2pk,
        )
        if (!createResult) {
            console.log("failed to pay with cashu");
            return;
        }

        const historyEvent = new NDKWalletChange(this.ndk);
        historyEvent.direction = "out";
        historyEvent.amount = payment.amount;
        historyEvent.unit = payment.unit || this.unit;
        if (payment.target) {
            // tag the target if there is one
            historyEvent.tags.push(payment.target.tagReference());
            
            if (!(payment.target instanceof NDKUser)) {
                historyEvent.tags.push(["p", payment.target.pubkey]);
            }
        }
        historyEvent.description = payment.paymentDescription;
        await historyEvent.sign();
        historyEvent.publish(this.relaySet);

        return { proofs: createResult.send, mint: createResult.mint };
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

    /**
     * Returns a map of the proof C values to the token where it was found
     * @param mint 
     * @returns 
     */
    private getAllMintProofTokenIds(mint?: MintUrl): Map<string, NDKEventId> {
        const allMintProofs = new Map<string, NDKEventId>();

        this.tokens
            .filter((t) => mint ? t.mint === mint : true)
            .forEach((t) => {
            t.proofs.forEach((p) => {
                allMintProofs.set(p.C, t.id);
            });
        });

        return allMintProofs;
    }

    /**
     * Returns a map of the token ids to the token
     * @param mint 
     * @returns 
     */
    private getTokensMap(mint: MintUrl) {
        const map = new Map<NDKEventId, NDKCashuToken>();

        if (!this.mintTokens[mint]) {
            console.trace("BUG: no entry in mintTokens for mint", mint);
            return map;
        }

        for (const token of this.mintTokens[mint]) {
            map.set(token.id, token);
        }
        
        return map;
    }

    /**
     * Calculates the new state of the wallet based on a given change.
     * 
     * This method processes the proofs to be stored, identifies proofs to be deleted,
     * and determines which tokens are affected by the change. It updates the wallet
     * state by:
     * - Collecting all proofs that are part of the new state.
     * - Identifying all proofs that are affected by the change.
     * - Removing proofs that are to be kept from the affected proofs.
     * - Identifying proofs that should be deleted.
     * - Processing affected tokens to determine which proofs need to be saved.
     * 
     * @param change The change to be applied to the wallet state.
     * @returns The new state of the wallet, including proofs to be saved, deleted, or reserved.
     */
    public async calculateNewState(change: WalletChange): Promise<WalletStateChange> {
        const newState: WalletStateChange = {
            deletedTokenIds: new Set<NDKEventId>(),
            deletedProofs: new Set<string>(),
            reserveProofs: [],
            saveProofs: [],
        };

        const newStateProofs = this.collectNewStateProofs(change.store);
        const allAffectedProofs = this.getAllMintProofTokenIds(change.mint);
        const tokenMap = this.getTokensMap(change.mint);

        this.processStoreProofs(change.store, allAffectedProofs, newState.saveProofs);
        this.identifyDeletedProofs(allAffectedProofs, newState.deletedProofs);

        this.processAffectedTokens(allAffectedProofs, tokenMap, newState, newStateProofs);

        return newState;
    }

    private collectNewStateProofs(store: Proof[]): Set<string> {
        const newStateProofs = new Set<string>();
        store.forEach(proof => newStateProofs.add(proof.C));
        return newStateProofs;
    }

    private processStoreProofs(store: Proof[], allAffectedProofs: Map<string, NDKEventId>, saveProofs: Proof[]) {
        for (const proof of store) {
            if (!allAffectedProofs.has(proof.C)) {
                saveProofs.push(proof);
            } else {
                allAffectedProofs.delete(proof.C);
            }
        }
    }

    private identifyDeletedProofs(allAffectedProofs: Map<string, NDKEventId>, deletedProofs: Set<string>) {
        allAffectedProofs.forEach((_, proofC) => {
            deletedProofs.add(proofC);
        });
    }

    private processAffectedTokens(
        allAffectedProofs: Map<string, NDKEventId>,
        tokenMap: Map<NDKEventId, NDKCashuToken>,
        newState: WalletStateChange,
        newStateProofs: Set<string>
    ) {
        const rolledOverProofs = new Set<string>();

        for (const tokenId of allAffectedProofs.values()) {
            newState.deletedTokenIds.add(tokenId);

            const token = tokenMap.get(tokenId);
            if (!token) {
                console.log("BUG! Unable to find a token that we should have!", {tokenId});
                console.log(`tokenMap (${tokenMap.size})`, Array.from(tokenMap.entries()));
                throw new Error("BUG! Unable to find a token that we should have!");
            }

            for (const proof of token.proofs) {
                if (newStateProofs.has(proof.C) && !rolledOverProofs.has(proof.C)) {
                    newState.saveProofs.push(proof);
                    rolledOverProofs.add(proof.C);
                }
            }
        }
    }

    /**
     * Updates the wallet state based on a send result
     * @param sendResult 
     */
    public async updateState(change: WalletChange) {
        const newState = await this.calculateNewState(change);

        // create the new token if we have to
        if (newState.saveProofs.length > 0) {
            const newToken = new NDKCashuToken(this.ndk);
            newToken.proofs = newState.saveProofs;
            console.log('publishing a new token with %d proofs', newState.saveProofs.length);
            newToken.mint = change.mint;
            newToken.wallet = this;
            await newToken.sign();
            await newToken.publish(this.relaySet);
        }

        // delete the tokens that are affected
        if (newState.deletedTokenIds.size > 0) {
            const deleteEvent = new NDKEvent(this.ndk, {
                kind: NDKKind.EventDeletion,
                tags: [
                    [ "k", NDKKind.CashuToken.toString() ],
                    ...Array.from(newState.deletedTokenIds).map((id) => ([ "e", id ])),
                ]
            } as NostrEvent);
            await deleteEvent.sign();
            console.log("publishing delete event", JSON.stringify(deleteEvent.rawEvent(), null, 4));
            await deleteEvent.publish(this.relaySet);
        }

        // create the reserve token if we have to
        if (newState.reserveProofs.length > 0) {
            const reserveToken = new NDKCashuToken(this.ndk);
            reserveToken.proofs = newState.reserveProofs;
            reserveToken.mint = change.mint;
            reserveToken.wallet = this;
            await reserveToken.sign();
            await reserveToken.publish(this.relaySet);
        }
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

    /**
     * Returns a wallet for a given mint
     * @param mint 
     * @returns CashuWallet
     */
    public async walletForMint(mint: MintUrl): Promise<CashuWallet | null> {
        if (this._wallets[mint]) return this._wallets[mint];

        let unit = this.unit;

        if (unit === 'sats') {
            unit = 'sat';
        }

        try {
            const wallet = new CashuWallet(new CashuMint(mint), { unit });
            console.log("[WALLET] loading mint", mint);
            await wallet.loadMint();
            console.log("[WALLET] loaded mint", mint);
            this._wallets[mint] = wallet;
            return wallet;
        } catch (e) {
            return null;
        }
    }

    async redeemNutzap(nutzap: NDKEvent) {
        // this.emit("nutzap:seen", nutzap);

        try {
            const mint = nutzap.tagValue("u");
            if (!mint) throw new Error("missing mint");
            const proofs = JSON.parse(nutzap.content);
            console.log(proofs);

            const _wallet = await this.walletForMint(mint);
            if (!_wallet) throw new Error("unable to load wallet for mint " + mint);
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
    async saveProofs(proofs: Proof[], mint: MintUrl, { nutzap, direction, amount }: SaveProofsOptions) {
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

            historyEvent.amount = amount;
            historyEvent.unit = this.unit;
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

                    this.emit("warning", {
                        msg: "Received an older token with proofs that were already known, this is likely a relay that didn't receive (or respected) a delete event",
                        event: token,
                        relays: token.onRelays
                    })
                    
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
