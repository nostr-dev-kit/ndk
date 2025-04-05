import debug from "debug";
import { EventEmitter } from "tseep";

import type { NostrEvent } from "nostr-tools";
import type { NDKCacheAdapter } from "../cache/index.js";
import dedupEvent from "../events/dedup.js";
import type { NDKEventId, NDKTag } from "../events/index.js";
import { NDKEvent } from "../events/index.js";
import { signatureVerificationInit } from "../events/signature.js";
import { OutboxTracker } from "../outbox/tracker.js";
import type { NDKAuthPolicy } from "../relay/auth-policies.js";
import { NDKRelay } from "../relay/index.js";
import { NDKPool } from "../relay/pool/index.js";
import type { NDKPublishError } from "../relay/sets/index.js";
import { NDKRelaySet } from "../relay/sets/index.js";
import { correctRelaySet } from "../relay/sets/utils.js";
import type { NDKSigner } from "../signers/index.js";
import type { NDKFilter, NDKSubscriptionOptions } from "../subscription/index.js";
import { NDKSubscription } from "../subscription/index.js";
import { NDKSubscriptionManager } from "../subscription/manager.js";
import { filterFromId, isNip33AValue, relaysFromBech32 } from "../subscription/utils.js";
import type { Hexpubkey, NDKUserParams, ProfilePointer } from "../user/index.js";
import { NDKUser } from "../user/index.js";
import type { CashuPayCb, LnPayCb, NDKPaymentConfirmation, NDKZapSplit } from "../zapper/index.js";
import type { NDKLnUrlData } from "../zapper/ln.js";
import { setActiveUser } from "./active-user.js";
import { getEntity } from "./entity.js";
import { fetchEventFromTag } from "./fetch-event-from-tag.js";
import { Queue } from "./queue/index.js";

export type NDKValidationRatioFn = (relay: NDKRelay, validatedCount: number, nonValidatedCount: number) => number;

export type NDKNetDebug = (msg: string, relay: NDKRelay, direction?: "send" | "recv") => void;

/**
 * An interface compatible with ndk-wallet that allows setting multiple handlers and callbacks.
 */
export interface NDKWalletInterface {
    lnPay?: LnPayCb;
    cashuPay?: CashuPayCb;
    onPaymentComplete?: (results: Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>) => void;
}

export interface NDKConstructorParams {
    /**
     * Relays we should explicitly connect to
     */
    explicitRelayUrls?: string[];

    /**
     * Relays we should never connect to
     */
    blacklistRelayUrls?: string[];

    /**
     * When this is set, we always write only to this relays.
     */
    devWriteRelayUrls?: string[];

    /**
     * Outbox relay URLs.
     */
    outboxRelayUrls?: string[];

    /**
     * Enable outbox model (defaults to false)
     */
    enableOutboxModel?: boolean;

    /**
     * Auto-connect to main user's relays. The "main" user is determined
     * by the presence of a signer. Upon connection to the explicit relays,
     * the user's relays will be fetched and connected to if this is set to true.
     * @default true
     */
    autoConnectUserRelays?: boolean;

    /**
     * Automatically fetch user's mutelist
     * @default true
     */
    autoFetchUserMutelist?: boolean;

    /**
     * Signer to use for signing events by default
     */
    signer?: NDKSigner;

    /**
     * Cache adapter to use for caching events
     */
    cacheAdapter?: NDKCacheAdapter;

    /**
     * Debug instance to use
     */
    debug?: debug.Debugger;

    /**
     * Provide a caller function to receive all networking traffic from relays
     */
    netDebug?: NDKNetDebug;

    /**
     * Muted pubkeys and eventIds
     */
    mutedIds?: Map<Hexpubkey | NDKEventId, string>;

    /**
     * Client name to add to events' tag
     */
    clientName?: string;

    /**
     * Client nip89 to add to events' tag
     */
    clientNip89?: string;

    /**
     * Default relay-auth policy
     */
    relayAuthDefaultPolicy?: NDKAuthPolicy;

    /**
     * Whether to verify signatures on events synchronously or asynchronously.
     *
     * @default undefined
     *
     * When set to true, the signature verification will processed in a web worker.
     * You should listen for the `event:invalid-sig` event to handle invalid signatures.
     *
     * @example
     * ```typescript
     * const worker = new Worker("path/to/signature-verification.js");
     * ndk.delayedSigVerification = worker;
     * ndk.on("event:invalid-sig", (event) => {
     *    console.error("Invalid signature", event);
     * });
     */
    signatureVerificationWorker?: Worker | undefined;

    /**
     * The signature verification validation ratio for new relays.
     */
    initialValidationRatio?: number;

    /**
     * The lowest validation ratio any single relay can have.
     * Relays will have a sample of events verified based on this ratio.
     * When using this, you MUST listen for event:invalid-sig events
     * to handle invalid signatures and disconnect from evil relays.
     *
     * @default 0.1
     */
    lowestValidationRatio?: number;

    /**
     * A function that is invoked to calculate the validation ratio for a relay.
     */
    validationRatioFn?: NDKValidationRatioFn;
}

export interface GetUserParams extends NDKUserParams {
    npub?: string;
    pubkey?: string;

    /**
     * @deprecated Use `pubkey` instead
     */
    hexpubkey?: string;
}

export const DEFAULT_OUTBOX_RELAYS = ["wss://purplepag.es/", "wss://nos.lol/"];

/**
 * TODO: Move this to a outbox policy
 */
export const DEFAULT_BLACKLISTED_RELAYS = [
    "wss://brb.io/", // BRB
    "wss://nostr.mutinywallet.com/", // Don't try to read from this relay since it's a write-only relay
    // "wss://purplepag.es/", // This is a hack, since this is a mostly read-only relay, but not fully. Once we have relay routing this can be removed so it only receives the supported kinds
];

/**
 * Defines handlers that can be passed to `ndk.subscribe` via the `autoStart` parameter
 * to react to subscription lifecycle events.
 */
export interface NDKSubscriptionEventHandlers {
    /**
     * Called for each individual event received from relays *after* the initial cache load (if `onEvents` is provided),
     * or for *all* events (including cached ones) if `onEvents` is not provided.
     * @param event The received NDKEvent.
     * @param relay The relay the event was received from (undefined if from cache).
     */
    onEvent?: (event: NDKEvent, relay?: NDKRelay) => void;

    /**
     * Called *once* with an array of all events found synchronously in the cache when the subscription starts.
     * If this handler is provided, `onEvent` will *not* be called for this initial batch of cached events.
     * This is useful for bulk processing or batching UI updates based on the initial cached state.
     * @param events An array of NDKEvents loaded synchronously from the cache.
     */
    onEvents?: (events: NDKEvent[]) => void; // Parameter name is already 'events'

    /**
     * Called when the subscription receives an EOSE (End of Stored Events) marker
     * from all connected relays involved in this subscription request.
     * @param sub The NDKSubscription instance that reached EOSE.
     */
    onEose?: (sub: NDKSubscription) => void;
}

/**
 * The NDK class is the main entry point to the library.
 *
 * @emits signer:ready when a signer is ready
 * @emits invalid-signature when an event with an invalid signature is received
 */
export class NDK extends EventEmitter<{
    "signer:ready": (signer: NDKSigner) => void;
    "signer:required": () => void;

    /**
     * Emitted when an event with an invalid signature is received and the signature
     * was processed asynchronously.
     */
    "event:invalid-sig": (event: NDKEvent) => void;

    /**
     * Emitted when an event fails to publish.
     * @param event The event that failed to publish
     * @param error The error that caused the event to fail to publish
     * @param relays The relays that the event was attempted to be published to
     */
    "event:publish-failed": (event: NDKEvent, error: NDKPublishError, relays: WebSocket["url"][]) => void;
}> {
    private _explicitRelayUrls?: WebSocket["url"][];
    public blacklistRelayUrls?: WebSocket["url"][];
    public pool: NDKPool;
    public outboxPool?: NDKPool;
    private _signer?: NDKSigner;
    private _activeUser?: NDKUser;
    public cacheAdapter?: NDKCacheAdapter;
    public debug: debug.Debugger;
    public devWriteRelaySet?: NDKRelaySet;
    public outboxTracker?: OutboxTracker;
    public mutedIds: Map<Hexpubkey | NDKEventId, string>;
    public clientName?: string;
    public clientNip89?: string;
    public queuesZapConfig: Queue<NDKLnUrlData | undefined>;
    public queuesNip05: Queue<ProfilePointer | null>;
    public asyncSigVerification = false;
    public initialValidationRatio = 1.0;
    public lowestValidationRatio = 1.0;
    public validationRatioFn?: NDKValidationRatioFn;
    public subManager: NDKSubscriptionManager;

    public publishingFailureHandled = false;

    public pools: NDKPool[] = [];

    /**
     * Default relay-auth policy that will be used when a relay requests authentication,
     * if no other policy is specified for that relay.
     *
     * @example Disconnect from relays that request authentication:
     * ```typescript
     * ndk.relayAuthDefaultPolicy = NDKAuthPolicies.disconnect(ndk.pool);
     * ```
     *
     * @example Sign in to relays that request authentication:
     * ```typescript
     * ndk.relayAuthDefaultPolicy = NDKAuthPolicies.signIn({ndk})
     * ```
     *
     * @example Sign in to relays that request authentication, asking the user for confirmation:
     * ```typescript
     * ndk.relayAuthDefaultPolicy = (relay: NDKRelay) => {
     *     const signIn = NDKAuthPolicies.signIn({ndk});
     *     if (confirm(`Relay ${relay.url} is requesting authentication, do you want to sign in?`)) {
     *        signIn(relay);
     *     }
     * }
     * ```
     */
    public relayAuthDefaultPolicy?: NDKAuthPolicy;

    /**
     * Fetch function to use for HTTP requests.
     *
     * @example
     * ```typescript
     * import fetch from "node-fetch";
     *
     * ndk.httpFetch = fetch;
     * ```
     */
    public httpFetch: typeof fetch | undefined;

    /**
     * Provide a caller function to receive all networking traffic from relays
     */
    readonly netDebug?: NDKNetDebug;

    public autoConnectUserRelays = true;
    public autoFetchUserMutelist = true;

    public walletConfig?: NDKWalletInterface;

    public constructor(opts: NDKConstructorParams = {}) {
        super();

        this.debug = opts.debug || debug("ndk");
        this.netDebug = opts.netDebug;
        this._explicitRelayUrls = opts.explicitRelayUrls || [];
        this.blacklistRelayUrls = opts.blacklistRelayUrls || DEFAULT_BLACKLISTED_RELAYS;
        this.subManager = new NDKSubscriptionManager();
        this.pool = new NDKPool(opts.explicitRelayUrls || [], [], this);
        this.pool.name = "Main";

        this.pool.on("relay:auth", async (relay: NDKRelay, challenge: string) => {
            if (this.relayAuthDefaultPolicy) {
                await this.relayAuthDefaultPolicy(relay, challenge);
            }
        });

        this.autoConnectUserRelays = opts.autoConnectUserRelays ?? true;
        this.autoFetchUserMutelist = opts.autoFetchUserMutelist ?? true;

        this.clientName = opts.clientName;
        this.clientNip89 = opts.clientNip89;

        this.relayAuthDefaultPolicy = opts.relayAuthDefaultPolicy;

        if (opts.enableOutboxModel) {
            this.outboxPool = new NDKPool(opts.outboxRelayUrls || DEFAULT_OUTBOX_RELAYS, [], this, {
                debug: this.debug.extend("outbox-pool"),
                name: "Outbox Pool",
            });

            this.outboxTracker = new OutboxTracker(this);
        }

        this.signer = opts.signer;
        this.cacheAdapter = opts.cacheAdapter;
        this.mutedIds = opts.mutedIds || new Map();

        if (opts.devWriteRelayUrls) {
            this.devWriteRelaySet = NDKRelaySet.fromRelayUrls(opts.devWriteRelayUrls, this);
        }

        this.queuesZapConfig = new Queue("zaps", 3);
        this.queuesNip05 = new Queue("nip05", 10);

        this.signatureVerificationWorker = opts.signatureVerificationWorker;

        this.initialValidationRatio = opts.initialValidationRatio || 1.0;
        this.lowestValidationRatio = opts.lowestValidationRatio || 1.0;

        try {
            this.httpFetch = fetch;
        } catch {}
    }

    set explicitRelayUrls(urls: WebSocket["url"][]) {
        this._explicitRelayUrls = urls;
        this.pool.relayUrls = urls;
    }

    get explicitRelayUrls() {
        return this._explicitRelayUrls || [];
    }

    set signatureVerificationWorker(worker: Worker | undefined) {
        this.asyncSigVerification = !!worker;
        if (worker) {
            signatureVerificationInit(worker);
        }
    }

    /**
     * Adds an explicit relay to the pool.
     * @param url
     * @param relayAuthPolicy Authentication policy to use if different from the default
     * @param connect Whether to connect to the relay automatically
     * @returns
     */
    public addExplicitRelay(urlOrRelay: string | NDKRelay, relayAuthPolicy?: NDKAuthPolicy, connect = true): NDKRelay {
        let relay: NDKRelay;

        if (typeof urlOrRelay === "string") {
            relay = new NDKRelay(urlOrRelay, relayAuthPolicy, this);
        } else {
            relay = urlOrRelay;
        }

        this.pool.addRelay(relay, connect);
        this.explicitRelayUrls?.push(relay.url);

        return relay;
    }

    public toJSON(): string {
        return { relayCount: this.pool.relays.size }.toString();
    }

    public get activeUser(): NDKUser | undefined {
        return this._activeUser;
    }

    /**
     * Sets the active user for this NDK instance, typically this will be
     * called when assigning a signer to the NDK instance.
     *
     * This function will automatically connect to the user's relays if
     * `autoConnectUserRelays` is set to true.
     *
     * It will also fetch the user's mutelist if `autoFetchUserMutelist` is set to true.
     */
    public set activeUser(user: NDKUser | undefined) {
        const differentUser = this._activeUser?.pubkey !== user?.pubkey;

        this._activeUser = user;

        if (user && differentUser) {
            setActiveUser.call(this, user);
        } else if (!user) {
            // reset mutedIds
            this.mutedIds = new Map();
        }
    }

    public get signer(): NDKSigner | undefined {
        return this._signer;
    }

    public set signer(newSigner: NDKSigner | undefined) {
        this._signer = newSigner;
        if (newSigner) this.emit("signer:ready", newSigner);

        newSigner?.user().then((user) => {
            user.ndk = this;
            this.activeUser = user;
        });
    }

    /**
     * Connect to relays with optional timeout.
     * If the timeout is reached, the connection will be continued to be established in the background.
     */
    public async connect(timeoutMs?: number): Promise<void> {
        if (this._signer && this.autoConnectUserRelays) {
            this.debug(
                "Attempting to connect to user relays specified by signer %o",
                await this._signer.relays?.(this),
            );

            if (this._signer.relays) {
                const relays = await this._signer.relays(this);
                relays.forEach((relay) => this.pool.addRelay(relay));
            }
        }

        const connections = [this.pool.connect(timeoutMs)];

        if (this.outboxPool) {
            connections.push(this.outboxPool.connect(timeoutMs));
        }

        this.debug("Connecting to relays %o", { timeoutMs });

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return Promise.allSettled(connections).then(() => {});
    }

    /**
     * Get a NDKUser object
     *
     * @param opts
     * @returns
     */
    public getUser(opts: GetUserParams): NDKUser {
        const user = new NDKUser(opts);
        user.ndk = this;
        return user;
    }

    /**
     * Get a NDKUser from a NIP05
     * @param nip05 NIP-05 ID
     * @param skipCache Skip cache
     * @returns
     */
    async getUserFromNip05(nip05: string, skipCache = false): Promise<NDKUser | undefined> {
        return NDKUser.fromNip05(nip05, this, skipCache);
    }

    /**
     * Creates and starts a new subscription.
     *
     * Subscriptions automatically start unless `autoStart` is set to `false`.
     * You can control automatic closing on EOSE via `opts.closeOnEose`.
     *
     * @param filters - A single NDKFilter object or an array of filters.
     * @param opts - Optional NDKSubscriptionOptions to customize behavior (e.g., caching, grouping).
     * @param relaySet - Optional explicit NDKRelaySet to use for this subscription. If not provided, NDK calculates the optimal set.
     * @param autoStart - Controls automatic starting and allows providing event handlers.
     *   - `true` (default): Starts the subscription immediately.
     *   - `false`: Creates the subscription but does not start it (call `subscription.start()` manually).
     *   - `NDKSubscriptionEventHandlers` object: Starts the subscription immediately and attaches the provided handlers (`onEvent`, `onEvents`, `onEose`).
     *     - Using `onEvents` changes behavior: it receives initial cached events in bulk, and `onEvent` is skipped for that initial batch. See {@link NDKSubscriptionEventHandlers}.
     * @returns The created NDKSubscription instance.
     *
     * @example Basic subscription
     * ```typescript
     * const sub = ndk.subscribe({ kinds: [1], authors: [pubkey] });
     * sub.on("event", (event) => console.log("Kind 1 event:", event.content));
     * ```
     *
     * @example Subscription with options and direct handlers
     * ```typescript
     * const sub = ndk.subscribe(
     *   { kinds: [0], authors: [pubkey] },
     *   { closeOnEose: true, cacheUsage: NDKSubscriptionCacheUsage.PARALLEL },
     *   undefined, // Use default relay set calculation
     *   {
     *     onEvents: (events) => { // Renamed parameter
     *       if (events.length > 0) {
     *         console.log(`Got ${events.length} profile events from cache:`, events[0].content);
     *       }
     *     },
     *     onEvent: (event) => { // Renamed parameter
     *       console.log("Got profile update from relay:", event.content); // Clarified source
     *     },
     *     onEose: () => console.log("Profile subscription finished.")
     *   }
     * );
     * ```
     *
     * @since 2.13.0 `relaySet` parameter removed; pass `relaySet` or `relayUrls` via `opts`.
     */
    public subscribe(
        filters: NDKFilter | NDKFilter[],
        opts?: NDKSubscriptionOptions,
        // relaySet?: NDKRelaySet, // Removed v2.13.0: Pass via opts.relaySet or opts.relayUrls
        autoStart: boolean | NDKSubscriptionEventHandlers = true,
    ): NDKSubscription {
        // NDKSubscription constructor now handles relaySet/relayUrls from opts
        const subscription = new NDKSubscription(this, filters, opts);
        this.subManager.add(subscription);

        const pool = subscription.pool; // Use the pool determined by the subscription options

        // Signal to the relays that they are explicitly being used if a relaySet was provided/created
        if (subscription.relaySet) {
            for (const relay of subscription.relaySet.relays) {
                pool.useTemporaryRelay(relay, undefined, subscription.filters);
            }
        }

        // if we have an authors filter and we are using the outbox pool,
        // we want to track the authors in the outbox tracker
        if (this.outboxPool && subscription.hasAuthorsFilter()) {
            const authors: string[] = subscription.filters
                .filter((filter) => filter.authors && filter.authors?.length > 0)
                .flatMap((filter) => filter.authors!);

            this.outboxTracker?.trackUsers(authors);
        }

        if (autoStart) {
            let eventsHandler: ((events: NDKEvent[]) => void) | undefined;
            if (typeof autoStart === "object") {
                if (autoStart.onEvent) subscription.on("event", autoStart.onEvent);
                if (autoStart.onEose) subscription.on("eose", autoStart.onEose);
                if (autoStart.onEvents) eventsHandler = autoStart.onEvents;
            }

            setTimeout(() => {
                const cachedEvents = subscription.start(!eventsHandler);
                if (cachedEvents && cachedEvents.length > 0 && !!eventsHandler) eventsHandler(cachedEvents);
            }, 0);
        }

        return subscription;
    }

    /**
     * Publish an event to a relay
     * @param event event to publish
     * @param relaySet explicit relay set to use
     * @param timeoutMs timeout in milliseconds to wait for the event to be published
     * @returns The relays the event was published to
     *
     * @deprecated Use `event.publish()` instead
     */
    public async publish(event: NDKEvent, relaySet?: NDKRelaySet, timeoutMs?: number): Promise<Set<NDKRelay>> {
        this.debug("Deprecated: Use `event.publish()` instead");

        return event.publish(relaySet, timeoutMs);
    }

    /**
     * Attempts to fetch an event from a tag, following relay hints and
     * other best practices.
     * @param tag Tag to fetch the event from
     * @param originalEvent Event where the tag came from
     * @param subOpts Subscription options to use when fetching the event
     * @param fallback Fallback options to use when the hint relay doesn't respond
     * @returns
     */
    public fetchEventFromTag = fetchEventFromTag.bind(this);

    /**
     * Fetch an event from the cache synchronously.
     * @param idOrFilter event id in bech32 format or filter
     * @returns events from the cache or null if the cache is empty
     */
    public fetchEventSync(idOrFilter: string | NDKFilter[]): NDKEvent[] | null {
        if (!this.cacheAdapter) throw new Error("Cache adapter not set");
        let filters: NDKFilter[];
        if (typeof idOrFilter === "string") filters = [filterFromId(idOrFilter)];
        else filters = idOrFilter;
        const sub = new NDKSubscription(this, filters);
        const events = this.cacheAdapter.query(sub);
        if (events instanceof Promise) throw new Error("Cache adapter is async");
        return events.map((e) => {
            e.ndk = this;
            return e;
        });
    }

    /**
     * Fetch a single event.
     *
     * @param idOrFilter event id in bech32 format or filter
     * @param opts subscription options
     * @param relaySetOrRelay explicit relay set to use
     */
    public async fetchEvent(
        idOrFilter: string | NDKFilter | NDKFilter[],
        opts?: NDKSubscriptionOptions,
        relaySetOrRelay?: NDKRelaySet | NDKRelay,
    ): Promise<NDKEvent | null> {
        let filters: NDKFilter[];
        let relaySet: NDKRelaySet | undefined;

        // Check if this relaySetOrRelay is an NDKRelay, if it is, make it a relaySet
        if (relaySetOrRelay instanceof NDKRelay) {
            relaySet = new NDKRelaySet(new Set([relaySetOrRelay]), this);
        } else if (relaySetOrRelay instanceof NDKRelaySet) {
            relaySet = relaySetOrRelay;
        }

        // if no relayset has been provided, try to get one from the event id
        if (!relaySetOrRelay && typeof idOrFilter === "string") {
            /* Check if this is a NIP-33 */
            if (!isNip33AValue(idOrFilter)) {
                const relays = relaysFromBech32(idOrFilter, this);

                if (relays.length > 0) {
                    relaySet = new NDKRelaySet(new Set<NDKRelay>(relays), this);

                    // Make sure we have connected relays in this set
                    relaySet = correctRelaySet(relaySet, this.pool);
                }
            }
        }

        if (typeof idOrFilter === "string") {
            filters = [filterFromId(idOrFilter)];
        } else if (Array.isArray(idOrFilter)) {
            filters = idOrFilter;
        } else {
            filters = [idOrFilter];
        }

        if (filters.length === 0) {
            throw new Error(`Invalid filter: ${JSON.stringify(idOrFilter)}`);
        }

        return new Promise((resolve) => {
            let fetchedEvent: NDKEvent | null = null;

            // Prepare options, including the relaySet if available
            const subscribeOpts: NDKSubscriptionOptions = {
                ...(opts || {}),
                closeOnEose: true,
            };
            if (relaySet) subscribeOpts.relaySet = relaySet;

            const s = this.subscribe(
                filters,
                subscribeOpts,
                // relaySet, // Removed: Passed via opts
                false, // autoStart = false
            );

            /** This is a workaround, for some reason we're leaking subscriptions that should EOSE and fetchEvent is not
             * seeing them; this is a temporary fix until we find the bug.
             */
            const t2 = setTimeout(() => {
                s.stop();
                resolve(fetchedEvent);
            }, 10000);

            s.on("event", (event: NDKEvent) => {
                event.ndk = this;

                // We only emit immediately when the event is not replaceable
                if (!event.isReplaceable()) {
                    clearTimeout(t2);
                    resolve(event);
                } else if (!fetchedEvent || fetchedEvent.created_at! < event.created_at!) {
                    fetchedEvent = event;
                }
            });

            s.on("eose", () => {
                clearTimeout(t2);
                resolve(fetchedEvent);
            });

            s.start();
        });
    }

    /**
     * Fetch events
     */
    public async fetchEvents(
        filters: NDKFilter | NDKFilter[],
        opts?: NDKSubscriptionOptions,
        relaySet?: NDKRelaySet,
    ): Promise<Set<NDKEvent>> {
        return new Promise((resolve) => {
            const events: Map<string, NDKEvent> = new Map();

            // Prepare options, including the relaySet if available
            const subscribeOpts: NDKSubscriptionOptions = {
                ...(opts || {}),
                closeOnEose: true,
            };
            if (relaySet) subscribeOpts.relaySet = relaySet;

            const relaySetSubscription = this.subscribe(
                filters,
                subscribeOpts,
                // relaySet, // Removed: Passed via opts
                false, // autoStart = false
            );

            const onEvent = (event: NostrEvent | NDKEvent) => {
                let _event: NDKEvent;
                if (!(event instanceof NDKEvent)) _event = new NDKEvent(undefined, event);
                else _event = event;

                const dedupKey = _event.deduplicationKey();

                const existingEvent = events.get(dedupKey);
                if (existingEvent) {
                    _event = dedupEvent(existingEvent, _event);
                }

                _event.ndk = this;
                events.set(dedupKey, _event);
            };

            // We want to inspect duplicated events
            // so we can dedup them
            relaySetSubscription.on("event", onEvent);
            // relaySetSubscription.on("event:dup", (rawEvent: NostrEvent) => {
            //     const ndkEvent = new NDKEvent(undefined, rawEvent);
            //     onEvent(ndkEvent)
            // });

            relaySetSubscription.on("eose", () => {
                resolve(new Set(events.values()));
            });

            relaySetSubscription.start();
        });
    }

    /**
     * Ensures that a signer is available to sign an event.
     */
    public assertSigner() {
        if (!this.signer) {
            this.emit("signer:required");
            throw new Error("Signer required");
        }
    }

    public getEntity = getEntity.bind(this);

    set wallet(wallet: NDKWalletInterface | undefined) {
        if (!wallet) {
            this.walletConfig = undefined;
            return;
        }

        this.walletConfig ??= {};
        this.walletConfig.lnPay = wallet?.lnPay?.bind(wallet);
        this.walletConfig.cashuPay = wallet?.cashuPay?.bind(wallet);
    }
}
