import '@bacons/text-decoder/install';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import NDK, { NDKEvent, NDKFilter, NDKKind, NDKRelaySet, NDKSubscription, NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNDK } from './ndk';
import { useNDKSessionStore } from '../stores/session';

/**
 * Extends NDKEvent with a 'from' method to wrap events with a kind-specific handler
 */
export type NDKEventWithFrom<T extends NDKEvent> = T & { from: (event: NDKEvent) => T };

/**
 * Parameters for the useSubscribe hook
 * @interface UseSubscribeParams
 * @property {NDKFilter[] | null} filters - Nostr filters to subscribe to
 * @property {Object} [opts] - Subscription options
 * @property {NDKEventWithFrom<any>} [opts.klass] - Class to convert events to
 * @property {boolean} [opts.includeMuted] - Whether to include muted events
 * @property {boolean} [opts.includeDeleted] - Whether to include deleted events
 * @property {boolean} [opts.wot] - Whether to filter with WoT.
 * @property {number | false} [opts.bufferMs] - Buffer time in ms, false to disable
 * @property {string[]} [relays] - Optional relay URLs to connect to
 */
interface UseSubscribeParams {
    filters: NDKFilter[] | null;
    opts?: NDKSubscriptionOptions & {
        klass?: NDKEventWithFrom<any>;
        includeMuted?: boolean;
        includeDeleted?: boolean;
        wot?: boolean;
        bufferMs?: number | false;
    };
    relays?: readonly string[];
}

/**
 * Store interface for managing subscription state
 * @interface SubscribeStore
 * @property {T[]} events - Array of received events
 * @property {Map<string, T>} eventMap - Map of events by ID
 * @property {boolean} eose - End of stored events flag
 * @property {boolean} isSubscribed - Subscription status
 */
interface SubscribeStore<T> {
    events: T[];
    eventMap: Map<string, T>;
    eose: boolean;
    isSubscribed: boolean;
    addEvent: (event: T) => void;
    removeEventId: (id: string) => void;
    setEose: () => void;
    reset: () => void;
    setSubscription: (sub: NDKSubscription | undefined) => void;
    subscriptionRef: NDKSubscription | undefined;
}

let arrayFrom = 0;

/**
 * Creates a store to manage subscription state with optional event buffering
 * @param bufferMs - Buffer time in milliseconds, false to disable buffering
 */
const createSubscribeStore = <T extends NDKEvent>(bufferMs: number | false = 30) =>
    createStore<SubscribeStore<T>>((set, get) => {
        const buffer: Map<string, T> = new Map();
        let timeout: NodeJS.Timeout | null = null;

        // Function to flush the buffered events to the store
        const flushBuffer = () => {
            set((state) => {
                const { eventMap } = state;
                const start = performance.now();
                buffer.forEach((event) => {
                    const tagId = event.tagId();
                    const currentEvent = eventMap.get(tagId);
                    if (currentEvent && currentEvent.created_at! >= event.created_at!) return;
                    eventMap.set(tagId, event);
                });
                const events = Array.from(eventMap.values());
                const end = performance.now();
                arrayFrom += end - start;
                buffer.clear();
                return { eventMap, events };
            });
            timeout = null;
        };

        return {
            events: [],
            eventMap: new Map(),
            eose: false,
            isSubscribed: false,
            subscriptionRef: undefined,

            addEvent: (event) => {
                const tagId = event.tagId();
                
                if (bufferMs !== false) {
                    const currentEvent = buffer.get(tagId) || get().eventMap.get(tagId);
                    if (currentEvent && currentEvent.created_at! >= event.created_at!) return;

                    buffer.set(tagId, event);

                    if (!timeout) {
                        timeout = setTimeout(flushBuffer, bufferMs);
                    }
                } else {
                    // Direct update logic when buffering is disabled
                    set((state) => {
                        const { eventMap } = state;
                        const currentEvent = eventMap.get(tagId);
                        if (currentEvent && currentEvent.created_at! >= event.created_at!) return state;

                        eventMap.set(tagId, event);
                        const events = Array.from(eventMap.values());
                        return { eventMap, events };
                    });
                }
            },

            removeEventId: (id) => {
                set((state) => {
                    state.eventMap.delete(id);
                    const events = Array.from(state.eventMap.values());
                    return { eventMap: state.eventMap, events };
                });
            },

            setEose: () => {
                if (timeout) {
                    clearTimeout(timeout);
                    flushBuffer(); // Ensure any remaining buffered events are flushed immediately
                }
                if (bufferMs !== false) {
                    bufferMs = 16;
                }
                
                set({ eose: true });
            },

            reset: () => {
                buffer.clear();
                set({
                    events: [],
                    eventMap: new Map(),
                    eose: false,
                    isSubscribed: false,
                    subscriptionRef: undefined,
                })
            },
            setSubscription: (sub) => set({ subscriptionRef: sub, isSubscribed: !!sub }),
        };
    });

/**
 * React hook for subscribing to Nostr events
 * @param params - Subscription parameters
 * @returns {Object} Subscription state
 * @returns {T[]} events - Array of received events
 * @returns {boolean} eose - End of stored events flag
 * @returns {boolean} isSubscribed - Subscription status
 */
export const useSubscribe = <T extends NDKEvent>({ filters, opts = undefined, relays = undefined }: UseSubscribeParams) => {
    const { ndk } = useNDK();
    const muteList = useNDKSessionStore(s => s.muteList);
    const store = useMemo(() => createSubscribeStore<T>(opts?.bufferMs), [filters]);
    const storeInstance = useStore(store);

    /**
     * Map of eventIds that have been received by this subscription.
     *
     * Key: event identifier (event.dTag or event.id)
     *
     * Value: timestamp of the event, used to choose the
     * most recent event on replaceable events
     */
    const eventIds = useRef<Map<string, number>>(new Map());

    const relaySet = useMemo(() => {
        if (ndk && relays && relays.length > 0) {
            return NDKRelaySet.fromRelayUrls(relays, ndk);
        }
        return undefined;
    }, [ndk, relays]);

    useEffect(() => {
        // go through the events and remove any that are from muted pubkeys
        storeInstance.events.forEach((event) => {
            if (muteList.has(event.pubkey)) {
                storeInstance.removeEventId(event.id);
            }
        });

    }, [ muteList.size ])

    const handleEvent = useCallback(
        (event: NDKEvent) => {
            const id = event.tagId();

            // if it's from a muted pubkey, we don't accept it
            if (opts?.includeMuted !== true && muteList.has(event.pubkey)) return false;

            if (opts?.includeDeleted !== true && event.isParamReplaceable() && event.hasTag('deleted')) {
                // We mark the event but we don't add the actual event, since
                // it has been deleted
                eventIds.current.set(id, event.created_at!);

                return;
            }

            // If we need to convert the event, we do so
            if (opts?.klass) event = opts.klass.from(event);

            event.once("deleted", () => {
                storeInstance.removeEventId(id);
            });

            // If conversion failed, we bail
            if (!event) return;

            storeInstance.addEvent(event as T);
            eventIds.current.set(id, event.created_at!);
        },
        [opts?.klass, muteList, filters]
    );

    const handleEose = () => {
        storeInstance.setEose();
    };

    const handleClosed = () => {
        storeInstance.setSubscription(undefined);
    };

    useEffect(() => {
        if (!filters || filters.length === 0 || !ndk) return;

        if (storeInstance.subscriptionRef) {
            storeInstance.subscriptionRef.stop();
            storeInstance.setSubscription(undefined);
            storeInstance.reset();
        }

        const subscription = ndk.subscribe(filters, opts, relaySet, false);
        subscription.on('event', handleEvent);
        subscription.on('eose', handleEose);
        subscription.on('closed', handleClosed);

        storeInstance.setSubscription(subscription);
        subscription.start();

        return () => {
            if (storeInstance.subscriptionRef) {
                storeInstance.subscriptionRef.stop();
                storeInstance.setSubscription(undefined);
            }
            eventIds.current.clear();
            storeInstance.reset();
        };
    }, [filters, opts, relaySet, ndk]);

    return {
        events: storeInstance.events,
        eose: storeInstance.eose,
        isSubscribed: storeInstance.isSubscribed,
        subscription: storeInstance.subscriptionRef,
    };
};
