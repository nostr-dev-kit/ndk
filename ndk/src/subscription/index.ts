import EventEmitter from "eventemitter3";
import { matchFilter, Sub, nip19 } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";
import { NDKEvent, NDKEventId } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import { NDKRelay, NDKRelayUrl } from "../relay";
import { calculateRelaySetsFromFilters } from "../relay/sets/calculate";
import { NDKRelaySet } from "../relay/sets/index.js";
import { queryFullyFilled } from "./utils.js";
import { NDK } from "../ndk/index.js";
import { NDKPool } from "../relay/pool/index.js";
import { NDKRelayFilters } from "../relay/subscriptions.js";

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
    public relayFilters?: Map<NDKRelayUrl, NDKRelayFilters>;
    public relaySet?: NDKRelaySet;
    public ndk: NDK;
    public relaySubscriptions: Map<NDKRelay, Sub>;
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
     * Events that have been seen by the subscription per relay.
     */
    public eventsPerRelay: Map<NDKRelay, Set<NDKEventId>> = new Map();

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
        this.relaySet = relaySet;
        this.relaySubscriptions = new Map<NDKRelay, Sub>();
        this.debug = ndk.debug.extend(`subscription`);

        // validate that the caller is not expecting a persistent
        // subscription while using an option that will only hit the cache
        if (
            this.opts.cacheUsage === NDKSubscriptionCacheUsage.ONLY_CACHE &&
            !this.opts.closeOnEose
        ) {
            throw new Error(
                "Cannot use cache-only options with a persistent subscription"
            );
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
        this.relaySubscriptions.forEach((sub) => sub.unsub());
        this.relaySubscriptions.clear();
        this.emit("close", this);
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
            this.relayFilters = calculateRelaySetsFromFilters(
                this.ndk,
                this.filters
            );
        } else {
            this.relayFilters = new Map();
            for (const relay of this.relaySet.relays) {
                this.relayFilters.set(relay.url, this.filters);
            }
        }

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
    public eventReceived(
        event: NDKEvent,
        relay: NDKRelay | undefined,
        fromCache = false
    ) {
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
                const timeSinceFirstSeen =
                    Date.now() - (this.eventFirstSeen.get(event.id) || 0);
                relay.scoreSlowerEvent(timeSinceFirstSeen);

                this.emit("event:dup", event, relay, timeSinceFirstSeen, this);

                return;
            }

            if (this.ndk.cacheAdapter) {
                this.ndk.cacheAdapter.setEvent(event, this.filters[0], relay);
            }

            this.eventFirstSeen.set(event.id, Date.now());
        } else {
            this.eventFirstSeen.set(event.id, 0);
        }

        this.emit("event", event, relay, this);
    }

    // EOSE handling
    private eoseTimeout: ReturnType<typeof setTimeout> | undefined;

    public eoseReceived(relay: NDKRelay): void {
        if (this.opts?.closeOnEose) {
            this.relaySubscriptions.get(relay)?.unsub();
            this.relaySubscriptions.delete(relay);

            // if this was the last relay that needed to EOSE, emit that this subscription is closed
            if (this.relaySubscriptions.size === 0) {
                this.emit("close", this);
            }
        }

        this.eosesSeen.add(relay);

        const hasSeenAllEoses = this.eosesSeen.size === this.relayFilters?.size;

        if (hasSeenAllEoses) {
            this.emit("eose");
        } else {
            if (this.eoseTimeout) {
                clearTimeout(this.eoseTimeout);
            }

            this.eoseTimeout = setTimeout(() => {
                this.emit("eose");
            }, 500);
        }
    }
}

/**
 * Creates a valid nostr filter from an event id or a NIP-19 bech32.
 */
export function filterFromId(id: string): NDKFilter {
    let decoded;

    try {
        decoded = nip19.decode(id);

        switch (decoded.type) {
            case "nevent":
                return { ids: [decoded.data.id] };
            case "note":
                return { ids: [decoded.data] };
            case "naddr":
                return {
                    authors: [decoded.data.pubkey],
                    "#d": [decoded.data.identifier],
                    kinds: [decoded.data.kind],
                };
        }
    } catch (e) {}

    return { ids: [id] };
}

/**
 * Returns the specified relays from a NIP-19 bech32.
 *
 * @param bech32 The NIP-19 bech32.
 */
export function relaysFromBech32(bech32: string): NDKRelay[] {
    try {
        const decoded = nip19.decode(bech32);

        if (["naddr", "nevent"].includes(decoded?.type)) {
            const data = decoded.data as unknown as EventPointer;

            if (data?.relays) {
                return data.relays.map((r: string) => new NDKRelay(r));
            }
        }
    } catch (e) {
        /* empty */
    }

    return [];
}

