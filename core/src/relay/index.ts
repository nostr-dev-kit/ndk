import debug from "debug";
import { EventEmitter } from "tseep";

import type { NDKEvent, NDKTag } from "../events/index.js";
import type { NDK } from "../ndk/index.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { NDKUser } from "../user/index.js";
import { normalizeRelayUrl } from "../utils/normalize-url.js";
import type { NDKAuthPolicy } from "./auth-policies.js";
import { NDKRelayConnectivity } from "./connectivity.js";
import { fetchRelayInformation, type NDKRelayInformation } from "./nip11.js";
import { NDKRelayPublisher } from "./publisher.js";
import type { NDKRelayScore } from "./score.js";
import { SignatureVerificationStats, startSignatureVerificationStats } from "./signature-verification-stats.js";
import { NDKRelaySubscriptionManager } from "./sub-manager.js";
import type { NDKRelaySubscription } from "./subscription.js";

/** @deprecated Use `WebSocket['url']` instead. */
export type NDKRelayUrl = WebSocket["url"];

/**
 * Protocol handler function type for handling custom relay messages.
 * @param relay The relay that received the message
 * @param message The parsed message array from the relay
 */
export type NDKProtocolHandler = (relay: NDKRelay, message: unknown[]) => void;

export enum NDKRelayStatus {
    DISCONNECTING = 0, // 0
    DISCONNECTED = 1, // 1
    RECONNECTING = 2, // 2
    FLAPPING = 3, // 3
    CONNECTING = 4, // 4

    // connected states
    CONNECTED = 5, // 5
    AUTH_REQUESTED = 6, // 6
    AUTHENTICATING = 7, // 7
    AUTHENTICATED = 8, // 8
}

export interface NDKRelayConnectionStats {
    /**
     * The number of times a connection has been attempted.
     */
    attempts: number;

    /**
     * The number of times a connection has been successfully established.
     */
    success: number;

    /**
     * The durations of the last 100 connections in milliseconds.
     */
    durations: number[];

    /**
     * The time the current connection was established in milliseconds.
     */
    connectedAt?: number;

    /**
     * Timestamp of the next reconnection attempt.
     */
    nextReconnectAt?: number;

    /**
     * Signature validation ratio for this relay.
     * @see NDKRelayOptions.validationRatio
     */
    validationRatio?: number;
}

/**
 * The NDKRelay class represents a connection to a relay.
 *
 * @emits NDKRelay#connect
 * @emits NDKRelay#ready
 * @emits NDKRelay#disconnect
 * @emits NDKRelay#notice
 * @emits NDKRelay#event
 * @emits NDKRelay#published when an event is published to the relay
 * @emits NDKRelay#publish:failed when an event fails to publish to the relay
 * @emits NDKRelay#eose when the relay has reached the end of stored events
 * @emits NDKRelay#auth when the relay requires authentication
 * @emits NDKRelay#authed when the relay has authenticated
 * @emits NDKRelay#delayed-connect when the relay will wait before reconnecting
 */
export class NDKRelay extends EventEmitter<{
    connect: () => void;
    ready: () => void;

    /**
     * Emitted when the relay has reached the end of stored events.
     */
    disconnect: () => void;
    flapping: (stats: NDKRelayConnectionStats) => void;
    notice: (notice: string) => void;
    auth: (challenge: string) => void;
    authed: () => void;
    "auth:failed": (error: Error) => void;
    published: (event: NDKEvent) => void;
    "publish:failed": (event: NDKEvent, error: Error) => void;
    "delayed-connect": (delayInMs: number) => void;
}> {
    readonly url: WebSocket["url"];
    readonly scores: Map<NDKUser, NDKRelayScore>;
    public connectivity: NDKRelayConnectivity;
    public subs: NDKRelaySubscriptionManager;
    private publisher: NDKRelayPublisher;
    public authPolicy?: NDKAuthPolicy;

    /**
     * Protocol handlers for custom relay message types (e.g., NEG-OPEN, NEG-MSG).
     * Allows external packages to handle non-standard relay messages.
     */
    private protocolHandlers = new Map<string, NDKProtocolHandler>();

    /**
     * Cached relay information from NIP-11.
     */
    private _relayInfo?: NDKRelayInformation;

    /**
     * The lowest validation ratio this relay can reach.
     */
    public lowestValidationRatio?: number;

    /**
     * Current validation ratio this relay is targeting.
     */
    public targetValidationRatio?: number;

    public validationRatioFn?: (relay: NDKRelay, validatedCount: number, nonValidatedCount: number) => number;

    /**
     * This tracks events that have been seen by this relay
     * with a valid signature.
     */
    public validatedEventCount = 0;

    /**
     * This tracks events that have been seen by this relay
     * but have not been validated.
     */
    public nonValidatedEventCount = 0;

    /**
     * Whether this relay is trusted.
     *
     * Trusted relay's events do not get their signature verified.
     */
    public trusted = false;

    public complaining = false;
    readonly debug: debug.Debugger;

    static defaultValidationRatioUpdateFn = (
        relay: NDKRelay,
        validatedCount: number,
        _nonValidatedCount: number,
    ): number => {
        if (relay.lowestValidationRatio === undefined || relay.targetValidationRatio === undefined) return 1;

        let newRatio = relay.validationRatio;

        if (relay.validationRatio > relay.targetValidationRatio) {
            const factor = validatedCount / 100;
            newRatio = Math.max(relay.lowestValidationRatio, relay.validationRatio - factor);
        }

        if (newRatio < relay.validationRatio) {
            return newRatio;
        }

        return relay.validationRatio;
    };

    public constructor(url: WebSocket["url"], authPolicy: NDKAuthPolicy | undefined, ndk: NDK) {
        super();
        this.url = normalizeRelayUrl(url);
        this.scores = new Map<NDKUser, NDKRelayScore>();
        this.debug = debug(`ndk:relay:${url}`);
        this.connectivity = new NDKRelayConnectivity(this, ndk);
        this.connectivity.netDebug = ndk?.netDebug;
        this.req = this.connectivity.req.bind(this.connectivity);
        this.close = this.connectivity.close.bind(this.connectivity);
        this.subs = new NDKRelaySubscriptionManager(this, ndk.subManager);
        this.publisher = new NDKRelayPublisher(this);
        this.authPolicy = authPolicy;
        this.targetValidationRatio = ndk?.initialValidationRatio;
        this.lowestValidationRatio = ndk?.lowestValidationRatio;
        this.validationRatioFn = (ndk?.validationRatioFn ?? NDKRelay.defaultValidationRatioUpdateFn).bind(this);

        this.updateValidationRatio();

        if (!ndk) {
            console.trace("relay created without ndk");
        }
    }

    private updateValidationRatio(): void {
        if (this.validationRatioFn && this.validatedEventCount > 0) {
            const newRatio = this.validationRatioFn(this, this.validatedEventCount, this.nonValidatedEventCount);

            this.targetValidationRatio = newRatio;
        }

        // Schedule the next update
        setTimeout(() => {
            this.updateValidationRatio();
        }, 30000);
    }

    get status(): NDKRelayStatus {
        return this.connectivity.status;
    }

    get connectionStats(): NDKRelayConnectionStats {
        return this.connectivity.connectionStats;
    }

    /**
     * Connects to the relay.
     */
    public async connect(timeoutMs?: number, reconnect = true): Promise<void> {
        return this.connectivity.connect(timeoutMs, reconnect);
    }

    /**
     * Disconnects from the relay.
     */
    public disconnect(): void {
        if (this.status === NDKRelayStatus.DISCONNECTED) {
            return;
        }

        this.connectivity.disconnect();
    }

    /**
     * Queues or executes the subscription of a specific set of filters
     * within this relay.
     *
     * @param subscription NDKSubscription this filters belong to.
     * @param filters Filters to execute
     */
    public subscribe(subscription: NDKSubscription, filters: NDKFilter[]): void {
        this.subs.addSubscription(subscription, filters);
    }

    /**
     * Publishes an event to the relay with an optional timeout.
     *
     * If the relay is not connected, the event will be published when the relay connects,
     * unless the timeout is reached before the relay connects.
     *
     * @param event The event to publish
     * @param timeoutMs The timeout for the publish operation in milliseconds
     * @returns A promise that resolves when the event has been published or rejects if the operation times out
     */
    public async publish(event: NDKEvent, timeoutMs = 2500): Promise<boolean> {
        return this.publisher.publish(event, timeoutMs);
    }

    public referenceTags(): NDKTag[] {
        return [["r", this.url]];
    }

    public addValidatedEvent(): void {
        this.validatedEventCount++;
    }

    public addNonValidatedEvent(): void {
        this.nonValidatedEventCount++;
    }

    /**
     * The current validation ratio this relay has achieved.
     */
    get validationRatio(): number {
        if (this.nonValidatedEventCount === 0) {
            return 1;
        }

        return this.validatedEventCount / (this.validatedEventCount + this.nonValidatedEventCount);
    }

    public shouldValidateEvent(): boolean {
        if (this.trusted) {
            return false;
        }

        if (this.targetValidationRatio === undefined) {
            return true;
        }

        // Always validate if ratio is 1.0
        if (this.targetValidationRatio >= 1.0) return true;

        // Otherwise, randomly decide based on ratio
        return Math.random() < this.targetValidationRatio;
    }

    get connected(): boolean {
        return this.connectivity.connected;
    }

    public req: (relaySub: NDKRelaySubscription) => void;
    public close: (subId: string) => void;

    /**
     * Registers a protocol handler for a specific message type.
     * This allows external packages to handle custom relay messages (e.g., NIP-77 NEG-* messages).
     *
     * @param messageType The message type to handle (e.g., "NEG-OPEN", "NEG-MSG")
     * @param handler The function to call when a message of this type is received
     *
     * @example
     * ```typescript
     * relay.registerProtocolHandler('NEG-MSG', (relay, message) => {
     *   console.log('Received NEG-MSG:', message);
     * });
     * ```
     */
    public registerProtocolHandler(messageType: string, handler: NDKProtocolHandler): void {
        this.protocolHandlers.set(messageType, handler);
    }

    /**
     * Unregisters a protocol handler for a specific message type.
     *
     * @param messageType The message type to stop handling
     */
    public unregisterProtocolHandler(messageType: string): void {
        this.protocolHandlers.delete(messageType);
    }

    /**
     * Checks if a protocol handler is registered for a message type.
     * This is used internally by the connectivity layer to route messages.
     *
     * @internal
     * @param messageType The message type to check
     * @returns The handler function if registered, undefined otherwise
     */
    public getProtocolHandler(messageType: string): NDKProtocolHandler | undefined {
        return this.protocolHandlers.get(messageType);
    }

    /**
     * Fetches relay information (NIP-11) from the relay.
     * Results are cached in persistent storage when cache adapter is available (24-hour TTL).
     * Falls back to in-memory cache. Pass force=true to bypass all caches.
     *
     * @param force Force a fresh fetch, bypassing all caches
     * @returns The relay information document
     * @throws Error if the fetch fails
     *
     * @example
     * ```typescript
     * const info = await relay.fetchInfo();
     * console.log(`Relay: ${info.name}`);
     * console.log(`Supported NIPs: ${info.supported_nips?.join(', ')}`);
     * ```
     */
    public async fetchInfo(force = false): Promise<NDKRelayInformation> {
        const MAX_AGE = 86400000; // 24 hours
        const ndk = (this.connectivity as any).ndk as NDK | undefined;

        // Check persistent cache first (unless forced)
        if (!force && ndk?.cacheAdapter?.getRelayStatus) {
            const cached = await ndk.cacheAdapter.getRelayStatus(this.url);
            if (cached?.nip11 && Date.now() - cached.nip11.fetchedAt < MAX_AGE) {
                this._relayInfo = cached.nip11.data;
                return cached.nip11.data;
            }
        }

        // Fall back to in-memory cache (unless forced)
        if (!force && this._relayInfo) {
            return this._relayInfo;
        }

        // Fetch fresh data
        this._relayInfo = await fetchRelayInformation(this.url);

        // Store in persistent cache if available
        if (ndk?.cacheAdapter?.updateRelayStatus) {
            await ndk.cacheAdapter.updateRelayStatus(this.url, {
                nip11: {
                    data: this._relayInfo,
                    fetchedAt: Date.now(),
                },
            });
        }

        return this._relayInfo;
    }

    /**
     * Returns cached relay information if available, undefined otherwise.
     * Use fetchInfo() to retrieve fresh information.
     */
    public get info(): NDKRelayInformation | undefined {
        return this._relayInfo;
    }
}

export { SignatureVerificationStats, startSignatureVerificationStats };
export { fetchRelayInformation, type NDKRelayInformation } from "./nip11.js";
