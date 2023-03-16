import 'websocket-polyfill';
import {relayInit, Event, Sub} from 'nostr-tools';
import User from '../user';
import {RelayScore} from './score';
import {Subscription} from '../subscription/';
import EventEmitter from 'events';

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
        } catch (e) {
        }
    }

    async handleNotice(notice: string) {
        this.emit('notice', this, notice);
    }

    public subscribe(subscription: Subscription): Sub {
        const {filter} = subscription;

        const sub = this.relay.sub([filter], {
            id: subscription.subId,
        });

        sub.on('event', (event: Event) => {
            subscription.eventReceived(event, this);
        });

        sub.on('eose', () => {
            subscription.eoseReceived(this);
        });

        return sub;
    }

    public async publish(event: Event): Promise<void> {
        this.relay.publish(event);
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
