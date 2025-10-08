import type { CashuWallet, GetInfoResponse, SendResponse } from "@cashu/cashu-ts";
import { getDecodedToken } from "@cashu/cashu-ts";
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
import { ndkSync } from "@nostr-dev-kit/sync";
import {
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

    public relaySet?: NDKRelaySet;

    private _walletEvent?: NDKEvent;

    constructor(ndk: NDK) {
        super(ndk);
        this.ndk = ndk;
        this.paymentHandler = new PaymentHandler(this);
        this.state = new WalletState(this);
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
            }
        }

        await this.getP2pk();

        // Store the original wallet event (not the clone) for relay extraction
        this._walletEvent = event;
    }

    static async from(event: NDKEvent): Promise<NDKCashuWallet | undefined> {
        if (!event.ndk) throw new Error("no ndk instance on event");

        const wallet = new NDKCashuWallet(event.ndk);
        await wallet.loadFromEvent(event);

        return wallet;
    }

    /**
     * Fetches relay configuration for the wallet according to NIP-60.
     * First tries to get relays from "relay" tags in the 17375 wallet event,
     * falls back to NIP-65 (kind 10002) relays if not found.
     */
    private async fetchWalletRelays(pubkey: string): Promise<NDKRelaySet | undefined> {
        // First check for relay tags in the wallet event (kind 17375)
        if (this._walletEvent) {
            const relayTags = this._walletEvent.tags.filter((tag) => tag[0] === "relay");
            if (relayTags.length > 0) {
                const relayUrls = relayTags.map((tag) => tag[1]);
                return NDKRelaySet.fromRelayUrls(relayUrls, this.ndk!);
            }
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
        const startTime = Date.now();
        console.log(`[${new Date().toISOString()}] [NDKCashuWallet.start] Starting wallet initialization`);

        const activeUser = this.ndk?.activeUser;

        if (this.status === NDKWalletStatus.READY) return Promise.resolve();

        this.setStatus(NDKWalletStatus.LOADING);

        const pubkey = opts?.pubkey ?? activeUser?.pubkey;
        if (!pubkey) throw new Error("no pubkey");

        // Fetch wallet relays according to NIP-60
        if (!this.relaySet) {
            console.log(`[${new Date().toISOString()}] [NDKCashuWallet.start] Fetching wallet relays`);
            this.relaySet = await this.fetchWalletRelays(pubkey);
            console.log(
                `[${new Date().toISOString()}] [NDKCashuWallet.start] Wallet relays fetched:`,
                this.relaySet?.relays.size ?? 0,
            );
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
            console.log(`[${new Date().toISOString()}] [NDKCashuWallet.start] Loading events from cache`);
            const cacheLoadStart = Date.now();

            const cacheEvents: NDKEvent[] = [];

            // Try direct query first
            const events = await this.ndk.fetchEvents([{ kinds: [NDKKind.CashuToken], authors: [pubkey] }], {
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
            });
            cacheEvents.push(...events);

            console.log(
                `[${new Date().toISOString()}] [NDKCashuWallet.start] Loaded ${cacheEvents.length} events from cache in ${Date.now() - cacheLoadStart}ms`,
            );

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
                const syncStartTime = Date.now();

                // Perform initial sync using Negentropy
                const syncResult = await ndkSync.call(this.ndk, filters, {
                    relaySet: this.relaySet,
                    autoFetch: true,
                });

                console.log(
                    `[${new Date().toISOString()}] [NDKCashuWallet.start] Sync completed in ${Date.now() - syncStartTime}ms, processing ${syncResult.events.length} events`,
                );

                // Process synced events
                const processStartTime = Date.now();
                for (const event of syncResult.events) {
                    eventHandler.call(this, event);
                }
                console.log(
                    `[${new Date().toISOString()}] [NDKCashuWallet.start] Events processed in ${Date.now() - processStartTime}ms`,
                );

                // Start live subscription for new events
                const subOpts: NDKSubscriptionOptions = opts ?? {};
                subOpts.subId ??= "cashu-wallet-state";

                const liveFilters = filters.map((f) => ({
                    ...f,
                    since: Math.floor(Date.now() / 1000) - 60,
                }));

                console.log(`[${new Date().toISOString()}] [NDKCashuWallet.start] Starting live subscription`);
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
                console.log(
                    `[${new Date().toISOString()}] [NDKCashuWallet.start] Wallet ready (total time: ${Date.now() - startTime}ms)`,
                );
            } catch (error) {
                console.error(
                    `[${new Date().toISOString()}] [NDKCashuWallet.start] Sync failed, falling back to subscription:`,
                    error,
                );
                // Fall back to regular subscription if sync fails
                await this.startWithSubscription(filters, opts);
            }
        } else {
            console.log(`[${new Date().toISOString()}] [NDKCashuWallet.start] No cache adapter, using subscription`);
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
            const oldStatus = this.status;
            this.status = status;
            console.log(`[${new Date().toISOString()}] [NDKCashuWallet] Status changed: ${oldStatus} -> ${status}`);
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

        return payloadForEvent(privkeys, this.mints);
    }

    async publish() {
        const event = new NDKEvent(this.ndk, {
            content: JSON.stringify(this.walletPayload()),
            kind: NDKKind.CashuWallet,
        });

        // Add relay tags if relaySet exists
        if (this.relaySet) {
            for (const relay of this.relaySet.relays) {
                event.tags.push(["relay", relay.url]);
            }
        }

        const user = await this.ndk?.signer?.user();
        await event.encrypt(user, undefined, "nip44");

        return event.publish(this.relaySet);
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
