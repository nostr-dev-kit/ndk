import { EventEmitter } from "tseep";

import type { NDKEventId, NostrEvent } from "../events/index.js";
import { NDKEvent } from "../events/index.js";
import type { NDKKind } from "../events/kinds/index.js";
import { verifiedSignatures } from "../events/validation.js";
import { wrapEvent } from "../events/wrap.js";
import type { NDK } from "../ndk/index.js";
import type { NDKRelay } from "../relay";
import type { NDKPool } from "../relay/pool/index.js";
import { calculateRelaySetsFromFilters } from "../relay/sets/calculate";
import { NDKRelaySet } from "../relay/sets/index.js";
import { queryFullyFilled } from "./utils.js";

export type NDKSubscriptionInternalId = string;

export type NDKSubscriptionDelayedType = "at-least" | "at-most";

export type NDKFilter<K extends number = NDKKind> = {
    ids?: string[];
    kinds?: K[];
    authors?: string[];
    since?: number;
    until?: number;
    limit?: number;
    search?: string;
    [key: `#${string}`]: string[] | undefined;
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
     * Whether to skip caching events coming from this subscription
     **/
    dontSaveToCache?: boolean;

    /**
     * Groupable subscriptions are created with a slight time
     * delayed to allow similar filters to be grouped together.
     */
    groupable?: boolean;

    /**
     * The delay to use when grouping subscriptions, specified in milliseconds.
     * @default 100
     * @example
     * const sub1 = ndk.subscribe({ kinds: [1], authors: ["alice"] }, { groupableDelay: 100 });
     * const sub2 = ndk.subscribe({ kinds: [0], authors: ["alice"] }, { groupableDelay: 1000 });
     * // sub1 and sub2 will be grouped together and executed 100ms after sub1 was created
     */
    groupableDelay?: number;

    /**
     * Specifies how this delay should be interpreted.
     * "at-least" means "wait at least this long before sending the subscription"
     * "at-most" means "wait at most this long before sending the subscription"
     * @default "at-most"
     * @example
     * const sub1 = ndk.subscribe({ kinds: [1], authors: ["alice"] }, { groupableDelay: 100, groupableDelayType: "at-least" }); // 3 args
     * const sub2 = ndk.subscribe({ kinds: [0], authors: ["alice"] }, { groupableDelay: 1000, groupableDelayType: "at-most" }); // 3 args
     * // sub1 and sub2 will be grouped together and executed 1000ms after sub1 was created
     */
    groupableDelayType?: NDKSubscriptionDelayedType;

    /**
     * The subscription ID to use for the subscription.
     */
    subId?: string;

    /**
     * Pool to use
     */
    pool?: NDKPool;

    /**
     * Skip signature verification
     * @default false
     */
    skipVerification?: boolean;

    /**
     * Skip event validation. Event validation, checks whether received
     * kinds conform to what the expected schema of that kind should look like.rtwle
     * @default false
     */
    skipValidation?: boolean;

    /**
     * Skip emitting on events before they are received from a relay. (skip optimistic publish)
     * @default false
     */
    skipOptimisticPublishEvent?: boolean;

    /**
     * Remove filter constraints when querying the cache.
     *
     * This allows setting more aggressive filters that will be removed when hitting the cache.
     *
     * Useful uses of this include removing `since` or `until` constraints or `limit` filters.
     *
     * @example
     * ndk.subscribe({ kinds: [1], since: 1710000000, limit: 10 }, { cacheUnconstrainFilter: ['since', 'limit'] }); // 3 args
     *
     * This will hit relays with the since and limit constraints, while loading from the cache without them.
     */
    cacheUnconstrainFilter?: (keyof NDKFilter)[];

    /**
     * Whether to wrap events in kind-specific classes when possible.
     * @default false
     */
    wrap?: boolean;

    /**
     * Explicit relay set to use for this subscription instead of calculating it.
     * If `relayUrls` is also provided in the options, this `relaySet` takes precedence.
     * @since 2.13.0 Moved from `ndk.subscribe` parameter to options.
     */
    relaySet?: NDKRelaySet;

    /**
     * Explicit relay URLs to use for this subscription instead of calculating the relay set.
     * An `NDKRelaySet` will be created internally from these URLs.
     * If `relaySet` is also provided in the options, the explicit `relaySet` takes precedence over these URLs.
     * @since 2.13.0
     */
    relayUrls?: string[];

    /**
     * When set, the cache will be queried first, and, when hitting relays,
     * a `since` filter will be added to the subscription that is one second
     * after the last event received from the cache.
     *
     * This option implies cacheUsage: CACHE_FIRST.
     */
    addSinceFromCache?: boolean;
}

/**
 * Default subscription options.
 */
export const defaultOpts: NDKSubscriptionOptions = {
    closeOnEose: false,
    cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST,
    dontSaveToCache: false,
    groupable: true,
    groupableDelay: 100,
    groupableDelayType: "at-most",
    cacheUnconstrainFilter: ["limit", "since", "until"],
};

/**
 * Represents a subscription to an NDK event stream.
 *
 * @emits event
 * Emitted when an event is received by the subscription.
 * * ({NDKEvent} event - The event received by the subscription,
 * * {NDKRelay} relay - The relay that received the event,
 * * {NDKSubscription} subscription - The subscription that received the event.)
 *
 * @emits event:dup
 * Emitted when a duplicate event is received by the subscription.
 * * {NDKEvent} event - The duplicate event received by the subscription.
 * * {NDKRelay} relay - The relay that received the event.
 * * {number} timeSinceFirstSeen - The time elapsed since the first time the event was seen.
 * * {NDKSubscription} subscription - The subscription that received the event.
 *
 * @emits cacheEose - Emitted when the cache adapter has reached the end of the events it had.
 *
 * @emits eose - Emitted when all relays have reached the end of the event stream.
 * * {NDKSubscription} subscription - The subscription that received EOSE.
 *
 * @emits close - Emitted when the subscription is closed.
 * * {NDKSubscription} subscription - The subscription that was closed.
 *
 * @example
 * const sub = ndk.subscribe({ kinds: [1] }); // Get all kind:1s
 * sub.on("event", (event) => console.log(event.content); // Show the content
 * sub.on("eose", () => console.log("All relays have reached the end of the event stream"));
 * sub.on("close", () => console.log("Subscription closed"));
 * setTimeout(() => sub.stop(), 10000); // Stop the subscription after 10 seconds
 *
 * @description
 * Subscriptions are created using {@link NDK.subscribe}.
 *
 * # Event validation
 * By defaults, subscriptions will validate events to comply with the minimal requirement
 * of each known NIP.
 * This can be disabled by setting the `skipValidation` option to `true`.
 *
 * @example
 * const sub = ndk.subscribe({ kinds: [1] }, { skipValidation: false });
 * sub.on("event", (event) => console.log(event.content); // Only valid events will be received
 */
export class NDKSubscription extends EventEmitter<{
    cacheEose: () => void;
    eose: (sub: NDKSubscription) => void;
    close: (sub: NDKSubscription) => void;

    /**
     * Emitted when a duplicate event is received by the subscription.
     * @param event - The duplicate event received by the subscription.
     * @param relay - The relay that received the event.
     * @param timeSinceFirstSeen - The time elapsed since the first time the event was seen.
     * @param sub - The subscription that received the event.
     */
    "event:dup": (
        event: NDKEvent | NostrEvent,
        relay: NDKRelay | undefined,
        timeSinceFirstSeen: number,
        sub: NDKSubscription,
        fromCache: boolean,
        optimisticPublish: boolean,
    ) => void;

    /**
     * Emitted when an event is received by the subscription.
     * @param event - The event received by the subscription.
     * @param relay - The relay that received the event.
     * @param sub - The subscription that received the event.
     * @param fromCache - Whether the event was received from the cache.
     * @param optimisticPublish - Whether the event was received from an optimistic publish.
     */
    event: (
        event: NDKEvent,
        relay: NDKRelay | undefined,
        sub: NDKSubscription,
        fromCache: boolean,
        optimisticPublish: boolean,
    ) => void;

    /**
     * Emitted when a relay unilaterally closes the subscription.
     * @param relay
     * @param reason
     * @returns
     */
    closed: (relay: NDKRelay, reason: string) => void;
}> {
    readonly subId?: string;
    readonly filters: NDKFilter[];
    readonly opts: NDKSubscriptionOptions;
    readonly pool: NDKPool;
    readonly skipVerification: boolean = false;
    readonly skipValidation: boolean = false;

    /**
     * Tracks the filters as they are executed on each relay
     */
    public relayFilters?: Map<WebSocket["url"], NDKFilter[]>;
    public relaySet?: NDKRelaySet;
    public ndk: NDK;
    public debug: debug.Debugger;

    /**
     * Events that have been seen by the subscription, with the time they were first seen.
     */
    public eventFirstSeen = new Map<NDKEventId, number>();

    /**
     * Relays that have sent an EOSE.
     */
    public eosesSeen = new Set<NDKRelay>();

    /**
     * The time the last event was received by the subscription.
     * This is used to calculate when EOSE should be emitted.
     */
    private lastEventReceivedAt: number | undefined;

    /**
     * The most recent event timestamp from cache results.
     * This is used for addSinceFromCache functionality.
     */
    private mostRecentCacheEventTimestamp?: number;

    public internalId: NDKSubscriptionInternalId;

    /**
     * Whether the subscription should close when all relays have reached the end of the event stream.
     */
    public closeOnEose: boolean;

    /**
     * Pool monitor callback
     */
    private poolMonitor: ((relay: NDKRelay) => void) | undefined;

    public skipOptimisticPublishEvent = false;

    /**
     * Filters to remove when querying the cache.
     */
    public cacheUnconstrainFilter?: Array<keyof NDKFilter>;

    public constructor(ndk: NDK, filters: NDKFilter | NDKFilter[], opts?: NDKSubscriptionOptions, subId?: string) {
        super();
        this.ndk = ndk;
        this.opts = { ...defaultOpts, ...(opts || {}) };
        this.pool = this.opts.pool || ndk.pool;
        this.filters = Array.isArray(filters) ? filters : [filters];
        this.subId = subId || this.opts.subId;
        this.internalId = Math.random().toString(36).substring(7);
        this.debug = ndk.debug.extend(`subscription[${this.opts.subId ?? this.internalId}]`);

        // Handle relaySet and relayUrls options
        if (this.opts.relaySet) {
            this.relaySet = this.opts.relaySet;
        } else if (this.opts.relayUrls) {
            this.relaySet = NDKRelaySet.fromRelayUrls(this.opts.relayUrls, this.ndk);
        }

        this.skipVerification = this.opts.skipVerification || false;
        this.skipValidation = this.opts.skipValidation || false;
        this.closeOnEose = this.opts.closeOnEose || false;
        this.skipOptimisticPublishEvent = this.opts.skipOptimisticPublishEvent || false;
        this.cacheUnconstrainFilter = this.opts.cacheUnconstrainFilter;
    }

    /**
     * Returns the relays that have not yet sent an EOSE.
     */
    public relaysMissingEose(): WebSocket["url"][] {
        if (!this.relayFilters) return [];

        const relaysMissingEose = Array.from(this.relayFilters?.keys()).filter(
            (url) => !this.eosesSeen.has(this.pool.getRelay(url, false, false)),
        );

        return relaysMissingEose;
    }

    /**
     * Provides access to the first filter of the subscription for
     * backwards compatibility.
     */
    get filter(): NDKFilter {
        return this.filters[0];
    }

    get groupableDelay(): number | undefined {
        if (!this.isGroupable()) return undefined;
        return this.opts?.groupableDelay;
    }

    get groupableDelayType(): NDKSubscriptionDelayedType {
        return this.opts?.groupableDelayType || "at-most";
    }

    public isGroupable(): boolean {
        return this.opts?.groupable || false;
    }

    private shouldQueryCache(): boolean {
        if (this.opts.addSinceFromCache) return true;

        // explicitly told to not query the cache
        if (this.opts?.cacheUsage === NDKSubscriptionCacheUsage.ONLY_RELAY) return false;

        const hasNonEphemeralKind = this.filters.some((f) => f.kinds?.some((k) => kindIsEphemeral(k)));
        if (hasNonEphemeralKind) return true;

        return true;
    }

    private shouldQueryRelays(): boolean {
        return this.opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY_CACHE;
    }

    private shouldWaitForCache(): boolean {
        if (this.opts.addSinceFromCache) return true;

        return (
            // Must want to close on EOSE; subscriptions
            // that want to receive further updates must
            // always hit the relay
            !!this.opts.closeOnEose &&
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
     *
     * @param emitCachedEvents - Whether to emit events coming from a synchronous cache
     *
     * When using a synchronous cache, the events will be returned immediately
     * by this function. If you will use those returned events, you should
     * set emitCachedEvents to false to prevent seeing them as duplicate events.
     */
    public start(emitCachedEvents = true): NDKEvent[] | null {
        let cacheResult: NDKEvent[] | Promise<NDKEvent[]>;

        const updateStateFromCacheResults = (events: NDKEvent[]) => {
            if (emitCachedEvents) {
                for (const event of events) {
                    if (!this.mostRecentCacheEventTimestamp || event.created_at > this.mostRecentCacheEventTimestamp) {
                        this.mostRecentCacheEventTimestamp = event.created_at;
                    }
                    this.eventReceived(event, undefined, true, false);
                }
            } else {
                cacheResult = [];
                for (const event of events) {
                    if (!this.mostRecentCacheEventTimestamp || event.created_at > this.mostRecentCacheEventTimestamp) {
                        this.mostRecentCacheEventTimestamp = event.created_at;
                    }

                    event.ndk = this.ndk;
                    const e = this.opts.wrap ? wrapEvent(event) : event;
                    if (!e) break;
                    if (e instanceof Promise) {
                        // if we get a promise, we emit it
                        e.then((wrappedEvent) => {
                            this.emitEvent(false, wrappedEvent, undefined, true, false);
                        });
                        break;
                    }
                    this.eventFirstSeen.set(e.id, Date.now());
                    (cacheResult as NDKEvent[]).push(e);
                }
            }
        };

        const loadFromRelays = () => {
            if (this.shouldQueryRelays()) {
                this.startWithRelays();
                this.startPoolMonitor();
            } else {
                this.emit("eose", this);
            }
        };

        if (this.shouldQueryCache()) {
            cacheResult = this.startWithCache();

            if (cacheResult instanceof Promise) {
                // The cache is asynchronous
                if (this.shouldWaitForCache()) {
                    // If we need to wait for it
                    cacheResult.then((events) => {
                        // load the results into the subscription state
                        updateStateFromCacheResults(events);
                        // if the cache has a hit, return early
                        if (queryFullyFilled(this)) {
                            this.emit("eose", this);
                            return;
                        }
                        loadFromRelays();
                    });
                    return null;
                }
                cacheResult.then((events) => {
                    updateStateFromCacheResults(events);
                });

                loadFromRelays();

                return null;
            }
            updateStateFromCacheResults(cacheResult);

            if (queryFullyFilled(this)) {
                this.emit("eose", this);
            } else {
                loadFromRelays();
            }

            return cacheResult;
        }
        loadFromRelays();
        return null;
    }

    /**
     * We want to monitor for new relays that are coming online, in case
     * they should be part of this subscription.
     */
    private startPoolMonitor(): void {
        const _d = this.debug.extend("pool-monitor");

        this.poolMonitor = (relay: NDKRelay) => {
            // check if the pool monitor is already in the relayFilters
            if (this.relayFilters?.has(relay.url)) return;

            const calc = calculateRelaySetsFromFilters(this.ndk, this.filters, this.pool);

            // check if the new relay is included
            if (calc.get(relay.url)) {
                // add it to the relayFilters
                this.relayFilters?.set(relay.url, this.filters);

                // d("New relay connected -- adding to subscription", relay.url);
                relay.subscribe(this, this.filters);
            }
        };

        this.pool.on("relay:connect", this.poolMonitor);
    }

    public onStopped?: () => void;

    public stop(): void {
        this.emit("close", this);
        this.poolMonitor && this.pool.off("relay:connect", this.poolMonitor);
        this.onStopped?.();
    }

    /**
     * @returns Whether the subscription has an authors filter.
     */
    public hasAuthorsFilter(): boolean {
        return this.filters.some((f) => f.authors?.length);
    }

    private startWithCache(): NDKEvent[] | Promise<NDKEvent[]> {
        if (this.ndk.cacheAdapter?.query) {
            return this.ndk.cacheAdapter.query(this);
        }
        return [];
    }

    /**
     * Find available relays that should be part of this subscription and execute in them.
     *
     * Note that this is executed in addition to using the pool monitor, so even if the relay set
     * that is computed (i.e. we don't have any relays available), when relays come online, we will
     * check if we need to execute in them.
     */
    private startWithRelays(): void {
        // Create a copy of filters to potentially modify for addSinceFromCache
        let filters = this.filters;

        // If addSinceFromCache is enabled and we have a timestamp from cache results,
        // modify the filters to add a 'since' filter that's one second after the most recent event
        if (this.opts.addSinceFromCache && this.mostRecentCacheEventTimestamp) {
            const sinceTimestamp = this.mostRecentCacheEventTimestamp + 1;
            filters = filters.map((filter) => ({
                ...filter,
                since: Math.max(filter.since || 0, sinceTimestamp),
            }));
        }

        if (!this.relaySet || this.relaySet.relays.size === 0) {
            this.relayFilters = calculateRelaySetsFromFilters(this.ndk, filters, this.pool);
        } else {
            this.relayFilters = new Map();
            for (const relay of this.relaySet.relays) {
                this.relayFilters.set(relay.url, filters);
            }
        }

        // iterate through the this.relayFilters
        for (const [relayUrl, filters] of this.relayFilters) {
            const relay = this.pool.getRelay(relayUrl, true, true, filters);
            relay.subscribe(this, filters);
        }
    }

    // EVENT handling

    /**
     * Called when an event is received from a relay or the cache
     * @param event
     * @param relay
     * @param fromCache Whether the event was received from the cache
     * @param optimisticPublish Whether this event is coming from an optimistic publish
     */
    public eventReceived(
        event: NDKEvent | NostrEvent,
        relay: NDKRelay | undefined,
        fromCache = false,
        optimisticPublish = false,
    ) {
        const eventId = event.id! as NDKEventId;

        const eventAlreadySeen = this.eventFirstSeen.has(eventId);
        let ndkEvent: NDKEvent;

        if (event instanceof NDKEvent) ndkEvent = event;

        if (!eventAlreadySeen) {
            // generate the ndkEvent
            ndkEvent ??= new NDKEvent(this.ndk, event);
            ndkEvent.ndk = this.ndk;
            ndkEvent.relay = relay;

            // we don't want to validate/verify events that are either
            // coming from the cache or have been published by us from within
            // the client
            if (!fromCache && !optimisticPublish) {
                // validate it
                if (!this.skipValidation) {
                    if (!ndkEvent.isValid) {
                        this.debug("Event failed validation %s from relay %s", eventId, relay?.url);
                        return;
                    }
                }

                // verify it
                if (relay) {
                    // Check if we need to verify this event based on sampling
                    const shouldVerify = relay.shouldValidateEvent();

                    if (shouldVerify && !this.skipVerification) {
                        // Set the relay on the event for async verification
                        ndkEvent.relay = relay;

                        // Attempt verification
                        if (!this.ndk.asyncSigVerification) {
                            if (!ndkEvent.verifySignature(true)) {
                                this.debug("Event failed signature validation", event);
                                // Report the invalid signature with relay information through the centralized method
                                this.ndk.reportInvalidSignature(ndkEvent, relay);
                                return;
                            }

                            // Track successful validation
                            relay.addValidatedEvent();
                        }
                    } else {
                        // We skipped verification for this event
                        relay.addNonValidatedEvent();
                    }
                }

                if (this.ndk.cacheAdapter && !this.opts.dontSaveToCache) {
                    this.ndk.cacheAdapter.setEvent(ndkEvent, this.filters, relay);
                }
            }

            // emit it
            if (!optimisticPublish || this.skipOptimisticPublishEvent !== true) {
                this.emitEvent(this.opts?.wrap ?? false, ndkEvent, relay, fromCache, optimisticPublish);
                // mark the eventId as seen
                this.eventFirstSeen.set(eventId, Date.now());
            }
        } else {
            const timeSinceFirstSeen = Date.now() - (this.eventFirstSeen.get(eventId) || 0);
            this.emit("event:dup", event, relay, timeSinceFirstSeen, this, fromCache, optimisticPublish);

            if (relay) {
                // Check if we've already verified this event id's signature
                const signature = verifiedSignatures.get(eventId);
                if (signature && typeof signature === "string") {
                    // If signatures match, we count it as validated
                    if (event.sig === signature) {
                        relay.addValidatedEvent();
                    } else {
                        // Signatures don't match - this is a malicious relay!
                        // One invalid signature means the relay is considered evil
                        const eventToReport = event instanceof NDKEvent ? event : new NDKEvent(this.ndk, event);
                        this.ndk.reportInvalidSignature(eventToReport, relay);
                    }
                }
            }
        }

        this.lastEventReceivedAt = Date.now();
    }

    /**
     * Optionally wraps, sync or async, and emits the event (if one comes back from the wrapper)
     */
    private emitEvent(
        wrap: boolean,
        evt: NDKEvent,
        relay: NDKRelay | undefined,
        fromCache: boolean,
        optimisticPublish: boolean,
    ) {
        const wrapped = wrap ? wrapEvent(evt) : evt;
        if (wrapped instanceof Promise) {
            wrapped.then((e) => this.emitEvent(false, e, relay, fromCache, optimisticPublish));
        } else if (wrapped) {
            this.emit("event", wrapped, relay, this, fromCache, optimisticPublish);
        }
    }

    public closedReceived(relay: NDKRelay, reason: string): void {
        this.emit("closed", relay, reason);
    }

    // EOSE handling
    private eoseTimeout: ReturnType<typeof setTimeout> | undefined;
    private eosed = false;

    public eoseReceived(relay: NDKRelay): void {
        this.debug("EOSE received from %s", relay.url);
        this.eosesSeen.add(relay);

        let lastEventSeen = this.lastEventReceivedAt ? Date.now() - this.lastEventReceivedAt : undefined;

        const hasSeenAllEoses = this.eosesSeen.size === this.relayFilters?.size;
        const queryFilled = queryFullyFilled(this);

        const performEose = (reason: string) => {
            this.debug("Performing EOSE: %s %d", reason, this.eosed);
            if (this.eosed) return;
            if (this.eoseTimeout) clearTimeout(this.eoseTimeout);
            this.emit("eose", this);
            this.eosed = true;

            if (this.opts?.closeOnEose) this.stop();
        };

        if (queryFilled || hasSeenAllEoses) {
            performEose("query filled or seen all");
        } else if (this.relayFilters) {
            let timeToWaitForNextEose = 1000;

            const connectedRelays = new Set(this.pool.connectedRelays().map((r) => r.url));

            const connectedRelaysWithFilters = Array.from(this.relayFilters.keys()).filter((url) =>
                connectedRelays.has(url),
            );

            // if we have no connected relays, wait for all relays to connect
            if (connectedRelaysWithFilters.length === 0) {
                this.debug(
                    "No connected relays, waiting for all relays to connect",
                    Array.from(this.relayFilters.keys()).join(", "),
                );
                return;
            }

            // Reduce the number of ms to wait based on the percentage of relays
            // that have already sent an EOSE, the more
            // relays that have sent an EOSE, the less time we should wait
            // for the next one
            const percentageOfRelaysThatHaveSentEose = this.eosesSeen.size / connectedRelaysWithFilters.length;

            this.debug("Percentage of relays that have sent EOSE", {
                subId: this.subId,
                percentageOfRelaysThatHaveSentEose,
                seen: this.eosesSeen.size,
                total: connectedRelaysWithFilters.length,
            });

            // If less than 2 and 50% of relays have EOSEd don't add a timeout yet
            if (this.eosesSeen.size >= 2 && percentageOfRelaysThatHaveSentEose >= 0.5) {
                timeToWaitForNextEose = timeToWaitForNextEose * (1 - percentageOfRelaysThatHaveSentEose);

                if (timeToWaitForNextEose === 0) {
                    performEose("time to wait was 0");
                    return;
                }

                if (this.eoseTimeout) clearTimeout(this.eoseTimeout);

                const sendEoseTimeout = () => {
                    lastEventSeen = this.lastEventReceivedAt ? Date.now() - this.lastEventReceivedAt : undefined;

                    // If we have seen an event in the past 20ms don't emit an EOSE due to a timeout, events
                    // are still being received
                    if (lastEventSeen !== undefined && lastEventSeen < 20) {
                        this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
                    } else {
                        performEose(`send eose timeout: ${timeToWaitForNextEose}`);
                    }
                };

                this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
            }
        }
    }
}

const kindIsEphemeral = (kind: NDKKind) => kind >= 20000 && kind < 30000;
