import NDK from '../';
import {Filter as NostrFilter, Sub} from 'nostr-tools';
import EventEmitter from 'eventemitter3';
import {NDKRelay} from '../relay';
import {NDKRelaySet} from '../relay/sets/';
import {NDKEventId} from '../events/';
import NDKEvent from '../events/';
import {
    calculateRelaySetFromFilter,
    calculateRelaySetFromEvent,
} from '../relay/sets/calculate';

export type NDKFilter = NostrFilter;

export interface NDKFilterOptions {
    skipCache?: boolean;
}

export interface NDKSubscriptionOptions {
    closeOnEose: boolean;
    cacheUsage?: NDKSubscriptionCacheUsage;
}

export enum NDKSubscriptionCacheUsage {
    // Only use cache, don't subscribe to relays
    ONLY = 'ONLY',

    // Skip cache, don't use it
    SKIP = 'SKIP',

    // Only write to cache, don't read from it
    WRITE_ONLY = 'WRITE_ONLY',
}

export class NDKSubscription extends EventEmitter {
    readonly subId: string;
    readonly filter: NDKFilter;
    readonly opts?: NDKSubscriptionOptions;
    public relaySet?: NDKRelaySet;
    public ndk: NDK;
    public relaySubscriptions: Map<NDKRelay, Sub>;

    public constructor(
        ndk: NDK,
        filter: NDKFilter,
        opts?: NDKSubscriptionOptions,
        relaySet?: NDKRelaySet,
        subId?: string
    ) {
        super();
        this.ndk = ndk;
        this.subId = subId || Math.floor(Math.random() * 9999991000).toString(); // TODO: use UUID
        this.filter = filter;
        this.relaySet = relaySet;
        this.opts = opts;
        this.relaySubscriptions = new Map<NDKRelay, Sub>();
    }

    /**
     * Start the subscription. This is the main method that should be called
     * after creating a subscription.
     */
    public start(): NDKSubscription {
        if (this.opts?.cacheUsage !== NDKSubscriptionCacheUsage.SKIP) {
            this.startWithCache();
        }

        if (this.opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY) {
            this.startWithRelaySet();
        }

        return this;
    }

    private startWithCache(): void {
        if (this.ndk.cacheAdapter?.query) {
            this.ndk.cacheAdapter.query(this);
        }
    }

    private startWithRelaySet(): void {
        if (!this.relaySet) {
            this.relaySet = calculateRelaySetFromFilter(this.ndk, this.filter);
        }

        if (this.relaySet) {
            this.relaySet.subscribe(this);
        }
    }

    // EVENT handling
    private eventFirstSeen = new Map<NDKEventId, number>();
    private events = new Map<NDKEventId, NDKEvent>();

    public eventReceived(event: NDKEvent, relay: NDKRelay, fromCache = false) {
        if (fromCache) {
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
        }

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

        const hasSeenAllEoses = this.eosesSeen.size === this.relaySet?.size();

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
