import debug from "debug";
import { EventEmitter } from "tseep";

import type { NDKEvent, NDKTag } from "../events/index.js";
import type { NDKFilter, NDKSubscription } from "../subscription/index.js";
import type { NDKUser } from "../user/index.js";
import { NDKRelayConnectivity } from "./connectivity.js";
import { NDKRelayPublisher } from "./publisher.js";
import type { NDKRelayScore } from "./score.js";
import { NDKRelaySubscriptions } from "./subscriptions.js";
import { NDKAuthPolicy } from "./auth-policies.js";
import { normalizeRelayUrl } from "../utils/normalize-url.js";
import { NDK } from "../ndk/index.js";

/** @deprecated Use `WebSocket['url']` instead. */
export type NDKRelayUrl = WebSocket["url"];

export enum NDKRelayStatus {
    CONNECTING,
    CONNECTED,
    DISCONNECTING,
    DISCONNECTED,
    RECONNECTING,
    FLAPPING,
    AUTH_REQUIRED,
    AUTHENTICATING,
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
 * @emits NDKRelay#authfail when the relay has rejected the authentication
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
    authfail: () => void;
    published: (event: NDKEvent) => void;
    "publish:failed": (event: NDKEvent, error: Error) => void;
    "delayed-connect": (delayInMs: number) => void;
}> {
    readonly url: WebSocket["url"];
    readonly scores: Map<NDKUser, NDKRelayScore>;
    public connectivity: NDKRelayConnectivity;
    private subs: NDKRelaySubscriptions;
    private publisher: NDKRelayPublisher;
    public authPolicy?: NDKAuthPolicy;
    public validationRatio?: number;
    private validatedEventCount: number = 0;
    private skippedEventCount: number = 0;

    /**
     * Whether this relay is trusted.
     *
     * Trusted relay's events do not get their signature verified.
     */
    public trusted = false;

    public complaining = false;
    readonly debug: debug.Debugger;

    public constructor(url: WebSocket["url"], authPolicy?: NDKAuthPolicy, ndk?: NDK) {
        super();
        this.url = normalizeRelayUrl(url);
        this.scores = new Map<NDKUser, NDKRelayScore>();
        this.debug = debug(`ndk:relay:${url}`);
        this.connectivity = new NDKRelayConnectivity(this, ndk);
        this.subs = new NDKRelaySubscriptions(this);
        this.publisher = new NDKRelayPublisher(this);
        this.authPolicy = authPolicy;
        this.validationRatio = undefined;
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
        this.subs.subscribe(subscription, filters);
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

    /**
     * Called when this relay has responded with an event but
     * wasn't the fastest one.
     * @param timeDiffInMs The time difference in ms between the fastest and this relay in milliseconds
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public scoreSlowerEvent(timeDiffInMs: number): void {
        // TODO
    }

    /** @deprecated Use referenceTags instead. */
    public tagReference(marker?: string): NDKTag {
        const tag = ["r", this.url];

        if (marker) {
            tag.push(marker);
        }

        return tag;
    }

    public referenceTags(): NDKTag[] {
        return [["r", this.url]];
    }

    public activeSubscriptions(): Map<NDKFilter[], NDKSubscription[]> {
        return this.subs.executedFilters();
    }

    public addValidatedEvent(): void {
        this.validatedEventCount++;
    }

    public addSkippedEvent(): void {
        this.skippedEventCount++;
    }

    public getValidationRatio(): number {
        if (this.skippedEventCount === 0) {
            return 1;
        }

        return this.validatedEventCount / (this.validatedEventCount + this.skippedEventCount);
    }

    public shouldValidateEvent(): boolean {
        if (this.trusted) {
            return false;
        }

        if (this.validationRatio === undefined) {
            return true;
        }

        // if the current validation ratio is below the threshold, validate the event
        return this.getValidationRatio() < this.validationRatio;
    }
}
