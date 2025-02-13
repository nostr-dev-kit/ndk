import '@bacons/text-decoder/install';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { NDKEvent, NDKFilter, NDKRelaySet, NDKSubscription, NDKSubscriptionOptions, wrapEvent } from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNDK } from './ndk.js';
import { useNDKSession } from '../stores/session/index.js';

/**
 * Extends NDKEvent with a 'from' method to wrap events with a kind-specific handler
 */
export type NDKEventWithFrom<T extends NDKEvent> = T & { from: (event: NDKEvent) => T };
export type NDKEventWithAsyncFrom<T extends NDKEvent> = T & { from: (event: NDKEvent) => Promise<T> };

export type UseSubscribeOptions = NDKSubscriptionOptions & {
    /**
     * Whether to wrap the event with the kind-specific class when possible
     */
    wrap?: boolean;

    /**
     * Whether to include muted events
     */
    includeMuted?: boolean;

    /**
     * Whether to include deleted events
     */
    includeDeleted?: boolean;

    /**
     * Whether to filter with WoT.
     */
    wot?: boolean;

    /**
     * Buffer time in ms, false to disable buffering
     */
    bufferMs?: number | false;

    /**
     * Optional relay URLs to connect to
     */
    relays?: string[];
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
        let timeout: any | null = null;

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
 * @param filters - Filters to run or false to avoid running the subscription. Note that when setting the filters to false, changing the filters prop
 *                  to have a different value will run the subscription, but changing the filters won't.
 * @param opts - UseSubscribeOptions
 * @param dependencies - any[] - dependencies to re-run the subscription when they change
 * @returns {Object} Subscription state
 * @returns {T[]} events - Array of received events
 * @returns {boolean} eose - End of stored events flag
 * @returns {boolean} isSubscribed - Subscription status
 */

export const useSubscribe = <T extends NDKEvent>(
    filters: NDKFilter[] | false,
    opts: UseSubscribeOptions = {},
    dependencies: any[] = []
) => {
    dependencies.push(!!filters);
    
    const { ndk } = useNDK();
    const store = useMemo(() => createSubscribeStore<T>(opts?.bufferMs), dependencies);
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
        if (ndk && opts.relays && opts.relays.length > 0) {
            return NDKRelaySet.fromRelayUrls(opts.relays, ndk);
        }
        return undefined;
    }, [ndk, opts.relays]);

    const isMutedEvent = useMuteFilter();

    useEffect(() => {
        // go through the events and remove any that are from muted pubkeys
        storeInstance.events.forEach((event) => {
            if (isMutedEvent(event)) {
                storeInstance.removeEventId(event.id);
            }
        });
    }, [ isMutedEvent ])

    const handleEvent = useCallback(
        (event: NDKEvent) => {
            const id = event.tagId();

            // if it's from a muted pubkey, we don't accept it
            if (opts?.includeMuted !== true && isMutedEvent(event)) return false;

            if (opts?.includeDeleted !== true && event.isParamReplaceable() && event.hasTag('deleted')) {
                // We mark the event but we don't add the actual event, since
                // it has been deleted
                eventIds.current.set(id, event.created_at!);

                return;
            }

            // If we need to convert the event, we do so
            if (opts?.wrap) event = wrapEvent<T>(event);

            event.once("deleted", () => {
                storeInstance.removeEventId(id);
            });

            // If conversion failed, we bail
            if (!event) return;

            storeInstance.addEvent(event as T);
            eventIds.current.set(id, event.created_at!);
        },
        [isMutedEvent, ...dependencies]
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
    }, [ndk, ...dependencies]);

    return {
        events: storeInstance.events,
        eose: storeInstance.eose,
        isSubscribed: storeInstance.isSubscribed,
        subscription: storeInstance.subscriptionRef,
    };
};


/**
 * Provides a function that filters events, according to the user's mute list.
 */
export function useMuteFilter() {
    const mutedPubkeys = useNDKSession(s => s.mutedPubkeys);
    const mutedHashtags = useNDKSession(s => s.mutedHashtags);
    const mutedWords = useNDKSession(s => s.mutedWords);
    const mutedEventIds = useNDKSession(s => s.mutedEventIds);

    const isMutedEvent = useMemo(() => {
        const mutedWordsRegex = mutedWords.size > 0 ? new RegExp(Array.from(mutedWords).join('|'), 'i') : null;
        const _mutedHashtags = new Set<string>();
        mutedHashtags.forEach(h => _mutedHashtags.add(h.toLowerCase()));

        return (event: NDKEvent) => {
            const tags = new Set(event.getMatchingTags('t').map(tag => tag[1].toLowerCase()));
            const taggedEvents = new Set(event.getMatchingTags('e').map(tag => tag[1]));
            taggedEvents.add(event.id);
            const hasMutedHashtag = setHasAnyIntersection(_mutedHashtags, tags);
            let res = false;

            if (
                hasMutedHashtag ||
                mutedPubkeys.has(event.pubkey) ||
                (mutedWordsRegex && event.content.match(mutedWordsRegex))
            ) res = true;

            if (!res && setHasAnyIntersection(mutedEventIds, taggedEvents)) {
                res = true;
            }
            
            return res;
        }
    }, [mutedPubkeys, mutedHashtags, mutedWords, mutedEventIds]);

    return isMutedEvent;
}

const setHasAnyIntersection = (set1: Set<string>, set2: Set<string>) => {
    for (const item of set1) {
        if (set2.has(item)) return true;
    }
    return false;
}