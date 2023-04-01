import {Filter as NostrFilter, Sub} from 'nostr-tools';
import EventEmitter from 'eventemitter3';
import {NDKRelay} from '../relay';
import {NDKRelaySet} from '../relay/sets/';
import {NDKEventId} from '../events/';
import NDKEvent from '../events/';

export type NDKFilter = NostrFilter;

export interface NDKFilterOptions {
    skipCache?: boolean;
}

export interface NDKSubscriptionOptions {
    closeOnEose: boolean;
}

export class NDKSubscription extends EventEmitter {
    readonly subId: string;
    readonly filter: NDKFilter;
    readonly relaySet: NDKRelaySet;
    readonly opts?: NDKSubscriptionOptions;
    public relaySubscriptions: Map<NDKRelay, Sub>;

    public constructor(
        filter: NDKFilter,
        relaySet: NDKRelaySet,
        opts?: NDKSubscriptionOptions,
        subId?: string
    ) {
        super();
        this.subId = subId || Math.floor(Math.random() * 9999991000).toString();
        this.filter = filter;
        this.relaySet = relaySet;
        this.opts = opts;
        this.relaySubscriptions = new Map<NDKRelay, Sub>();
    }

    // EVENT handling
    private eventFirstSeen = new Map<NDKEventId, number>();
    private events = new Map<NDKEventId, NDKEvent>();

    public eventReceived(event: NDKEvent, relay: NDKRelay) {
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
    private eosesSeen = new Set<NDKRelay>();
    private eoseTimeout: ReturnType<typeof setTimeout> | undefined;

    public eoseReceived(relay: NDKRelay): void {
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
