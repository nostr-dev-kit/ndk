import { EventEmitter } from "tseep";

import type { NDKEvent, NDKEventId } from "../events/index.js";
import type { NDKKind } from "../events/kinds/index.js";
import type { NDK } from "../ndk/index.js";
import type { NDKRelay, NDKRelayUrl } from "../relay";
import type { NDKPool } from "../relay/pool/index.js";
import { calculateRelaySetsFromFilters } from "../relay/sets/calculate";
import type { NDKRelaySet } from "../relay/sets/index.js";
import { queryFullyFilled } from "./utils.js";

export type NDKFilter<K extends number = NDKKind> = {
    ids?: string[];
    kinds?: K[];
    authors?: string[];
    since?: number;
    until?: number;
    limit?: number;
    search?: string;
    [key: `#${string}`]: string[];
};

export enum NDKSubscriptionCacheUsage {
    // Only use cache, don't subscribe to relays
    ONLY_CACHE = "ONLY_CACHE",

    // Use cache, if no matches, use relays
    CACHE_FIRST = "CACHE_FIRST",

    // Use cache in addition to relays
    PARALLEL = "PARALLEL",

    // Skip cache, don't query it
    ONLY_RELAY = "ONLY_RELAY",
}

export interface NDKSubscriptionOptions {
    /**
     * Whether to close the subscription when all relays have reached the end of the event stream.
     * @default false
     */
    closeOnEose?: boolean;
    cacheUsage?: NDKSubscriptionCacheUsage;

    /**
     * Groupable subscriptions are created with a slight time
     * delayed to allow similar filters to be grouped together.
     */
    groupable?: boolean;

    /**
     * The delay to use when grouping subscriptions, specified in milliseconds.
     * @default 100
     */
    groupableDelay?: number;

    /**
     * The subscription ID to use for the subscription.
     */
    subId?: string;

    /**
     * Pool to use
     */
    pool?: NDKPool;
}

/**
 * Default subscription options.
 */
export const defaultOpts: NDKSubscriptionOptions = {
    closeOnEose: false,
    cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST,
    groupable: true,
    groupableDelay: 100,
};

/**
 * Represents a subscription to an NDK event stream.
 *
 * @event NDKSubscription#event
 * Emitted when an event is received by the subscription.
 * @param {NDKEvent} event - The event received by the subscription.
 * @param {NDKRelay} relay - The relay that received the event.
 * @param {NDKSubscription} subscription - The subscription that received the event.
 *
 * @event NDKSubscription#event:dup
 * Emitted when a duplicate event is received by the subscription.
 * @param {NDKEvent} event - The duplicate event received by the subscription.
 * @param {NDKRelay} relay - The relay that received the event.
 * @param {number} timeSinceFirstSeen - The time elapsed since the first time the event was seen.
 * @param {NDKSubscription} subscription - The subscription that received the event.
 *
 * @event NDKSubscription#eose - Emitted when all relays have reached the end of the event stream.
 * @param {NDKSubscription} subscription - The subscription that received EOSE.
 *
 * @event NDKSubscription#close - Emitted when the subscription is closed.
 * @param {NDKSubscription} subscription - The subscription that was closed.
 */
export class NDKSubscription extends EventEmitter {
    readonly subId?: string;
    readonly filters: NDKFilter[];
    readonly opts: NDKSubscriptionOptions;
    readonly pool: NDKPool;

    /**
     * Tracks the filters as they are executed on each relay
     */
    public relayFilters?: Map<NDKRelayUrl, NDKFilter[]>;
    public relaySet?: NDKRelaySet;
    public ndk: NDK;
    public debug: debug.Debugger;
    public eoseDebug: debug.Debugger;

    /**
     * Events that have been seen by the subscription, with the time they were first seen.
     */
    public eventFirstSeen = new Map<NDKEventId, number>();

    /**
     * Relays that have sent an EOSE.
     */
    public eosesSeen = new Set<NDKRelay>();

    /**
     * Events that have been seen by the subscription per relay.
     */
    public eventsPerRelay: Map<NDKRelay, Set<NDKEventId>> = new Map();

    /**
     * The time the last event was received by the subscription.
     * This is used to calculate when EOSE should be emitted.
     */
    private lastEventReceivedAt: number | undefined;

    public internalId: string;

    public constructor(
        ndk: NDK,
        filters: NDKFilter | NDKFilter[],
        opts?: NDKSubscriptionOptions,
        relaySet?: NDKRelaySet,
        subId?: string
    ) {
        super();
        this.ndk = ndk;
        this.pool = opts?.pool || ndk.pool;
        this.opts = { ...defaultOpts, ...(opts || {}) };
        this.filters = filters instanceof Array ? filters : [filters];
        this.subId = subId || opts?.subId;
        this.internalId = Math.random().toString(36).substring(7);
        this.relaySet = relaySet;
        this.debug = ndk.debug.extend(`subscription[${opts?.subId ?? this.internalId}]`);
        5;
        this.eoseDebug = this.debug.extend("eose");

        if (!this.opts.closeOnEose) {
            this.debug(
                `Creating a permanent subscription`,
                this.opts,
                JSON.stringify(this.filters)
            );
        }

        // validate that the caller is not expecting a persistent
        // subscription while using an option that will only hit the cache
        if (
            this.opts.cacheUsage === NDKSubscriptionCacheUsage.ONLY_CACHE &&
            !this.opts.closeOnEose
        ) {
            throw new Error("Cannot use cache-only options with a persistent subscription");
        }
    }

    /**
     * Provides access to the first filter of the subscription for
     * backwards compatibility.
     */
    get filter(): NDKFilter {
        return this.filters[0];
    }

    public isGroupable(): boolean {
        return this.opts?.groupable || false;
    }

    private shouldQueryCache(): boolean {
        return this.opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY_RELAY;
    }

    private shouldQueryRelays(): boolean {
        return this.opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY_CACHE;
    }

    private shouldWaitForCache(): boolean {
        return (
            // Must want to close on EOSE; subscriptions
            // that want to receive further updates must
            // always hit the relay
            this.opts.closeOnEose! &&
            // Cache adapter must claim to be fast
            !!this.ndk.cacheAdapter?.locking &&
            // If explicitly told to run in parallel, then
            // we should not wait for the cache
            this.opts.cacheUsage !== NDKSubscriptionCacheUsage.PARALLEL
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

            if (this.shouldWaitForCache()) {
                await cachePromise;

                // if the cache has a hit, return early
                if (queryFullyFilled(this)) {
                    this.emit("eose", this);
                    return;
                }
            }
        }

        if (this.shouldQueryRelays()) {
            this.startWithRelays();
        } else {
            this.emit("eose", this);
        }

        return;
    }

    public stop(): void {
        // this.debug(`running stop ${this.internalId}`);
        this.emit("close", this);
        this.removeAllListeners();
    }

    /**
     * @returns Whether the subscription has an authors filter.
     */
    public hasAuthorsFilter(): boolean {
        return this.filters.some((f) => f.authors?.length);
    }

    private async startWithCache(): Promise<void> {
        if (this.ndk.cacheAdapter?.query) {
            const promise = this.ndk.cacheAdapter.query(this);

            if (this.ndk.cacheAdapter.locking) {
                await promise;
            }
        }
    }

    /**
     * Send REQ to relays
     */
    private startWithRelays(): void {
        if (!this.relaySet) {
            this.relayFilters = calculateRelaySetsFromFilters(this.ndk, this.filters);
        } else {
            this.relayFilters = new Map();
            for (const relay of this.relaySet.relays) {
                this.relayFilters.set(relay.url, this.filters);
            }
        }

        // if relayset is empty, we can't start, log it
        if (!this.relayFilters || this.relayFilters.size === 0) {
            this.debug(`No relays to subscribe to`, this.ndk.explicitRelayUrls);
            return;
        }

        // const relayUrls = Array.from(this.relayFilters.keys());
        // this.debug(`Starting subscription`, JSON.stringify(this.filters), this.opts, Array.from(this.relaySet?.relays!).map(r => r.url));

        // iterate through the this.relayFilters
        for (const [relayUrl, filters] of this.relayFilters) {
            const relay = this.pool.getRelay(relayUrl);
            relay.subscribe(this, filters);
        }
    }

    // EVENT handling

    /**
     * Called when an event is received from a relay or the cache
     * @param event
     * @param relay
     * @param fromCache Whether the event was received from the cache
     */
    public eventReceived(event: NDKEvent, relay: NDKRelay | undefined, fromCache = false) {
        if (relay) event.relay = relay;
        if (!relay) relay = event.relay;

        if (!fromCache && relay) {
            // track the event per relay
            let events = this.eventsPerRelay.get(relay);

            if (!events) {
                events = new Set();
                this.eventsPerRelay.set(relay, events);
            }

            events.add(event.id);

            // mark the event as seen
            const eventAlreadySeen = this.eventFirstSeen.has(event.id);

            if (eventAlreadySeen) {
                const timeSinceFirstSeen = Date.now() - (this.eventFirstSeen.get(event.id) || 0);
                relay.scoreSlowerEvent(timeSinceFirstSeen);

                this.emit("event:dup", event, relay, timeSinceFirstSeen, this);

                return;
            }

            if (this.ndk.cacheAdapter) {
                this.ndk.cacheAdapter.setEvent(event, this.filters, relay);
            }

            this.eventFirstSeen.set(event.id, Date.now());
        } else {
            this.eventFirstSeen.set(event.id, 0);
        }

        if (!event.ndk) event.ndk = this.ndk;

        this.emit("event", event, relay, this);
        this.lastEventReceivedAt = Date.now();
    }

    // EOSE handling
    private eoseTimeout: ReturnType<typeof setTimeout> | undefined;

    public eoseReceived(relay: NDKRelay): void {
        this.eosesSeen.add(relay);

        this.eoseDebug(`received from ${relay.url}`);

        let lastEventSeen = this.lastEventReceivedAt
            ? Date.now() - this.lastEventReceivedAt
            : undefined;

        const hasSeenAllEoses = this.eosesSeen.size === this.relayFilters?.size;
        const queryFilled = queryFullyFilled(this);

        if (queryFilled) {
            this.emit("eose");
            this.eoseDebug(`Query fully filled`);

            if (this.opts?.closeOnEose) {
                this.stop();
            } else {
                // this.debug(`not running stop`);
            }
        } else if (hasSeenAllEoses) {
            this.emit("eose");
            this.eoseDebug(`All EOSEs seen`);

            if (this.opts?.closeOnEose) {
                // this.eoseDebug(`closing on eose`, this.opts);
                this.stop();
            } else {
                // this.eoseDebug(`doesn't need to close on eose`, this.opts);
            }
        } else {
            let timeToWaitForNextEose = 1000;

            // Reduce the number of ms to wait based on the percentage of relays
            // that have already sent an EOSE, the more
            // relays that have sent an EOSE, the less time we should wait
            // for the next one
            const percentageOfRelaysThatHaveSentEose =
                this.eosesSeen.size / this.relayFilters!.size;

            // If less than 2 and 50% of relays have EOSEd don't add a timeout yet
            if (this.eosesSeen.size >= 2 && percentageOfRelaysThatHaveSentEose >= 0.5) {
                timeToWaitForNextEose =
                    timeToWaitForNextEose * (1 - percentageOfRelaysThatHaveSentEose);

                if (this.eoseTimeout) {
                    clearTimeout(this.eoseTimeout);
                }

                const sendEoseTimeout = () => {
                    lastEventSeen = this.lastEventReceivedAt
                        ? Date.now() - this.lastEventReceivedAt
                        : undefined;

                    // If we have seen an event in the past 20ms don't emit an EOSE due to a timeout, events
                    // are still being received
                    if (lastEventSeen !== undefined && lastEventSeen < 20) {
                        this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
                    } else {
                        this.emit("eose");
                        if (this.opts?.closeOnEose) this.stop();
                    }
                };

                this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
            }
        }
    }
}
