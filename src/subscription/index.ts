import {Filter as NostrFilter, Sub} from 'nostr-tools';
import EventEmitter from 'eventemitter3';
import {Relay} from '../relay';
import {RelaySet} from '../relay/sets/';
import {EventId} from '../events/';
import Event from '../events/';

export type Filter = NostrFilter;

export interface FilterOptions {
    skipCache?: boolean;
}

export interface SubscriptionOptions {
    closeOnEose: boolean;
}

export class Subscription extends EventEmitter {
    readonly subId: string;
    readonly filter: Filter;
    readonly relaySet: RelaySet;
    readonly opts?: SubscriptionOptions;
    public relaySubscriptions: Map<Relay, Sub>;

    public constructor(
        filter: Filter,
        relaySet: RelaySet,
        opts?: SubscriptionOptions,
        subId?: string
    ) {
        super();
        this.subId = subId || Math.floor(Math.random() * 9999991000).toString();
        this.filter = filter;
        this.relaySet = relaySet;
        this.opts = opts;
        this.relaySubscriptions = new Map<Relay, Sub>();
    }

    // EVENT handling
    private eventFirstSeen = new Map<EventId, number>();
    private events = new Map<EventId, Event>();

    public eventReceived(event: Event, relay: Relay) {
        const eventAlreadySeen = this.events.has(event.id);

        if (eventAlreadySeen) {
            if (this.eventFirstSeen.get(event.id)) {
                const timeSinceFirstSeen =
                    Date.now() - (this.eventFirstSeen.get(event.id) || 0);
                relay.scoreSlowerEvent(timeSinceFirstSeen);
            }

            return;
        }

        this.eventFirstSeen.set(event.id, Date.now());
        this.events.set(event.id, event);
        this.emit('event', event, relay);
    }

    // EOSE handling
    private eosesSeen = new Set<Relay>();
    private eoseTimeout: ReturnType<typeof setTimeout> | undefined;

    public eoseReceived(relay: Relay): void {
        if (this.opts?.closeOnEose) {
            this.relaySubscriptions.get(relay)?.unsub();
        }

        this.eosesSeen.add(relay);

        const hasSeenAllEoses = this.eosesSeen.size === this.relaySet.size();

        if (hasSeenAllEoses) {
            this.emit('eose');
        } else {
            if (this.eoseTimeout) {
                clearTimeout(this.eoseTimeout);
            }

            this.eoseTimeout = setTimeout(() => {
                this.emit('eose');
            }, 500);
        }
    }
}
