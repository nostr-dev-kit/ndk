import EventEmitter from "eventemitter3";
import { matchFilter, Sub, nip19 } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";
import NDKEvent, { NDKEventId } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import NDK from "../index.js";
import { NDKRelay } from "../relay";
import { calculateRelaySetFromFilter } from "../relay/sets/calculate";
import { NDKRelaySet } from "../relay/sets/index.js";
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
    closeOnEose: boolean;
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
}

/**
 * Default subscription options.
 */
export const defaultOpts: NDKSubscriptionOptions = {
    closeOnEose: true,
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
    readonly subId: string;
    readonly filters: NDKFilter[];
    readonly opts: NDKSubscriptionOptions;
    public relaySet?: NDKRelaySet;
    public ndk: NDK;
    public relaySubscriptions: Map<NDKRelay, Sub>;
    private debug: debug.Debugger;

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
        this.opts = { ...defaultOpts, ...(opts || {}) };
        this.filters = filters instanceof Array ? filters : [filters];
        this.subId = subId || opts?.subId || generateFilterId(this.filters[0]);

        this.relaySet = relaySet;
        this.relaySubscriptions = new Map<NDKRelay, Sub>();
        this.debug = ndk.debug.extend(`subscription:${this.subId}`);

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

    /**
     * Calculates the groupable ID for this subscription.
     *
     * @returns The groupable ID, or null if the subscription is not groupable.
     */
    public groupableId(): string | null {
        if (!this.opts?.groupable || this.filters.length > 1) {
            return null;
        }

        const filter = this.filters[0];

        // Check if there is a kind and no time-based filters
        const noTimeConstraints = !filter.since && !filter.until;
        const noLimit = !filter.limit;

        if (noTimeConstraints && noLimit) {
            let id = filter.kinds ? filter.kinds.join(",") : "";
            const keys = Object.keys(filter || {})
                .sort()
                .join("-");
            id += `-${keys}`;

            return id;
        }

        return null;
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
            this.opts.closeOnEose &&
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
            this.startWithRelaySet();
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

    private async startWithCache(): Promise<void> {
        if (this.ndk.cacheAdapter?.query) {
            const promise = this.ndk.cacheAdapter.query(this);

            if (this.ndk.cacheAdapter.locking) {
                await promise;
            }
        }
    }

    private startWithRelaySet(): void {
        if (!this.relaySet) {
            this.relaySet = calculateRelaySetFromFilter(
                this.ndk,
                this.filters[0]
            );
        }

        if (this.relaySet) {
            this.relaySet.subscribe(this);
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

            this.eventFirstSeen.set(`${event.id}`, Date.now());
        } else {
            this.eventFirstSeen.set(`${event.id}`, 0);
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

        const hasSeenAllEoses = this.eosesSeen.size === this.relaySet?.size();

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
 * Represents a group of subscriptions.
 *
 * Events emitted from the group will be emitted from each subscription.
 */
export class NDKSubscriptionGroup extends NDKSubscription {
    private subscriptions: NDKSubscription[];

    constructor(ndk: NDK, subscriptions: NDKSubscription[]) {
        const debug = ndk.debug.extend("subscription-group");

        const filters = mergeFilters(subscriptions.map((s) => s.filters[0]));

        super(
            ndk,
            filters,
            subscriptions[0].opts, // TODO: This should be merged
            subscriptions[0].relaySet // TODO: This should be merged
        );

        this.subscriptions = subscriptions;

        debug("merged filters", {
            count: subscriptions.length,
            mergedFilters: this.filters[0],
        });

        // forward events to the matching subscriptions
        this.on("event", this.forwardEvent);
        this.on("event:dup", this.forwardEventDup);
        this.on("eose", this.forwardEose);
        this.on("close", this.forwardClose);
    }

    private isEventForSubscription(
        event: NDKEvent,
        subscription: NDKSubscription
    ): boolean {
        const { filters } = subscription;

        if (!filters) return false;

        return matchFilter(filters[0], event.rawEvent() as any);

        // check if there is a filter whose key begins with '#'; if there is, check if the event has a tag with the same key on the first position
        // of the tags array of arrays and the same value in the second position
        // for (const key in filter) {
        //     if (key === 'kinds' && filter.kinds!.includes(event.kind!)) return false;
        //     else if (key === 'authors' && filter.authors!.includes(event.pubkey)) return false;
        //     else if (key.startsWith('#')) {
        //         const tagKey = key.slice(1);
        //         const tagValue = filter[key];

        //         if (event.tags) {
        //             for (const tag of event.tags) {
        //                 if (tag[0] === tagKey && tag[1] === tagValue) {
        //                     return false;
        //                 }
        //             }
        //         }
        //     }

        // return true;
    }

    private forwardEvent(event: NDKEvent, relay: NDKRelay) {
        for (const subscription of this.subscriptions) {
            if (!this.isEventForSubscription(event, subscription)) {
                continue;
            }

            subscription.emit("event", event, relay, subscription);
        }
    }

    private forwardEventDup(
        event: NDKEvent,
        relay: NDKRelay,
        timeSinceFirstSeen: number
    ) {
        for (const subscription of this.subscriptions) {
            if (!this.isEventForSubscription(event, subscription)) {
                continue;
            }

            subscription.emit(
                "event:dup",
                event,
                relay,
                timeSinceFirstSeen,
                subscription
            );
        }
    }

    private forwardEose() {
        for (const subscription of this.subscriptions) {
            subscription.emit("eose", subscription);
        }
    }

    private forwardClose() {
        for (const subscription of this.subscriptions) {
            subscription.emit("close", subscription);
        }
    }
}

/**
 * Go through all the passed filters, which should be
 * relatively similar, and merge them.
 */
export function mergeFilters(filters: NDKFilter[]): NDKFilter {
    const result: any = {};

    filters.forEach((filter) => {
        Object.entries(filter).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (result[key] === undefined) {
                    result[key] = [...value];
                } else {
                    result[key] = Array.from(
                        new Set([...result[key], ...value])
                    );
                }
            } else {
                result[key] = value;
            }
        });
    });

    return result as NDKFilter;
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

/**
 * Generates a random filter id, based on the filter keys.
 */
function generateFilterId(filter: NDKFilter) {
    const keys = Object.keys(filter) || [];
    const subId = [];

    for (const key of keys) {
        if (key === "kinds") {
            const v = [key, filter.kinds!.join(",")];
            subId.push(v.join(":"));
        } else {
            subId.push(key);
        }
    }

    subId.push(Math.floor(Math.random() * 999999999).toString());
    return subId.join("-");
}
