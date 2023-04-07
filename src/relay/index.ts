import 'websocket-polyfill';
import {relayInit, Sub} from 'nostr-tools';
import type {Event as SignedEvent} from 'nostr-tools';
import User from '../user/index.js';
import {NDKRelayScore} from './score';
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

export class NDKRelay extends EventEmitter {
    readonly url: string;
    readonly scores: Map<User, NDKRelayScore>;
    private relay;
    private _status: NDKRelayStatus;

    public constructor(url: string) {
        super();
        this.url = url;
        this.relay = relayInit(url);
        this.scores = new Map<User, NDKRelayScore>();
        this._status = NDKRelayStatus.DISCONNECTED;

        this.relay.on('connect', () => {
            this.emit('connect');
            this._status = NDKRelayStatus.CONNECTED;
        });

        this.relay.on('disconnect', () => {
            this.emit('disconnect');
            this._status = NDKRelayStatus.DISCONNECTED;
        });

        this.relay.on('notice', (notice: string) => this.handleNotice(notice));
    }

    get status(): NDKRelayStatus {
        return this._status;
    }

    public async connect(): Promise<void> {
        try {
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
}
