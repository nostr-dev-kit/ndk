import debug from "debug";
import { EventEmitter } from "tseep";

import type { NDKEvent, NDKTag } from "../events/index.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { NDKUser } from "../user/index.js";
import { NDKRelayConnectivity } from "./connectivity.js";
import { NDKRelayPublisher } from "./publisher.js";
import type { NDKRelayScore } from "./score.js";
import { NDKRelaySubscriptionManager } from "./sub-manager.js";
import type { NDKAuthPolicy } from "./auth-policies.js";
import { normalizeRelayUrl } from "../utils/normalize-url.js";
import type { NDK } from "../ndk/index.js";
import type { NDKRelaySubscription } from "./subscription.js";

/** @deprecated Use `WebSocket['url']` instead. */
export type NDKRelayUrl = WebSocket["url"];

export enum NDKRelayStatus {
    DISCONNECTING, // 0
    DISCONNECTED, // 1
    RECONNECTING, // 2
    FLAPPING, // 3
    CONNECTING, // 4

    // connected states
    CONNECTED, // 5
    AUTH_REQUESTED, // 6
    AUTHENTICATING, // 7
    AUTHENTICATED, // 8
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
    private subs: NDKRelaySubscriptionManager;
    private publisher: NDKRelayPublisher;
    public authPolicy?: NDKAuthPolicy;

    /**
     * The lowest validation ratio this relay can reach.
     */
    public lowestValidationRatio?: number;

    /**
     * Current validation ratio this relay is targeting.
     */
    public targetValidationRatio?: number;

    public validationRatioFn?: (
        relay: NDKRelay,
        validatedCount: number,
        nonValidatedCount: number
    ) => number;

    /**
     * This tracks events that have been seen by this relay
     * with a valid signature.
     */
    private validatedEventCount = 0;

    /**
     * This tracks events that have been seen by this relay
     * but have not been validated.
     */
    private nonValidatedEventCount = 0;

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
        nonValidatedCount: number
    ): number => {
        if (relay.lowestValidationRatio === undefined || relay.targetValidationRatio === undefined)
            return 1;

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

    public constructor(url: WebSocket["url"], authPolicy?: NDKAuthPolicy, ndk?: NDK) {
        super();
        this.url = normalizeRelayUrl(url);
        this.scores = new Map<NDKUser, NDKRelayScore>();
        this.debug = debug(`ndk:relay:${url}`);
        this.connectivity = new NDKRelayConnectivity(this, ndk);
        this.req = this.connectivity.req.bind(this.connectivity);
        this.close = this.connectivity.close.bind(this.connectivity);
        this.subs = new NDKRelaySubscriptionManager(this, ndk?.subManager);
        this.publisher = new NDKRelayPublisher(this);
        this.authPolicy = authPolicy;
        this.targetValidationRatio = ndk?.initialValidationRatio;
        this.lowestValidationRatio = ndk?.lowestValidationRatio;
        this.validationRatioFn = (
            ndk?.validationRatioFn ?? NDKRelay.defaultValidationRatioUpdateFn
        ).bind(this);

        this.updateValidationRatio();

        if (!ndk) {
            console.trace("relay created without ndk");
        }
    }

    private updateValidationRatio(): void {
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

        // if the current validation ratio is below the threshold, validate the event
        return this.validationRatio < this.targetValidationRatio;
    }

    get connected(): boolean {
        return this.connectivity.connected;
    }

    public req: (relaySub: NDKRelaySubscription) => void;
    public close: (subId: string) => void;
}
