import NDK from '../index.js';
import {Filter as NostrFilter, Sub} from 'nostr-tools';
import EventEmitter from 'eventemitter3';
import {NDKRelay} from '../relay';
import {NDKRelaySet} from '../relay/sets/index.js';
import {NDKEventId} from '../events/index.js';
import NDKEvent from '../events/index.js';
import { calculateRelaySetFromFilter } from '../relay/sets/calculate';

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
    ONLY_CACHE = 'ONLY_CACHE',

    // Use cache, if no matches, use relays
    CACHE_FIRST = 'CACHE_FIRST',

    // Use cache in addition to relays
    PARALLEL = 'PARALLEL',

    // Skip cache, don't query it
    ONLY_RELAY = 'ONLY_RELAY',
}

export class NDKSubscription extends EventEmitter {
    readonly subId: string;
    readonly filter: NDKFilter;
    readonly opts?: NDKSubscriptionOptions;
    public relaySet?: NDKRelaySet;
    public ndk: NDK;
    public relaySubscriptions: Map<NDKRelay, Sub>;
    private debug: debug.Debugger;

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
        this.debug = ndk.debug.extend('subscription');

        // validate that the caller is not expecting a persistent
        // subscription is using an option that might only hit the cache
        if (
            opts?.cacheUsage === NDKSubscriptionCacheUsage.ONLY_CACHE ||
            opts?.cacheUsage === NDKSubscriptionCacheUsage.CACHE_FIRST
        ) {
            throw new Error(
                'Cannot use cache-only options with a persistent subscription'
            );
        }

    }

    private shouldQueryCache(): boolean {
        return (
            this.opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY_RELAY
        );
    }

    private shouldQueryRelays(): boolean {
        return (
            this.opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY_CACHE
        );
    }

    /**
     * Start the subscription. This is the main method that should be called
     * after creating a subscription.
     */
    public async start(): Promise<void> {
        let cachePromise;

        if (this.shouldQueryCache()) {
            cachePromise = this.startWithCache();

            const shouldWaitForCache = (
                this.ndk.cacheAdapter?.locking &&
                this.shouldQueryRelays() &&
                this.opts?.cacheUsage !== NDKSubscriptionCacheUsage.PARALLEL
            );

            if (shouldWaitForCache) {
                this.debug('waiting for cache to finish');
                await cachePromise;

                // if the cache has a hit, return early
                if (this.events.size > 0) {
                    this.debug('cache hit, skipping relay query');
                    this.emit('eose');
                    return;
                }
            }
        }

        if (this.shouldQueryRelays()) {
            this.startWithRelaySet();
        }

        return;
    }

    private async startWithCache(): Promise<void> {
        if (this.ndk.cacheAdapter?.query) {
            this.debug('querying cache');
            const promise = this.ndk.cacheAdapter.query(this);

            if (this.ndk.cacheAdapter.locking) {
                await promise;
            }
        }
    }

    private startWithRelaySet(): void {
        if (!this.relaySet) {
            this.relaySet = calculateRelaySetFromFilter(this.ndk, this.filter);
        }

        if (this.relaySet) {
            this.debug('querying relays');
            this.relaySet.subscribe(this);
        }
    }

    // EVENT handling
    private eventFirstSeen = new Map<NDKEventId, number>();
    private events = new Map<NDKEventId, NDKEvent>();

    public eventReceived(event: NDKEvent, relay: NDKRelay | undefined, fromCache = false) {
        if (!fromCache && relay) {
            const eventAlreadySeen = this.events.has(event.id);

            if (eventAlreadySeen) {
                if (this.eventFirstSeen.get(event.id)) {
                    const timeSinceFirstSeen =
                        Date.now() - (this.eventFirstSeen.get(event.id) || 0);
                    relay.scoreSlowerEvent(timeSinceFirstSeen);
                }

                return;
            }

            if (this.ndk.cacheAdapter) {
                this.ndk.cacheAdapter.setEvent(event, this.filter);
            }

            this.eventFirstSeen.set(event.id, Date.now());
        }

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
