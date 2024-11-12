import NDK, {
    type NDKConstructorParams,
    NDKEvent,
    type NDKFilter,
    NDKKind,
    type NDKRelay,
    type NDKRelaySet,
    NDKRepost,
    type NDKSubscription,
    type NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { type Unsubscriber, type Writable, writable } from "svelte/store";

/**
 * Type for NDKEvent classes that have a static `from` method like NDKHighlight.
 */
type ClassWithConvertFunction<T extends NDKEvent> = {
    from: (event: NDKEvent) => T | undefined;
};

export type ExtendedBaseType<T extends NDKEvent> = T & {
    repostedByEvents?: NDKEvent[];
};

export type NDKEventStore<T extends NDKEvent> = Writable<ExtendedBaseType<T>[]> & {
    id: string;
    filters: NDKFilter[] | undefined;
    refCount: number;
    subscription: NDKSubscription | undefined;
    eosed: boolean;
    skipDeleted: boolean;
    startSubscription: () => void;
    unsubscribe: Unsubscriber;
    onEose: (cb: () => void) => void;
    onEvent: (cb: (event: NDKEvent, relay?: NDKRelay) => void) => void;
    ref: () => number;
    unref: () => number;
    empty: () => void;
    changeFilters: (filters: NDKFilter[]) => void;
};

type NDKSubscribeOptions = NDKSubscriptionOptions & {
    /**
     * Whether the subscription should start when the
     * store is created. Defaults to true.
     */
    autoStart?: boolean;

    /**
     * Reposts filters
     */
    repostsFilters?: NDKFilter[];

    /**
     * Wait this amount of ms before unsubscribing when there are zero refs.
     */
    unrefUnsubscribeTimeout?: number;

    /**
     * Relay set to use for the subscription
     */
    relaySet?: NDKRelaySet;

    /**
     * Whether deleted PRE/addressable-events should be skipped.
     * @default true
     */
    skipDeleted?: boolean;

    /**
     * Callback to be called when the subscription EOSEs
     */
    onEose?: () => void;

    /**
     * Callback to be called when a new event is received
     */
    onEvent?: (event: NDKEvent, relay?: NDKRelay) => void;
};

class NDKSvelte extends NDK {
    constructor(opts?: NDKConstructorParams) {
        super(opts);
    }

    private createEventStore<T extends NDKEvent>(filters?: NDKFilter[]): NDKEventStore<T> {
        const store = writable<T[]>([]) as NDKEventStore<T>;
        return {
            id: Math.random().toString(36).substring(7),
            refCount: 0,
            filters,
            skipDeleted: true,
            subscription: undefined,
            eosed: false,
            set: store.set,
            update: store.update,
            subscribe: store.subscribe,
            unsubscribe: () => {},
            onEose: (cb) => {},
            onEvent: (cb) => {},
            startSubscription: () => {
                throw new Error("not implemented");
            },
            ref: () => {
                throw new Error("not implemented");
            },
            unref: () => {
                throw new Error("not implemented");
            },
            empty: () => {
                throw new Error("not implemented");
            },
            changeFilters: (filters: NDKFilter[]) => {
                throw new Error("not implemented");
            },
        };
    }

    private eventIsRepost(event: NDKEvent): boolean {
        return [NDKKind.Repost, NDKKind.GenericRepost].includes(event.kind!);
    }

    public storeSubscribe<T extends NDKEvent>(
        filters: NDKFilter | NDKFilter[],
        opts?: NDKSubscribeOptions,
        klass?: ClassWithConvertFunction<T>
    ): NDKEventStore<ExtendedBaseType<T>> {
        let events: Map<string, ExtendedBaseType<T>> = new Map();
        const store = this.createEventStore<ExtendedBaseType<T>>(
            Array.isArray(filters) ? filters : [filters]
        );
        const autoStart = opts?.autoStart ?? true;
        const relaySet = opts?.relaySet;
        const skipDeleted = opts?.skipDeleted ?? true;

        /**
         * Tracks the created_at of PRE that have been deleted.
         * If the most recent version of a PRE is deleted, we don't include it in the store when skipDeleted is true.
         */
        const deletedPRETimestamps = new Map<string, number>();

        const getEventArrayFromMap = () => {
            return Array.from(events.values());
        };

        /**
         * Called when a repost event is identified. It either adds the repost event
         * to the existing reposted events or fetches the reposted events and adds
         * them to the store
         * @param event Repost event (kind:6 or kind:16)
         */
        const handleEventReposts = (event: NDKEvent) => {
            const _repostEvent = NDKRepost.from(event);
            _repostEvent.ndk = this;

            const addRepostToExistingEvent = (repostedEvent: ExtendedBaseType<T>) => {
                // If we already have the reposted event, add it to the repost event
                if (repostedEvent.repostedByEvents) {
                    repostedEvent.repostedByEvents.push(event);
                } else {
                    repostedEvent.repostedByEvents = [event];
                }

                store.set(getEventArrayFromMap());
            };

            for (const repostedEventId of _repostEvent.repostedEventIds()) {
                const repostedEvent = events.get(repostedEventId);

                if (repostedEvent) {
                    addRepostToExistingEvent(repostedEvent);
                } else {
                    // If we don't have the reposted event, fetch it and add it to the store
                    _repostEvent
                        .repostedEvents(klass, {
                            subId: "reposted-event-fetch",
                            groupable: true,
                            groupableDelay: 1500,
                            groupableDelayType: "at-least",
                        })
                        .then((fetchedEvents: unknown[]) => {
                            for (const e of fetchedEvents) {
                                if (e instanceof NDKEvent) {
                                    handleEvent(e);
                                }
                            }
                        });
                }
            }
        };

        /**
         *
         * @param event Event to handle
         * @param klass Class to convert the event to
         * @param repostEvent Repost event this event is a repost of
         * @returns
         */
        const handleEvent = (event: NDKEvent) => {
            // if we have a repostFilters and this event is a repost
            if (opts?.repostsFilters && this.eventIsRepost(event)) {
                // Check if we already have the repost event
                handleEventReposts(event);
                return;
            }

            let e = event;
            if (klass) {
                const ev = klass.from(event);
                if (!ev) return;
                e = ev;
                e.relay = event.relay;
            }
            e.ndk = this;

            const dedupKey = event.deduplicationKey();

            if (events.has(dedupKey)) {
                let prevEvent = events.get(dedupKey)!;

                // we received an older version
                if (prevEvent.created_at! > event.created_at!) return;

                // we received the same timestamp
                if (prevEvent.created_at! === event.created_at!) {
                    // with same id
                    if (prevEvent.id === event.id) return;

                    console.warn("Received event with same created_at but different id", {
                        prevId: prevEvent.id,
                        newId: event.id,
                        prev: prevEvent.rawEvent(),
                        new: event.rawEvent(),
                    });
                }
            }

            if (skipDeleted && event.isParamReplaceable()) {
                const currentDeletedTimestamp = deletedPRETimestamps.get(dedupKey);

                // if we already have a newer deletion than this event's, don't do anything
                if (currentDeletedTimestamp && currentDeletedTimestamp > event.created_at!) return;

                const isDeleted = event.hasTag("deleted");
                
                if (isDeleted) {
                    // flag the deletion of this dTag
                    deletedPRETimestamps.set(dedupKey, event.created_at!);
                    return;
                } else {
                    // remove any deletion flag and proceed to adding the event
                    deletedPRETimestamps.delete(dedupKey);
                }
            }

            events.set(dedupKey, e as ExtendedBaseType<T>);

            store.set(getEventArrayFromMap());
        };

        /**
         * Increments the ref count and starts the subscription if it's the first
         */
        store.ref = () => {
            store.refCount++;
            if (store.refCount === 1) {
                store.startSubscription();
            }
            return store.refCount;
        };

        /**
         * Decrements the ref count and unsubscribes if it's the last
         */
        store.unref = () => {
            if (--store.refCount > 0) return store.refCount;

            if (opts?.unrefUnsubscribeTimeout) {
                setTimeout(() => {
                    if (store.refCount === 0) {
                        store.unsubscribe();
                    }
                }, opts.unrefUnsubscribeTimeout!);
            } else {
                store.unsubscribe();
            }

            return store.refCount;
        };

        /**
         * Empties the store and unsubscribes from the relays
         */
        store.empty = () => {
            store.set([]);
            events = new Map();
            store.unsubscribe();
        };

        /**
         * Changes the filters and empties the store
         */
        store.changeFilters = (filters: NDKFilter[]) => {
            store.filters = filters;
            store.empty();

            // only start the subscription if we have a ref
            if (store.refCount > 0) store.startSubscription();
        };

        /**
         * Starts the subscription on the relays
         */
        store.startSubscription = () => {
            if (!store.filters) {
                throw new Error("no filters");
            }

            const filters: NDKFilter[] = store.filters;

            if (opts?.repostsFilters) {
                filters.push(...opts.repostsFilters);
            }

            store.subscription = this.subscribe(filters, opts, relaySet, false);

            store.subscription.on("event", (event: NDKEvent, relay?: NDKRelay) => {
                handleEvent(event);
                if (opts?.onEvent) opts.onEvent(event, relay);
            });

            store.subscription.start();

            store.unsubscribe = () => {
                store.subscription?.stop();
                store.subscription = undefined;
            };

            store.onEose = (cb) => {
                store.subscription?.on("eose", () => {
                    store.eosed = true;
                    cb();
                });
            };

            if (opts?.onEose) {
                store.onEose(opts.onEose);
            }
        };

        if (autoStart) {
            store.startSubscription();
        }

        return store;
    }
}

export default NDKSvelte;
