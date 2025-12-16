import debug from "debug";
import type { NostrEvent } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { EventEmitter } from "tseep";
import { AIGuardrails } from "../ai-guardrails/index.js";
import type { NDKCacheAdapter } from "../cache/index.js";
import dedupEvent from "../events/dedup.js";
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
import type { NDKUserParams, ProfilePointer } from "../user/index.js";
import { NDKUser } from "../user/index.js";
import { isValidNip05 } from "../utils/validation.js";
import { normalizeRelayUrl } from "../utils/normalize-url.js";
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
     * When this is set, we always write only to this relays.
     */
    devWriteRelayUrls?: string[];

    /**
     * Outbox relay URLs.
     */
    outboxRelayUrls?: string[];

    /**
     * Enable outbox model (defaults to true)
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
     * Custom filter function to determine if an event should be muted.
     * @param event - The event to check
     * @returns true if the event should be muted
     */
    muteFilter?: (event: NDKEvent) => boolean;

    /**
     * Custom filter function to determine if a relay connection should be allowed.
     * @param relayUrl - The relay URL to check
     * @returns true if the connection should be allowed, false to block it
     */
    relayConnectionFilter?: (relayUrl: string) => boolean;

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
     * Set a Web Worker for signature verification.
     *
     * @default undefined
     *
     * When provided, signature verification will be processed in a web worker.
     * You should listen for the `event:invalid-sig` event to handle invalid signatures.
     *
     * @example
     * ```typescript
     * const worker = new Worker("path/to/signature-verification.js");
     * ndk.signatureVerificationWorker = worker;
     * ndk.on("event:invalid-sig", (event) => {
     *    console.error("Invalid signature", event);
     * });
     * ```
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

    /**
     * A custom function to verify event signatures.
     * When provided, this function will be used instead of the default verification logic.
     * This is particularly useful for platforms like React Native where Web Workers are not available.
     *
     * @example
     * ```typescript
     * import { verifySignatureAsync } from "@nostr-dev-kit/mobile";
     *
     * const ndk = new NDK({
     *   signatureVerificationFunction: verifySignatureAsync
     * });
     * ```
     */
    signatureVerificationFunction?: (event: NDKEvent) => Promise<boolean>;

    /**
     * Filter validation mode for subscriptions.
     *
     * @default "validate" - Throws an error when filters contain undefined values
     * "fix" - Automatically removes undefined values from filters
     * "ignore" - Skip validation entirely (legacy behavior)
     */
    filterValidationMode?: "validate" | "fix" | "ignore";

    /**
     * ⚠️ STRONGLY RECOMMENDED: Enable AI Guardrails during development
     *
     * AI Guardrails catch 90% of common mistakes before they cause silent failures:
     * - Using bech32 (npub/note1) in filter arrays instead of hex
     * - Missing required fields on events (kind, content, etc.)
     * - Invalid tag formats and duplicate tags
     * - Performance anti-patterns (fetchEvents abuse, no cache adapter)
     * - Wrong data types (milliseconds vs seconds for created_at)
     *
     * When enabled, you'll get clear, actionable error messages instead of silent failures.
     *
     * @default false - Guardrails are disabled (zero performance impact)
     *
     * @example RECOMMENDED: Enable during development
     * ```typescript
     * const ndk = new NDK({
     *   explicitRelayUrls: ['wss://relay.primal.net'],
     *   aiGuardrails: true  // ⚠️ Enable this!
     * });
     * ```
     *
     * @example Disable in production
     * ```typescript
     * const ndk = new NDK({
     *   aiGuardrails: process.env.NODE_ENV !== 'production'
     * });
     * ```
     *
     * @example Enable with specific checks disabled
     * ```typescript
     * const ndk = new NDK({
     *   aiGuardrails: { skip: new Set(['filter-large-limit']) }
     * });
     * ```
     *
     * @example Programmatic control
     * ```typescript
     * ndk.aiGuardrails.skip('fetch-events-usage');
     * ndk.aiGuardrails.enable('filter-bech32-in-array');
     * ```
     *
     * @see https://github.com/nostr-dev-kit/ndk/tree/master/ndk/src/ai-guardrails
     */
    aiGuardrails?: boolean | { skip?: Set<string> };

    /**
     * Optional grace period (in seconds) for future timestamps.
     *
     * When set, subscriptions will automatically discard events where
     * `created_at` is more than this many seconds ahead of the current time.
     * This helps protect against malicious relays sending events with
     * manipulated timestamps.
     *
     * Set to `undefined` (default) to disable this check and accept all events
     * regardless of timestamp.
     *
     * @default undefined
     *
     * @example Reject events more than 5 minutes in the future
     * ```typescript
     * const ndk = new NDK({
     *   explicitRelayUrls: ['wss://relay.primal.net'],
     *   futureTimestampGrace: 300 // 5 minutes
     * });
     * ```
     */
    futureTimestampGrace?: number;
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

    /**
     * Called when the subscription is closed.
     * @param sub The NDKSubscription instance that was closed.
     */
    onClose?: (sub: NDKSubscription) => void;
}

/**
 * The NDK class is the main entry point to the library.
 *
 * @emits signer:ready when a signer is ready
 * @emits activeUser:change when the active user changes
 * @emits invalid-signature when an event with an invalid signature is received
 */
export class NDK extends EventEmitter<{
    "signer:ready": (signer: NDKSigner) => void;
    "signer:required": () => void;

    /**
     * Emitted when the active user changes.
     * This can happen when a signer is set or when activeUser is set directly.
     */
    "activeUser:change": (user: NDKUser | undefined) => void;

    /**
     * Emitted when an event with an invalid signature is received.
     * Includes the relay that provided the invalid signature.
     */
    "event:invalid-sig": (event: NDKEvent, relay?: NDKRelay) => void;

    /**
     * Emitted when an event fails to publish.
     * @param event The event that failed to publish
     * @param error The error that caused the event to fail to publish
     * @param relays The relays that the event was attempted to be published to
     */
    "event:publish-failed": (event: NDKEvent, error: NDKPublishError, relays: WebSocket["url"][]) => void;
}> {
    private _explicitRelayUrls?: WebSocket["url"][];
    public pool: NDKPool;
    public outboxPool?: NDKPool;
    private _signer?: NDKSigner;
    private _activeUser?: NDKUser;
    public cacheAdapter?: NDKCacheAdapter;
    public debug: debug.Debugger;
    public devWriteRelaySet?: NDKRelaySet;
    public outboxTracker?: OutboxTracker;
    public muteFilter?: (event: NDKEvent) => boolean;
    public relayConnectionFilter?: (relayUrl: string) => boolean;
    public clientName?: string;
    public clientNip89?: string;
    public queuesZapConfig: Queue<NDKLnUrlData | undefined>;
    public queuesNip05: Queue<ProfilePointer | null>;
    public asyncSigVerification = false;
    public initialValidationRatio = 1.0;
    public lowestValidationRatio = 0.1;
    public validationRatioFn?: NDKValidationRatioFn;
    public filterValidationMode: "validate" | "fix" | "ignore" = "validate";
    public subManager: NDKSubscriptionManager;
    public aiGuardrails: AIGuardrails;
    public futureTimestampGrace?: number;

    /**
     * Private storage for the signature verification function
     */
    private _signatureVerificationFunction?: (event: NDKEvent) => Promise<boolean>;
    /**
     * Private storage for the signature verification worker
     */
    private _signatureVerificationWorker?: Worker;
    /**
     * Rolling total of time spent (in ms) performing signature verifications.
     * Users can read this to monitor or display aggregate verification cost.
     */
    public signatureVerificationTimeMs: number = 0;

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

    private _wallet?: NDKWalletInterface;
    public walletConfig?: NDKWalletInterface;

    public constructor(opts: NDKConstructorParams = {}) {
        super();

        this.debug = opts.debug || debug("ndk");
        this.netDebug = opts.netDebug;
        this._explicitRelayUrls = opts.explicitRelayUrls || [];
        this.subManager = new NDKSubscriptionManager();
        this.pool = new NDKPool(opts.explicitRelayUrls || [], this);
        this.pool.name = "Main";

        this.pool.on("relay:auth", async (relay: NDKRelay, challenge: string) => {
            if (this.relayAuthDefaultPolicy) {
                await this.relayAuthDefaultPolicy(relay, challenge);
            }
        });

        this.autoConnectUserRelays = opts.autoConnectUserRelays ?? true;

        this.clientName = opts.clientName;
        this.clientNip89 = opts.clientNip89;

        this.relayAuthDefaultPolicy = opts.relayAuthDefaultPolicy;

        if (!(opts.enableOutboxModel === false)) {
            this.outboxPool = new NDKPool(opts.outboxRelayUrls || DEFAULT_OUTBOX_RELAYS, this, {
                debug: this.debug.extend("outbox-pool"),
                name: "Outbox Pool",
            });

            this.outboxTracker = new OutboxTracker(this);

            // Listen for outbox relay list updates and refresh affected subscriptions
            this.outboxTracker.on("user:relay-list-updated", (pubkey, _outboxItem) => {
                this.debug(`Outbox relay list updated for ${pubkey}`);

                // Find all active subscriptions that include this author
                for (const subscription of this.subManager.subscriptions.values()) {
                    const isRelevant = subscription.filters.some((filter) => filter.authors?.includes(pubkey));

                    if (isRelevant && typeof subscription.refreshRelayConnections === "function") {
                        this.debug(`Refreshing relay connections for subscription ${subscription.internalId}`);
                        subscription.refreshRelayConnections();
                    }
                }
            });
        }

        this.signer = opts.signer;
        this.cacheAdapter = opts.cacheAdapter;
        this.muteFilter = opts.muteFilter;
        this.relayConnectionFilter = opts.relayConnectionFilter;

        if (opts.devWriteRelayUrls) {
            this.devWriteRelaySet = NDKRelaySet.fromRelayUrls(opts.devWriteRelayUrls, this);
        }

        this.queuesZapConfig = new Queue("zaps", 3);
        this.queuesNip05 = new Queue("nip05", 10);

        // Set signature verification methods
        // The setters will handle setting asyncSigVerification appropriately

        // Handle both worker and function for backward compatibility
        if (opts.signatureVerificationWorker) {
            this.signatureVerificationWorker = opts.signatureVerificationWorker;
        }

        // Always set the function if provided, even if a worker is also set
        if (opts.signatureVerificationFunction) {
            this.signatureVerificationFunction = opts.signatureVerificationFunction;
        }

        this.initialValidationRatio = opts.initialValidationRatio || 1.0;
        this.lowestValidationRatio = opts.lowestValidationRatio || 0.1;
        this.validationRatioFn = opts.validationRatioFn || this.defaultValidationRatioFn;
        this.filterValidationMode = opts.filterValidationMode || "validate";
        this.aiGuardrails = new AIGuardrails(opts.aiGuardrails || false);
        this.futureTimestampGrace = opts.futureTimestampGrace;

        // Trigger guardrails hook for NDK instantiation
        this.aiGuardrails.ndkInstantiated(this);

        try {
            this.httpFetch = fetch;
        } catch {}
    }

    set explicitRelayUrls(urls: WebSocket["url"][]) {
        this._explicitRelayUrls = urls.map(normalizeRelayUrl);
        this.pool.relayUrls = urls;
    }

    get explicitRelayUrls() {
        return this._explicitRelayUrls || [];
    }

    /**
     * Set a Web Worker for signature verification.
     *
     * This method initializes the worker and sets the asyncSigVerification flag.
     * The actual verification is handled by the verifySignatureAsync function in signature.ts,
     * which will use the worker if available.
     */
    set signatureVerificationWorker(worker: Worker | undefined) {
        this._signatureVerificationWorker = worker;

        if (worker) {
            // Initialize the worker
            signatureVerificationInit(worker);

            // Set asyncSigVerification flag
            this.asyncSigVerification = true;
        } else {
            // If worker is undefined, clear the flag
            this.asyncSigVerification = false;
        }
    }

    /**
     * Set a custom signature verification function.
     *
     * This method is particularly useful for platforms that don't support Web Workers,
     * such as React Native.
     *
     * When a function is provided, it will be used for signature verification
     * instead of the default worker-based verification. This enables signature
     * verification on platforms where Web Workers are not available.
     *
     * @example
     * ```typescript
     * import { verifySignatureAsync } from "@nostr-dev-kit/mobile";
     *
     * ndk.signatureVerificationFunction = verifySignatureAsync;
     * ```
     */
    set signatureVerificationFunction(fn: ((event: NDKEvent) => Promise<boolean>) | undefined) {
        this._signatureVerificationFunction = fn;
        // Enable async verification when a function is provided
        this.asyncSigVerification = !!fn;
    }

    /**
     * Get the custom signature verification function
     */
    get signatureVerificationFunction(): ((event: NDKEvent) => Promise<boolean>) | undefined {
        return this._signatureVerificationFunction;
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
     */
    public set activeUser(user: NDKUser | undefined) {
        const differentUser = this._activeUser?.pubkey !== user?.pubkey;

        this._activeUser = user;

        if (differentUser) {
            this.emit("activeUser:change", user);
        }

        if (user && differentUser) {
            setActiveUser.call(this, user);
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

        const connections: Promise<void>[] = [this.pool.connect(timeoutMs)];

        if (this.outboxPool) {
            connections.push(this.outboxPool.connect(timeoutMs));
        }

        // Initialize cache adapter if it has async initialization
        if (this.cacheAdapter?.initializeAsync) {
            connections.push(this.cacheAdapter.initializeAsync(this));
        }

        return Promise.allSettled(connections).then(() => {});
    }

    /**
     * Centralized method to report an invalid signature, identifying the relay that provided it.
     * A single invalid signature means the relay is considered malicious.
     * All invalid signature detections (synchronous or asynchronous) should delegate to this method.
     *
     * @param event The event with an invalid signature
     * @param relay The relay that provided the invalid signature
     */
    public reportInvalidSignature(event: NDKEvent, relay?: NDKRelay): void {
        this.debug(`Invalid signature detected for event ${event.id}${relay ? ` from relay ${relay.url}` : ""}`);

        // Emit event with relay information
        this.emit("event:invalid-sig", event, relay);
    }

    /**
     * Default function to calculate validation ratio based on historical validation results.
     * The more events validated successfully, the lower the ratio goes (down to the minimum).
     */
    private defaultValidationRatioFn(_relay: NDKRelay, validatedCount: number, _nonValidatedCount: number): number {
        if (validatedCount < 10) return this.initialValidationRatio;

        // Calculate a logarithmically decreasing ratio that approaches the minimum
        // as more events are validated
        const trustFactor = Math.min(validatedCount / 100, 1); // Caps at 100 validated events

        const calculatedRatio =
            this.initialValidationRatio * (1 - trustFactor) + this.lowestValidationRatio * trustFactor;

        return Math.max(calculatedRatio, this.lowestValidationRatio);
    }

    /**
     * Get a NDKUser object
     *
     * @deprecated Use `fetchUser` instead - this method will be removed in the next major version
     * @param opts - User parameters object or a string (npub, nprofile, or hex pubkey)
     * @returns NDKUser instance
     *
     * @example
     * ```typescript
     * // Using parameters object
     * const user1 = ndk.getUser({ pubkey: "hex..." });
     *
     * // Using npub string
     * const user2 = ndk.getUser("npub1...");
     *
     * // Using nprofile string (includes relay hints)
     * const user3 = ndk.getUser("nprofile1...");
     *
     * // Using hex pubkey directly
     * const user4 = ndk.getUser("deadbeef...");
     * ```
     */
    public getUser(opts: GetUserParams | string): NDKUser {
        // Handle string input
        if (typeof opts === "string") {
            // Check if it's a NIP-19 encoded string
            if (opts.startsWith("npub1")) {
                const { type, data } = nip19.decode(opts);
                if (type !== "npub") throw new Error(`Invalid npub: ${opts}`);
                return this.getUser({ pubkey: data });
            } else if (opts.startsWith("nprofile1")) {
                const { type, data } = nip19.decode(opts);
                if (type !== "nprofile") throw new Error(`Invalid nprofile: ${opts}`);
                return this.getUser({
                    pubkey: data.pubkey,
                    relayUrls: data.relays,
                });
            } else {
                // Assume it's a hex pubkey
                return this.getUser({ pubkey: opts });
            }
        }

        // Original implementation for object parameter
        const user = new NDKUser(opts);
        user.ndk = this;
        return user;
    }

    /**
     * Get a NDKUser from a NIP05
     * @deprecated Use `fetchUser` instead - this method will be removed in the next major version
     * @param nip05 NIP-05 ID
     * @param skipCache Skip cache
     * @returns
     */
    async getUserFromNip05(nip05: string, skipCache = false): Promise<NDKUser | undefined> {
        return NDKUser.fromNip05(nip05, this, skipCache);
    }

    /**
     * Fetch a NDKUser from a string identifier
     *
     * Supports multiple input formats:
     * - NIP-05 identifiers (e.g., "pablo@test.com" or "test.com")
     * - npub (NIP-19 encoded public key)
     * - nprofile (NIP-19 encoded profile with optional relay hints)
     * - Hex public key
     *
     * @param input - String identifier for the user (NIP-05, npub, nprofile, or hex pubkey)
     * @param skipCache - Skip cache when resolving NIP-05 (only applies to NIP-05 lookups)
     * @returns Promise resolving to NDKUser or undefined if not found
     *
     * @example
     * ```typescript
     * // Using NIP-05
     * const user1 = await ndk.fetchUser("pablo@test.com");
     * const user2 = await ndk.fetchUser("test.com"); // defaults to _@test.com
     *
     * // Using npub
     * const user3 = await ndk.fetchUser("npub1...");
     *
     * // Using nprofile (includes relay hints)
     * const user4 = await ndk.fetchUser("nprofile1...");
     *
     * // Using hex pubkey
     * const user5 = await ndk.fetchUser("deadbeef...");
     * ```
     */
    public async fetchUser(input: string, skipCache = false): Promise<NDKUser | undefined> {
        // Check if it's a NIP-05 identifier (contains @ or . indicating a domain)
        if (isValidNip05(input)) {
            return NDKUser.fromNip05(input, this, skipCache);
        } else if (input.startsWith("npub1")) {
            const { type, data } = nip19.decode(input);
            if (type !== "npub") throw new Error(`Invalid npub: ${input}`);
            const user = new NDKUser({ pubkey: data });
            user.ndk = this;
            return user;
        } else if (input.startsWith("nprofile1")) {
            const { type, data } = nip19.decode(input);
            if (type !== "nprofile") throw new Error(`Invalid nprofile: ${input}`);
            const user = new NDKUser({
                pubkey: data.pubkey,
                relayUrls: data.relays,
            });
            user.ndk = this;
            return user;
        } else {
            // Assume it's a hex pubkey
            const user = new NDKUser({ pubkey: input });
            user.ndk = this;
            return user;
        }
    }

    /**
     * Creates and starts a new subscription.
     *
     * Subscriptions automatically start unless `autoStart` is set to `false`.
     * You can control automatic closing on EOSE via `opts.closeOnEose`.
     *
     * @param filters - A single NDKFilter object or an array of filters.
     * @param opts - Optional NDKSubscriptionOptions to customize behavior (e.g., caching, grouping).
     * @param handlers - Optional handlers for subscription events. Passing handlers is the preferred method of using ndk.subscribe.
     *   - `onEvent`: Called for each event received.
     *  - `onEvents`: Called once with an array of events when the subscription starts (from the cache).
     *  - `onEose`: Called when the subscription receives EOSE.
     *  For backwards compatibility, this third parameter also accepts a relaySet, the relaySet should be passed via `opts.relaySet`.
     *
     * @param _autoStart - For backwards compatibility, this can be a boolean indicating whether to start the subscription immediately.
     *  This parameter is deprecated and will be removed in a future version.
     *   - `false`: Creates the subscription but does not start it (call `subscription.start()` manually).
     * @returns The created NDKSubscription instance.
     *
     * @example Basic subscription
     * ```typescript
     * const sub = ndk.subscribe(
     *   { kinds: [1], authors: [pubkey] },
     *   {
     *     onEvent: (event) => console.log("Kind 1 event:", event.content)
     *   }
     * );
     * ```
     *
     * @example Subscription with options and direct handlers
     * ```typescript
     * const sub = ndk.subscribe(
     *   { kinds: [0], authors: [pubkey] },
     *   { 
     *     closeOnEose: true,
     *     cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
     *     onEvents: (events) => console.log(`Got ${events.length} profile events from cache:`, events[0].content),
     *     onEvent: (event) => console.log("Got profile update from relay:", event.content),
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
        autoStartOrRelaySet: NDKRelaySet | boolean | NDKSubscriptionEventHandlers = true,
        _autoStart = true,
    ): NDKSubscription {
        let _relaySet: NDKRelaySet | undefined = opts?.relaySet;
        let autoStart: boolean | NDKSubscriptionEventHandlers = _autoStart;

        // For backwards compatibility, check if the first parameter is a relaySet
        if (autoStartOrRelaySet instanceof NDKRelaySet) {
            console.warn("relaySet is deprecated, use opts.relaySet instead. This will be removed in version v2.14.0");
            _relaySet = autoStartOrRelaySet;
            autoStart = _autoStart;
        } else if (typeof autoStartOrRelaySet === "boolean" || typeof autoStartOrRelaySet === "object") {
            autoStart = autoStartOrRelaySet;
        }

        // Merge event handlers from autoStart into opts
        const finalOpts = { relaySet: _relaySet, ...opts };

        if (autoStart && typeof autoStart === "object") {
            if (autoStart.onEvent) finalOpts.onEvent = autoStart.onEvent;
            if (autoStart.onEose) finalOpts.onEose = autoStart.onEose;
            if (autoStart.onClose) finalOpts.onClose = autoStart.onClose;
            if (autoStart.onEvents) finalOpts.onEvents = autoStart.onEvents;
        }

        // NDKSubscription constructor now handles relaySet/relayUrls from opts
        const subscription = new NDKSubscription(this, filters, finalOpts);
        this.subManager.add(subscription);

        // Track subscription creation for guardrails
        this.aiGuardrails?.subscription?.created(Array.isArray(filters) ? filters : [filters], finalOpts);

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
            setTimeout(async () => {
                // Ensure cache is ready before starting subscription
                if (this.cacheAdapter?.initializeAsync && !this.cacheAdapter.ready) {
                    await this.cacheAdapter.initializeAsync(this);
                }

                subscription.start();
            }, 0);
        }

        return subscription;
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

        // Run guardrails check on the filter when it's passed as an object (not a string)
        if (typeof idOrFilter !== "string") {
            this.aiGuardrails?.ndk?.fetchingEvents(filters);
        }

        if (filters.length === 0) {
            throw new Error(`Invalid filter: ${JSON.stringify(idOrFilter)}`);
        }

        return new Promise((resolve, reject) => {
            let fetchedEvent: NDKEvent | null = null;

            // Shared event processing logic
            const processEvent = (event: NDKEvent) => {
                event.ndk = this;

                // We only emit immediately when the event is not replaceable
                if (!event.isReplaceable()) {
                    clearTimeout(t2);
                    s?.stop();
                    this.aiGuardrails["_nextCallDisabled"] = null;
                    resolve(event);
                } else if (!fetchedEvent || fetchedEvent.created_at! < event.created_at!) {
                    fetchedEvent = event;
                }
            };

            // Prepare options, including the relaySet if available
            const subscribeOpts: NDKSubscriptionOptions = {
                ...(opts || {}),
                closeOnEose: true,
                // Batch handler for cached events
                onEvents: (cachedEvents: NDKEvent[]) => {
                    for (const event of cachedEvents) {
                        processEvent(event);
                    }
                },
                // Individual handler for relay events
                onEvent: (event: NDKEvent) => {
                    processEvent(event);
                },
                onEose: () => {
                    clearTimeout(t2);
                    this.aiGuardrails["_nextCallDisabled"] = null;
                    resolve(fetchedEvent);
                },
            };
            if (relaySet) subscribeOpts.relaySet = relaySet;

            /** This is a workaround, for some reason we're leaking subscriptions that should EOSE and fetchEvent is not
             * seeing them; this is a temporary fix until we find the bug.
             */
            let s: any;
            const t2 = setTimeout(() => {
                s?.stop();
                this.aiGuardrails["_nextCallDisabled"] = null;
                resolve(fetchedEvent);
            }, 10000);

            s = this.subscribe(filters, subscribeOpts);
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
        this.aiGuardrails?.ndk?.fetchingEvents(filters, opts);

        return new Promise((resolve) => {
            const events: Map<string, NDKEvent> = new Map();

            // Shared deduplication logic for both individual and batch events
            const processEvent = (event: NostrEvent | NDKEvent): void => {
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

            // Prepare options, including the relaySet if available
            const subscribeOpts: NDKSubscriptionOptions = {
                ...(opts || {}),
                closeOnEose: true,
                onEvents: (cachedEvents: NDKEvent[]) => {
                    for (const event of cachedEvents) {
                        processEvent(event);
                    }
                },
                onEvent: processEvent,
                onEose: () => {
                    this.aiGuardrails["_nextCallDisabled"] = null;
                    resolve(new Set(events.values()));
                },
            };
            if (relaySet) subscribeOpts.relaySet = relaySet;

            const _relaySetSubscription = this.subscribe(filters, subscribeOpts);

            // We want to inspect duplicated events
            // so we can dedup them
            // relaySetSubscription.on("event:dup", (rawEvent: NostrEvent) => {
            //     const ndkEvent = new NDKEvent(undefined, rawEvent);
            //     onEvent(ndkEvent)
            // });
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

    /**
     * Temporarily disable AI guardrails for the next method call.
     *
     * @param ids - Optional guardrail IDs to disable. If omitted, all guardrails are disabled for the next call.
     *              Can be a single string or an array of strings.
     * @returns This NDK instance for method chaining
     *
     * @example Disable all guardrails for one call
     * ```typescript
     * ndk.guardrailOff().fetchEvents({ kinds: [1] });
     * ```
     *
     * @example Disable specific guardrail
     * ```typescript
     * ndk.guardrailOff('fetch-events-usage').fetchEvents({ kinds: [1] });
     * ```
     *
     * @example Disable multiple guardrails
     * ```typescript
     * ndk.guardrailOff(['fetch-events-usage', 'filter-large-limit']).fetchEvents({ kinds: [1], limit: 5000 });
     * ```
     */
    public guardrailOff(ids?: string | string[]): this {
        if (!ids) {
            this.aiGuardrails["_nextCallDisabled"] = "all";
        } else if (typeof ids === "string") {
            this.aiGuardrails["_nextCallDisabled"] = new Set([ids]);
        } else {
            this.aiGuardrails["_nextCallDisabled"] = new Set(ids);
        }
        return this;
    }

    set wallet(wallet: NDKWalletInterface | undefined) {
        if (!wallet) {
            this._wallet = undefined;
            this.walletConfig = undefined;
            return;
        }

        this._wallet = wallet;
        this.walletConfig ??= {};
        this.walletConfig.lnPay = wallet?.lnPay?.bind(wallet);
        this.walletConfig.cashuPay = wallet?.cashuPay?.bind(wallet);
    }

    get wallet(): NDKWalletInterface | undefined {
        return this._wallet;
    }
}
