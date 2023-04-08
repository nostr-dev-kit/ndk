import 'websocket-polyfill';
import {relayInit, Sub} from 'nostr-tools';
import type {Event as SignedEvent} from 'nostr-tools';
import User from '../user/index.js';
import {NDKRelayScore} from './score.js';
import {NDKSubscription} from '../subscription/index.js';
import NDKEvent, {NostrEvent} from '../events/index.js';
import EventEmitter from 'eventemitter3';

export enum NDKRelayStatus {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
    ERROR,
    RECONNECTING,
};

interface NDKRelayConnectionStats {
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
 * @emits NDKRelay#eose
 */
export class NDKRelay extends EventEmitter {
    readonly url: string;
    readonly scores: Map<User, NDKRelayScore>;
    private relay;
    private _status: NDKRelayStatus;
    private connectedAt?: number;
    private _connectionStats: NDKRelayConnectionStats = {attempts: 0, success: 0, durations: []};

    public constructor(url: string) {
        super();
        this.url = url;
        this.relay = relayInit(url);
        this.scores = new Map<User, NDKRelayScore>();
        this._status = NDKRelayStatus.DISCONNECTED;

        this.relay.on('connect', () => {
            this.updateConnectionStats.connected();
            this.emit('connect');
            this._status = NDKRelayStatus.CONNECTED;
        });

        this.relay.on('disconnect', () => {
            this.updateConnectionStats.disconnected();
            this.emit('disconnect');

            if (this._status === NDKRelayStatus.CONNECTED) {
                this._status = NDKRelayStatus.DISCONNECTED;

                // if the last connection was less than 5 seconds ago, wait some time before trying to reconnect
                if (this.connectedAt && Date.now() - this.connectedAt < 5000) {
                    setTimeout(() => this.connect(), 60000);
                } else {
                    this.connect();
                }
            }
        });

        this.relay.on('notice', (notice: string) => this.handleNotice(notice));
    }

    get status(): NDKRelayStatus {
        return this._status;
    }

    public async connect(): Promise<void> {
        try {
            this.updateConnectionStats.attempt();
            this._status = NDKRelayStatus.CONNECTING;
            await this.relay.connect();
        } catch (e) { /* empty */ }
    }

    async handleNotice(notice: string) {
        this.emit('notice', this, notice);
    }

    public subscribe(subscription: NDKSubscription): Sub {
        const {filter} = subscription;

        const sub = this.relay.sub([filter], {
            id: subscription.subId,
        });

        sub.on('event', (event: NostrEvent) => {
            const e = new NDKEvent(undefined, event);
            subscription.eventReceived(e, this);
        });

        sub.on('eose', () => {
            subscription.eoseReceived(this);
        });

        return sub;
    }

    public async publish(event: NDKEvent): Promise<void> {
        const nostrEvent = (await event.toNostrEvent()) as SignedEvent;
        this.relay.publish(nostrEvent);
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
                this._connectionStats.durations.push(Date.now() - this._connectionStats.connectedAt);

                if (this._connectionStats.durations.length > 100) {
                    this._connectionStats.durations.shift();
                }
            }
            this._connectionStats.connectedAt = undefined;
        },

        attempt: () => {
            this._connectionStats.attempts++;
        }
    };

    /**
     * Number of times this relay has been successfully connected to.
     */
    get connectionStats(): NDKRelayConnectionStats {
        return this._connectionStats;
    }
}
