import debug from "debug";
import EventEmitter from "eventemitter3";
import { NDKEvent, NDKTag } from "../events/index.js";
import { NDKSubscription } from "../subscription/index.js";
import {NDKUser} from "../user/index.js";
import { NDKRelayScore } from "./score.js";
import { NDKRelayConnectivity } from "./connectivity.js";
import { NDKRelayFilters, NDKRelaySubscriptions } from "./subscriptions.js";
import { NDKRelayPublisher } from "./publisher.js";

export type NDKRelayUrl = string;

export enum NDKRelayStatus {
    CONNECTING,
    CONNECTED,
    DISCONNECTING,
    DISCONNECTED,
    RECONNECTING,
    FLAPPING,
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
}

/**
 * The NDKRelay class represents a connection to a relay.
 *
 * @emits NDKRelay#connect
 * @emits NDKRelay#disconnect
 * @emits NDKRelay#notice
 * @emits NDKRelay#event
 * @emits NDKRelay#published when an event is published to the relay
 * @emits NDKRelay#publish:failed when an event fails to publish to the relay
 * @emits NDKRelay#eose
 */
export class NDKRelay extends EventEmitter {
    readonly url: NDKRelayUrl;
    readonly scores: Map<NDKUser, NDKRelayScore>;
    public connectivity: NDKRelayConnectivity;
    private subs: NDKRelaySubscriptions;
    private publisher: NDKRelayPublisher;


    public complaining = false;
    readonly debug: debug.Debugger;



    public constructor(url: NDKRelayUrl) {
        super();
        this.url = url;
        this.scores = new Map<NDKUser, NDKRelayScore>();
        this.debug = debug(`ndk:relay:${url}`);
        this.connectivity = new NDKRelayConnectivity(this);
        this.subs = new NDKRelaySubscriptions(this);
        this.publisher = new NDKRelayPublisher(this);
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
    public async connect(): Promise<void> {
        return this.connectivity.connect();
    }

    /**
     * Disconnects from the relay.
     */
    public disconnect(): void {
        this.disconnect();
    }

    /**
     * Queues or executes the subscription of a specific set of filters
     * within this relay.
     *
     * @param subscription NDKSubscription this filters belong to.
     * @param filters Filters to execute
     */
    public subscribe(
        subscription: NDKSubscription,
        filters: NDKRelayFilters,
    ): void {
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

    public tagReference(marker?: string): NDKTag {
        const tag = ["r", this.url];

        if (marker) {
            tag.push(marker);
        }

        return tag;
    }
}
