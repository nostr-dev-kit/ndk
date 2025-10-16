import type { CashuWallet, GetInfoResponse, SendResponse } from "@cashu/cashu-ts";
import { getDecodedToken, getEncodedToken } from "@cashu/cashu-ts";
import type NDK from "@nostr-dev-kit/ndk";
import {
    type CashuPaymentInfo,
    type Hexpubkey,
    type LnPaymentInfo,
    NDKEvent,
    type NDKFilter,
    NDKKind,
    type NDKNutzap,
    type NDKPaymentConfirmationCashu,
    type NDKPaymentConfirmationLN,
    NDKPrivateKeySigner,
    type NDKRelay,
    NDKRelayList,
    NDKRelaySet,
    type NDKSubscription,
    NDKSubscriptionCacheUsage,
    type NDKSubscriptionOptions,
    type NDKTag,
    type NDKZapDetails,
} from "@nostr-dev-kit/ndk";
import { NDKSync } from "@nostr-dev-kit/sync";
import {
    createMintCacheCallbacks,
    NDKWallet,
    type NDKWalletBalance,
    NDKWalletStatus,
    type NDKWalletTypes,
    type RedeemNutzapsOpts,
} from "../../index.js";
import { NDKCashuDeposit } from "../deposit.js";
import { NDKCashuDepositMonitor } from "../deposit-monitor.js";
import { eventDupHandler, eventHandler } from "../event-handlers/index.js";
import type { MintUrl } from "../mint/utils.js";
import { consolidateTokens } from "../validate.js";

export type WalletWarning = {
    msg: string;
    event?: NDKEvent;
    relays?: NDKRelay[];
};

import { PaymentHandler, type PaymentWithOptionalZapInfo } from "./payment.js";
import { WalletState } from "./state/index.js";
import { createInTxEvent, createOutTxEvent } from "./txs.js";

/**
 * This class tracks state of a NIP-60 wallet
 *
 * @example
 * // Modify mints and relays directly, then publish
 * wallet.mints = [...wallet.mints, 'https://mint.example.com'];
 * wallet.relaySet = NDKRelaySet.fromRelayUrls(['wss://relay.example.com'], ndk);
 * await wallet.publish();
 */
export class NDKCashuWallet extends NDKWallet {
    get type(): NDKWalletTypes {
        return "nip-60";
    }

    public _p2pk: string | undefined;
    private sub?: NDKSubscription;

    public status: NDKWalletStatus = NDKWalletStatus.INITIAL;

    static kind = NDKKind.CashuWallet;
    static kinds = [NDKKind.CashuWallet];

    /**
     * List of mint URLs configured for this wallet.
     * Modify directly to add/remove mints, then call publish() to save.
     *
     * @example
     * // Add a mint
     * wallet.mints = [...wallet.mints, 'https://mint.example.com'];
     * await wallet.publish();
     *
     * @example
     * // Remove a mint
     * wallet.mints = wallet.mints.filter(url => url !== 'https://old-mint.com');
     * await wallet.publish();
     */
    public mints: string[] = [];
    public privkeys = new Map<string, NDKPrivateKeySigner>();
    public signer?: NDKPrivateKeySigner;

    public walletId = "nip-60";

    public depositMonitor = new NDKCashuDepositMonitor();

    /**
     * Warnings that have been raised
     */
    public warnings: WalletWarning[] = [];

    public paymentHandler: PaymentHandler;
    public state: WalletState;

    /**
     * Relay set for wallet events (kinds 7374, 7375, 7376).
     * Modify directly to add/remove relays, then call publish() to save.
     * If undefined, falls back to NIP-65 relay list.
     *
     * @example
     * // Set relays
     * wallet.relaySet = NDKRelaySet.fromRelayUrls(['wss://relay1.com', 'wss://relay2.com'], ndk);
     * await wallet.publish();
     *
     * @example
     * // Clear relays (use NIP-65 fallback)
     * wallet.relaySet = undefined;
     * await wallet.publish();
     */
    public relaySet?: NDKRelaySet;

    private _walletRelays: string[] = [];

    constructor(ndk: NDK) {
        super(ndk);
        this.ndk = ndk;
        this.paymentHandler = new PaymentHandler(this);
        this.state = new WalletState(this);

        // Setup mint info/keys caching callbacks if cache adapter supports generic cache
        if (ndk.cacheAdapter?.getCacheData && ndk.cacheAdapter?.setCacheData) {
            const callbacks = createMintCacheCallbacks(ndk.cacheAdapter);
            this.onMintInfoNeeded = callbacks.onMintInfoNeeded;
            this.onMintInfoLoaded = callbacks.onMintInfoLoaded;
            this.onMintKeysNeeded = callbacks.onMintKeysNeeded;
            this.onMintKeysLoaded = callbacks.onMintKeysLoaded;
        }
    }

    /**
     * Generates a backup event for this wallet
     */
    async backup(publish = true) {
        // check if we have a key to backup
        if (this.privkeys.size === 0) throw new Error("no privkey to backup");

        const backup = new NDKCashuWalletBackup(this.ndk);

        const privkeys: string[] = [];
        for (const [_pubkey, signer] of this.privkeys.entries()) {
            privkeys.push(signer.privateKey!);
        }

        backup.privkeys = privkeys;
        backup.mints = this.mints;
        if (publish) backup.save(this.relaySet);

        return backup;
    }

    public consolidateTokens = consolidateTokens.bind(this);

    /**
     * Generates nuts that can be used to send to someone.
     *
     * Note that this function does not send anything, it just generates a specific amount of proofs.
     * @param amounts
     * @returns
     */
    async mintNuts(amounts: number[]) {
        let result: SendResponse | undefined;
        const totalAmount = amounts.reduce((acc, amount) => acc + amount, 0);

        for (const mint of this.mints) {
            const wallet = await this.getCashuWallet(mint);
            const mintProofs = await this.state.getProofs({ mint });
            result = await wallet.send(totalAmount, mintProofs, {
                proofsWeHave: mintProofs,
                includeFees: true,
                outputAmounts: {
                    sendAmounts: amounts,
                },
            });

            if (result.send.length > 0) {
                const change = { store: result?.keep ?? [], destroy: result.send, mint };
                const updateRes = await this.state.update(change);

                // create a change event
                createOutTxEvent(
                    this.ndk,
                    {
                        paymentDescription: "minted nuts",
                        amount: amounts.reduce((acc, amount) => acc + amount, 0),
                    },
                    {
                        result: { proofs: result.send, mint },
                        proofsChange: change,
                        stateUpdate: updateRes,
                        mint,
                        fee: 0,
                    },
                    this.relaySet,
                );
                this.emit("balance_updated");

                return result;
            }
        }
    }

    /**
     * Creates a cashu token that can be sent to someone.
     * This method mints the specified amount and returns an encoded token string.
     *
     * @param amount - Amount in satoshis to send
     * @param memo - Optional memo to include in the token
     * @returns Encoded cashu token string
     *
     * @example
     * const token = await wallet.send(1000, "Coffee payment");
     * // token is a cashu token string that can be shared
     */
    async send(amount: number, memo?: string): Promise<string> {
        if (this.mints.length === 0) throw new Error("No mints configured");

        const result = await this.mintNuts([amount]);
        if (!result) throw new Error("Failed to create token");

        return getEncodedToken({
            mint: this.mints[0],
            proofs: result.send,
            memo,
        });
    }

    /**
     * Loads a wallet information from an event
     * @param event
     */
    async loadFromEvent(event: NDKEvent) {
        // clone the event
        const _event = new NDKEvent(event.ndk, event.rawEvent());

        await _event.decrypt();

        const content = JSON.parse(_event.content);
        for (const tag of content) {
            if (tag[0] === "mint") {
                this.mints.push(tag[1]);
            } else if (tag[0] === "privkey") {
                await this.addPrivkey(tag[1]);
            } else if (tag[0] === "relay") {
                this._walletRelays.push(tag[1]);
            }
        }

        await this.getP2pk();
    }

    static async from(event: NDKEvent): Promise<NDKCashuWallet | undefined> {
        if (!event.ndk) throw new Error("no ndk instance on event");

        const wallet = new NDKCashuWallet(event.ndk);
        await wallet.loadFromEvent(event);

        return wallet;
    }

    /**
     * Creates a new NIP-60 wallet with the specified configuration.
     * Generates a private key, publishes the wallet event (kind 17375), and creates a backup (kind 375).
     *
     * @param ndk - NDK instance
     * @param mints - Array of mint URLs to configure
     * @param relays - Optional array of relay URLs for wallet events
     * @returns The newly created and published wallet
     *
     * @example
     * const wallet = await NDKCashuWallet.create(
     *   ndk,
     *   ['https://mint.example.com'],
     *   ['wss://relay.example.com']
     * );
     */
    static async create(ndk: NDK, mints: string[], relays?: string[]): Promise<NDKCashuWallet> {
        const wallet = new NDKCashuWallet(ndk);

        // Generate and add a private key
        const signer = NDKPrivateKeySigner.generate();
        await wallet.addPrivkey(signer.privateKey!);

        // Set mints
        wallet.mints = mints;

        // Set relays if provided
        if (relays && relays.length > 0) {
            wallet.relaySet = NDKRelaySet.fromRelayUrls(relays, ndk);
        }

        // Publish wallet event (kind 17375)
        await wallet.publish();

        // Create and publish backup (kind 375)
        await wallet.backup(true);

        return wallet;
    }

    /**
     * Fetches relay configuration for the wallet according to NIP-60.
     * First tries to get relays from encrypted wallet relays,
     * falls back to NIP-65 (kind 10002) relays if not found.
     */
    private async fetchWalletRelays(pubkey: string): Promise<NDKRelaySet | undefined> {
        // First check for relay URLs from encrypted wallet content
        if (this._walletRelays.length > 0) {
            return NDKRelaySet.fromRelayUrls(this._walletRelays, this.ndk!);
        }

        // Fallback to NIP-65 relays (kind 10002)
        const relayListEvent = await this.ndk.fetchEvent(
            { kinds: [NDKKind.RelayList], authors: [pubkey] },
            { cacheUsage: NDKSubscriptionCacheUsage.PARALLEL },
        );

        if (relayListEvent) {
            return NDKRelayList.from(relayListEvent).relaySet;
        }

        // No specific relays found, will use default NDK relays
        return undefined;
    }

    /**
     * Starts monitoring the wallet.
     *
     * Use `since` to start syncing state from a specific timestamp. This should be
     * used by storing at the app level a time in which we know we were able to communicate
     * with the relays, for example, by saving the time the wallet has emitted a "ready" event.
     */
    async start(opts?: NDKSubscriptionOptions & { pubkey?: Hexpubkey; since?: number }): Promise<void> {
        const activeUser = this.ndk?.activeUser;

        if (this.status === NDKWalletStatus.READY) return Promise.resolve();

        this.setStatus(NDKWalletStatus.LOADING);

        const pubkey = opts?.pubkey ?? activeUser?.pubkey;
        if (!pubkey) throw new Error("no pubkey");

        // Fetch wallet relays according to NIP-60
        if (!this.relaySet) {
            this.relaySet = await this.fetchWalletRelays(pubkey);
        }

        const filters: NDKFilter[] = [
            { kinds: [NDKKind.CashuToken], authors: [pubkey] },
            { kinds: [NDKKind.CashuQuote], authors: [pubkey] },
            {
                kinds: [NDKKind.EventDeletion],
                authors: [pubkey],
                "#k": [NDKKind.CashuToken.toString()],
            },
        ];

        if (opts?.since) {
            filters[0].since = opts.since;
            filters[1].since = opts.since;
            filters[2].since = opts.since;
        }

        // Load from cache first to show optimistic state
        if (this.ndk.cacheAdapter) {
            const cacheEvents: NDKEvent[] = [];

            // Try direct query first
            const events = await this.ndk.fetchEvents([{ kinds: [NDKKind.CashuToken], authors: [pubkey] }], {
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
            });
            cacheEvents.push(...events);

            // Process cached events
            for (const event of cacheEvents) {
                eventHandler.call(this, event);
            }

            // Emit balance update after loading from cache
            this.emit("balance_updated");
        }

        // Use sync if cache adapter is available, otherwise fall back to subscription
        if (this.ndk.cacheAdapter) {
            try {
                // Perform initial sync using Negentropy with capability caching and fallback
                const syncResult = await NDKSync.sync(this.ndk, filters, {
                    relaySet: this.relaySet,
                    autoFetch: true,
                });

                // Process synced events
                for (const event of syncResult.events) {
                    eventHandler.call(this, event);
                }

                // Start live subscription for new events
                const subOpts: NDKSubscriptionOptions = opts ?? {};
                subOpts.subId ??= "cashu-wallet-state";

                const liveFilters = filters.map((f) => ({
                    ...f,
                    since: Math.floor(Date.now() / 1000) - 60,
                }));

                this.sub = this.ndk.subscribe(liveFilters, {
                    ...subOpts,
                    relaySet: this.relaySet,
                    closeOnEose: false,
                    onEvent: (event: NDKEvent) => {
                        eventHandler.call(this, event);
                    },
                    onEventDup: eventDupHandler.bind(this),
                });

                this.emit("ready");
                this.setStatus(NDKWalletStatus.READY);
            } catch (error) {
                console.error(`[NDKCashuWallet] Sync failed, falling back to subscription:`, error);
                // Fall back to regular subscription if sync fails
                await this.startWithSubscription(filters, opts);
            }
        } else {
            // No cache adapter - use regular subscription
            await this.startWithSubscription(filters, opts);
        }
    }

    /**
     * Starts wallet monitoring using traditional subscription (fallback when sync unavailable)
     */
    private async startWithSubscription(filters: NDKFilter[], opts?: NDKSubscriptionOptions): Promise<void> {
        const subOpts: NDKSubscriptionOptions = opts ?? {};
        subOpts.subId ??= "cashu-wallet-state";

        return new Promise<void>((resolve) => {
            this.sub = this.ndk.subscribe(filters, {
                ...subOpts,
                relaySet: this.relaySet,
                onEvent: (event: NDKEvent) => {
                    eventHandler.call(this, event);
                },
                onEose: async () => {
                    this.emit("ready");
                    this.setStatus(NDKWalletStatus.READY);
                    resolve();
                },
                onEventDup: eventDupHandler.bind(this),
            });
        });
    }

    stop() {
        this.sub?.stop();
        this.setStatus(NDKWalletStatus.INITIAL);
    }

    private setStatus(status: NDKWalletStatus) {
        if (this.status !== status) {
            this.status = status;
            this.emit("status_changed", status);
        }
    }

    /**
     * Returns the p2pk of this wallet or generates a new one if we don't have one
     */
    async getP2pk(): Promise<string> {
        if (this._p2pk) return this._p2pk;

        if (this.privkeys.size === 0) {
            const signer = NDKPrivateKeySigner.generate();
            await this.addPrivkey(signer.privateKey!);
        }

        return this.p2pk;
    }

    /**
     * If this wallet has access to more than one privkey, this will return all of them.
     */
    get p2pks(): string[] {
        return Array.from(this.privkeys.keys());
    }

    async addPrivkey(privkey: string) {
        const signer = new NDKPrivateKeySigner(privkey);
        const user = await signer.user();
        this.privkeys.set(user.pubkey, signer);

        this._p2pk ??= user.pubkey;

        return this._p2pk;
    }

    get p2pk(): string {
        if (!this._p2pk) throw new Error("p2pk not set");
        return this._p2pk;
    }

    set p2pk(pubkey: string) {
        if (this.privkeys.has(pubkey)) {
            this.signer = this.privkeys.get(pubkey);
            this.p2pk = pubkey;
        } else {
            throw new Error(`privkey for ${pubkey} not found`);
        }
    }

    /**
     * Generates the payload for a wallet event
     */
    private walletPayload(): NDKTag[] {
        const privkeys = Array.from(this.privkeys.values()).map((signer) => signer.privateKey!);

        const payload = payloadForEvent(privkeys, this.mints);

        // Add relay tags to encrypted payload
        if (this._walletRelays.length > 0) {
            payload.push(...this._walletRelays.map((relay) => ["relay", relay] as NDKTag));
        }

        return payload;
    }

    /**
     * Publishes the wallet configuration (kind 17375) to save changes.
     * Call this after modifying mints or relaySet to persist the configuration.
     *
     * The wallet event contains encrypted mint URLs, private keys, and relay URLs.
     *
     * @example
     * // Add a mint and save
     * wallet.mints.push('https://mint.example.com');
     * await wallet.publish();
     *
     * @example
     * // Update relays and save
     * wallet.relaySet = NDKRelaySet.fromRelayUrls(['wss://relay.example.com'], ndk);
     * await wallet.publish();
     */
    async publish() {
        // Populate wallet relays from relaySet if it exists
        if (this.relaySet) {
            this._walletRelays = Array.from(this.relaySet.relays).map((relay) => relay.url);
        }

        const event = new NDKEvent(this.ndk, {
            content: JSON.stringify(this.walletPayload()),
            kind: NDKKind.CashuWallet,
        });

        const user = await this.ndk?.signer?.user();
        await event.encrypt(user, undefined, "nip44");

        return event.publish(this.relaySet);
    }

    /**
     * Updates wallet configuration (mints and relays) and publishes the changes.
     * Uses publishReplaceable to ensure the event replaces the previous wallet configuration.
     *
     * @param config - Configuration object with mints and optional relays
     *
     * @example
     * // Update mints only
     * await wallet.update({ mints: ['https://mint.example.com'] });
     *
     * @example
     * // Update both mints and relays
     * await wallet.update({
     *   mints: ['https://mint.example.com'],
     *   relays: ['wss://relay.example.com']
     * });
     */
    async update(config: { mints: string[]; relays?: string[] }) {
        // Update mints
        this.mints = config.mints;

        // Update relays
        if (config.relays && config.relays.length > 0) {
            this.relaySet = NDKRelaySet.fromRelayUrls(config.relays, this.ndk);
            this._walletRelays = config.relays;
        } else {
            this.relaySet = undefined;
            this._walletRelays = [];
        }

        // Create wallet event
        const event = new NDKEvent(this.ndk, {
            content: JSON.stringify(this.walletPayload()),
            kind: NDKKind.CashuWallet,
        });

        const user = await this.ndk?.signer?.user();
        await event.encrypt(user, undefined, "nip44");

        return event.publishReplaceable(this.relaySet);
    }

    /**
     * Prepares a deposit
     * @param amount
     * @param mint
     *
     * @example
     * const wallet = new NDKCashuWallet(...);
     * const deposit = wallet.deposit(1000, "https://mint.example.com", "sats");
     * deposit.on("success", (token) => {
     * });
     * deposit.on("error", (error) => {
     * });
     *
     * // start monitoring the deposit
     * deposit.start();
     */
    public deposit(amount: number, mint?: string): NDKCashuDeposit {
        const deposit = new NDKCashuDeposit(this, amount, mint);
        deposit.on("success", (token) => {
            this.state.addToken(token);
        });
        return deposit;
    }

    /**
     * Receives a token and adds it to the wallet
     * @param token
     * @returns the token event that was created
     */
    public async receiveToken(token: string, description?: string) {
        const { mint } = getDecodedToken(token);
        const wallet = await this.getCashuWallet(mint);
        const proofs = await wallet.receive(token);

        const updateRes = await this.state.update({
            store: proofs,
            mint,
        });
        const tokenEvent = updateRes.created;

        createInTxEvent(this.ndk, proofs, mint, updateRes, { description }, this.relaySet);

        return tokenEvent;
    }

    /**
     * Pay a LN invoice with this wallet
     */
    async lnPay(
        payment: PaymentWithOptionalZapInfo<LnPaymentInfo>,
        createTxEvent = true,
    ): Promise<NDKPaymentConfirmationLN | undefined> {
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

    public wallets = new Map<string, CashuWallet>();

    async redeemNutzaps(
        nutzaps: NDKNutzap[],
        privkey: string,
        { mint, proofs, cashuWallet }: RedeemNutzapsOpts,
    ): Promise<number> {
        if (cashuWallet) {
            mint ??= cashuWallet.mint.mintUrl;
        } else {
            if (!mint) throw new Error("mint not set");
            cashuWallet = await this.getCashuWallet(mint);
        }

        if (!mint) throw new Error("mint not set");
        if (!proofs) throw new Error("proofs not set");

        try {
            const proofsWeHave = this.state.getProofs({ mint });
            const res = await cashuWallet.receive({ proofs, mint }, { proofsWeHave, privkey });

            const receivedAmount = proofs.reduce((acc, proof) => acc + proof.amount, 0);
            const redeemedAmount = res.reduce((acc, proof) => acc + proof.amount, 0);
            const fee = receivedAmount - redeemedAmount;

            const updateRes = await this.state.update({
                store: res,
                mint,
            });

            createInTxEvent(this.ndk, res, mint, updateRes, { nutzaps, fee }, this.relaySet);

            return receivedAmount;
        } catch (e) {
            console.error(
                "error redeeming nutzaps",
                nutzaps.map((n) => n.encode()),
                e,
            );
            throw e;
        }
    }

    public warn(msg: string, event?: NDKEvent, relays?: NDKRelay[]) {
        relays ??= event?.onRelays;
        this.warnings.push({ msg, event, relays });
        this.emit("warning", { msg, event, relays });
    }

    get balance(): NDKWalletBalance | undefined {
        return {
            amount: this.state.getBalance({ onlyAvailable: true }),
        };
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
        return this.state.getMintsBalance({ onlyAvailable: true });
    }

    /**
     * Returns a list of mints that have enough available balance (excluding reserved proofs)
     * to cover the specified amount
     */
    getMintsWithBalance(amount: number): MintUrl[] {
        const availableBalances = this.state.getMintsBalance({ onlyAvailable: true });
        return Object.entries(availableBalances)
            .filter(([_, balance]) => balance >= amount)
            .map(([mint]) => mint);
    }

    /**
     * Gets mint information for a specific mint URL.
     * Returns cached info if available, otherwise fetches from the mint.
     */
    async getMintInfo(mintUrl: string): Promise<GetInfoResponse | undefined> {
        const cashuWallet = await this.getCashuWallet(mintUrl);
        return await cashuWallet.mint.getInfo();
    }
}

export class NDKCashuWalletBackup extends NDKEvent {
    public privkeys: string[] = [];
    public mints: string[] = [];

    constructor(ndk: NDK, event?: NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuWalletBackup;
    }

    static async from(event: NDKEvent): Promise<NDKCashuWalletBackup | undefined> {
        if (!event.ndk) throw new Error("no ndk instance on event");

        const backup = new NDKCashuWalletBackup(event.ndk, event);

        try {
            await backup.decrypt();
            const content = JSON.parse(backup.content);
            for (const tag of content) {
                if (tag[0] === "mint") {
                    backup.mints.push(tag[1]);
                } else if (tag[0] === "privkey") {
                    backup.privkeys.push(tag[1]);
                }
            }
        } catch (e) {
            console.error("error decrypting backup event", backup.encode(), e);
            return;
        }

        return backup;
    }

    async save(relaySet?: NDKRelaySet) {
        if (!this.ndk) throw new Error("no ndk instance");
        if (!this.privkeys.length) throw new Error("no privkeys");
        this.content = JSON.stringify(payloadForEvent(this.privkeys, this.mints));
        await this.encrypt(this.ndk.activeUser!, undefined, "nip44");
        return this.publish(relaySet);
    }
}

function payloadForEvent(privkeys: string[], mints: string[]) {
    if (privkeys.length === 0) throw new Error("privkey not set");

    const payload: NDKTag[] = [
        ...mints.map((mint) => ["mint", mint]),
        ...privkeys.map((privkey) => ["privkey", privkey]),
    ];

    return payload;
}
