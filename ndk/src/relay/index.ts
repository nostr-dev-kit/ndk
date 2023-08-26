import debug from "debug";
import EventEmitter from "eventemitter3";
import { Relay, relayInit, Sub } from "nostr-tools";
import "websocket-polyfill";
import NDKEvent, { NDKTag, NostrEvent } from "../events/index.js";
import { NDKSubscription } from "../subscription/index.js";
import User from "../user/index.js";
import { NDKRelayScore } from "./score.js";

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
    readonly url: string;
    readonly scores: Map<User, NDKRelayScore>;
    private relay: Relay;
    private _status: NDKRelayStatus;
    private connectedAt?: number;
    private _connectionStats: NDKRelayConnectionStats = {
        attempts: 0,
        success: 0,
        durations: [],
    };
    public complaining = false;
    private debug: debug.Debugger;

    /**
     * Active subscriptions this relay is connected to
     */
    public activeSubscriptions = new Set<NDKSubscription>();

    public constructor(url: string) {
        super();
        this.url = url;
        this.relay = relayInit(url);
        this.scores = new Map<User, NDKRelayScore>();
        this._status = NDKRelayStatus.DISCONNECTED;
        this.debug = debug(`ndk:relay:${url}`);

        this.relay.on("connect", () => {
            this.updateConnectionStats.connected();
            this._status = NDKRelayStatus.CONNECTED;
            this.emit("connect");
        });

        this.relay.on("disconnect", () => {
            this.updateConnectionStats.disconnected();

            if (this._status === NDKRelayStatus.CONNECTED) {
                this._status = NDKRelayStatus.DISCONNECTED;

                this.handleReconnection();
            }
            this.emit("disconnect");
        });

        this.relay.on("notice", (notice: string) => this.handleNotice(notice));
    }

    /**
     * Evaluates the connection stats to determine if the relay is flapping.
     */
    private isFlapping(): boolean {
        const durations = this._connectionStats.durations;
        if (durations.length < 10) return false;

        const sum = durations.reduce((a, b) => a + b, 0);
        const avg = sum / durations.length;
        const variance =
            durations
                .map((x) => Math.pow(x - avg, 2))
                .reduce((a, b) => a + b, 0) / durations.length;
        const stdDev = Math.sqrt(variance);
        const isFlapping = stdDev < 1000;

        return isFlapping;
    }

    /**
     * Called when the relay is unexpectedly disconnected.
     */
    private handleReconnection() {
        if (this.isFlapping()) {
            this.emit("flapping", this, this._connectionStats);
            this._status = NDKRelayStatus.FLAPPING;
        }

        if (this.connectedAt && Date.now() - this.connectedAt < 5000) {
            setTimeout(() => this.connect(), 60000);
        } else {
            this.connect();
        }
    }

    get status(): NDKRelayStatus {
        return this._status;
    }

    /**
     * Connects to the relay.
     */
    public async connect(): Promise<void> {
        try {
            this.updateConnectionStats.attempt();
            this._status = NDKRelayStatus.CONNECTING;
            await this.relay.connect();
        } catch (e) {
            this.debug("Failed to connect", e);
            this._status = NDKRelayStatus.DISCONNECTED;
            throw e;
        }
    }

    /**
     * Disconnects from the relay.
     */
    public disconnect(): void {
        this._status = NDKRelayStatus.DISCONNECTING;
        this.relay.close();
    }

    async handleNotice(notice: string) {
        // This is a prototype; if the relay seems to be complaining
        // remove it from relay set selection for a minute.
        if (notice.includes("oo many") || notice.includes("aximum")) {
            this.disconnect();

            // fixme
            setTimeout(() => this.connect(), 2000);
            this.debug(this.relay.url, "Relay complaining?", notice);
            // this.complaining = true;
            // setTimeout(() => {
            //     this.complaining = false;
            //     console.log(this.relay.url, 'Reactivate relay');
            // }, 60000);
        }

        this.emit("notice", this, notice);
    }

    /**
     * Subscribes to a subscription.
     */
    public subscribe(subscription: NDKSubscription): Sub {
        const { filters } = subscription;

        const sub = this.relay.sub(filters, {
            id: subscription.subId,
        });
        this.debug(`Subscribed to ${JSON.stringify(filters)}`);

        sub.on("event", (event: NostrEvent) => {
            const e = new NDKEvent(undefined, event);
            e.relay = this;
            subscription.eventReceived(e, this);
        });

        sub.on("eose", () => {
            subscription.eoseReceived(this);
        });

        const unsub = sub.unsub;
        sub.unsub = () => {
            this.debug(`Unsubscribing from ${JSON.stringify(filters)}`);
            this.activeSubscriptions.delete(subscription);
            unsub();
        };

        this.activeSubscriptions.add(subscription);
        subscription.on("close", () => {
            this.activeSubscriptions.delete(subscription);
        });

        return sub;
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
        if (this.status === NDKRelayStatus.CONNECTED) {
            return this.publishEvent(event, timeoutMs);
        } else {
            this.once("connect", () => {
                this.publishEvent(event, timeoutMs);
            });
            return true;
        }
    }

    private async publishEvent(
        event: NDKEvent,
        timeoutMs?: number
    ): Promise<boolean> {
        const nostrEvent = await event.toNostrEvent();
        const publish = this.relay.publish(nostrEvent as any);
        let publishTimeout: NodeJS.Timeout | number;

        const publishPromise = new Promise<boolean>((resolve, reject) => {
            publish
                .then(() => {
                    clearTimeout(publishTimeout as unknown as NodeJS.Timeout);
                    this.emit("published", event);
                    resolve(true);
                })
                .catch((err) => {
                    clearTimeout(publishTimeout as NodeJS.Timeout);
                    this.debug("Publish failed", err, event.id);
                    this.emit("publish:failed", event, err);
                    reject(err);
                });
        });

        // If no timeout is specified, just return the publish promise
        if (!timeoutMs) {
            return publishPromise;
        }

        // Create a promise that rejects after timeoutMs milliseconds
        const timeoutPromise = new Promise<boolean>((_, reject) => {
            publishTimeout = setTimeout(() => {
                this.debug("Publish timed out", event.rawEvent());
                this.emit("publish:failed", event, "Timeout");
                reject(new Error("Publish operation timed out"));
            }, timeoutMs);
        });

        // wait for either the publish operation to complete or the timeout to occur
        return Promise.race([publishPromise, timeoutPromise]);
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

    /**
     * Utility functions to update the connection stats.
     */
    private updateConnectionStats = {
        connected: () => {
            this._connectionStats.success++;
            this._connectionStats.connectedAt = Date.now();
        },

        disconnected: () => {
            if (this._connectionStats.connectedAt) {
                this._connectionStats.durations.push(
                    Date.now() - this._connectionStats.connectedAt
                );

                if (this._connectionStats.durations.length > 100) {
                    this._connectionStats.durations.shift();
                }
            }
            this._connectionStats.connectedAt = undefined;
        },

        attempt: () => {
            this._connectionStats.attempts++;
        },
    };

    /**
     * Returns the connection stats.
     */
    get connectionStats(): NDKRelayConnectionStats {
        return this._connectionStats;
    }

    public tagReference(marker?: string): NDKTag {
        const tag = ["r", this.relay.url];

        if (marker) {
            tag.push(marker);
        }

        return tag;
    }
}
