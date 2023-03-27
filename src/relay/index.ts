import 'websocket-polyfill';
import {relayInit, Sub} from 'nostr-tools';
import type {Event as SignedEvent} from 'nostr-tools';
import User from '../user';
import {RelayScore} from './score';
import {Subscription} from '../subscription/';
import Event, {NostrEvent} from '../events/';
import EventEmitter from 'eventemitter3';

export class Relay extends EventEmitter {
    readonly url: string;
    readonly scores: Map<User, RelayScore>;
    private relay;

    public constructor(url: string) {
        super();
        this.url = url;
        this.relay = relayInit(url);
        this.scores = new Map<User, RelayScore>();

        this.relay.on('connect', () => {
            this.emit('connect');
        });

        this.relay.on('disconnect', () => {
            this.emit('disconnect');
        });

        this.relay.on('notice', (notice: string) => this.handleNotice(notice));
    }

    public async connect(): Promise<void> {
        try {
            await this.relay.connect();
            // eslint-disable-next-line no-empty
        } catch (e) {}
    }

    async handleNotice(notice: string) {
        this.emit('notice', this, notice);
    }

    public subscribe(subscription: Subscription): Sub {
        const {filter} = subscription;

        const sub = this.relay.sub([filter], {
            id: subscription.subId,
        });

        sub.on('event', (event: NostrEvent) => {
            const e = event as unknown;
            subscription.eventReceived(e as Event, this);
        });

        sub.on('eose', () => {
            subscription.eoseReceived(this);
        });

        return sub;
    }

    public async publish(event: Event): Promise<void> {
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
