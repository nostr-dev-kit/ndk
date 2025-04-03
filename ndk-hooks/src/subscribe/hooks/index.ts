// src/subscribe/hooks/index.ts
import type {
    NDKEvent,
    NDKFilter, // Keep as non-type import if used as value
    NDKSubscription,
    NDKSubscriptionOptions
} from '@nostr-dev-kit/ndk';
import { useEffect, useMemo, useRef, type RefObject } from 'react'; // Added RefObject type import
import { useStore } from 'zustand';
import { useUserSession } from '../../session/hooks'; // Corrected path
import {
    createSubscribeStore,
    type MuteCriteria
} from '../../common/store/subscribe'; // Updated path
import { isMuted } from '../../utils/mute'; // Corrected path
import { useNDK } from '../../ndk/hooks'; // Corrected path

/**
 * Extends NDKEvent with a 'from' method to wrap events with a kind-specific handler
 */
export type NDKEventWithFrom<T extends NDKEvent> = T & {
    from: (event: NDKEvent) => T;
};
export type NDKEventWithAsyncFrom<T extends NDKEvent> = T & {
    from: (event: NDKEvent) => Promise<T>;
};

export type UseSubscribeOptions = NDKSubscriptionOptions & {
    /**
     * Whether to wrap the event with the kind-specific class when possible
     */
    wrap?: boolean;

    /**
     * Whether to include deleted events
     */
    includeDeleted?: boolean;

    /**
     * Buffer time in ms, false to disable buffering
     */
    bufferMs?: number | false;

    /**
     * Whether to include events from muted authors (default: false)
     */
    includeMuted?: boolean;

    /**
     * Whether to filter with WoT (Web of Trust). (Implementation TBD)
     */
    wot?: boolean;
};

// Define interface for return type outside the function
interface UseSubscribeResult<T extends NDKEvent> {
    events: T[];
    eose: boolean;
    subscription: NDKSubscription | null;
    storeRef: RefObject<ReturnType<typeof createSubscribeStore<T>> | null>;
}

/**
 * React hook for subscribing to Nostr events
 * @param filters - Filters to run or false to avoid running the subscription. Note that when setting the filters to false, changing the filters prop
 *                  to have a different value will run the subscription, but changing the filters won't.
 * @param opts - UseSubscribeOptions
 * @param dependencies - any[] - dependencies to re-run the subscription when they change
 * @returns {Object} Subscription state
 * @returns {T[]} events - Array of received events
 * @returns {boolean} eose - End of stored events flag
 */
export function useSubscribe<T extends NDKEvent>(
    filters: NDKFilter[] | false,
    opts: UseSubscribeOptions = {},
    dependencies: unknown[] = [] // Changed any[] to unknown[]
) {
    const { ndk } = useNDK();
    const activeSessionData = useUserSession();

    const muteCriteria = useMemo((): MuteCriteria => {
        const pubkeys = activeSessionData?.mutedPubkeys ?? new Set<string>();
        const eventIds = activeSessionData?.mutedEventIds ?? new Set<string>();
        const hashtags = activeSessionData?.mutedHashtags ?? new Set<string>();
        const words = activeSessionData?.mutedWords ?? new Set<string>();

        const wordsRegex =
            words.size > 0
                ? new RegExp(Array.from(words).join('|'), 'i')
                : null;

        const lowerCaseHashtags = new Set<string>();
        for (const h of hashtags) { // Changed forEach to for...of
            lowerCaseHashtags.add(h.toLowerCase());
        }

        return {
            mutedPubkeys: pubkeys,
            mutedEventIds: eventIds,
            mutedHashtags: lowerCaseHashtags,
            mutedWordsRegex: wordsRegex,
        };
    }, [activeSessionData]);
    const storeRef = useRef<ReturnType<typeof createSubscribeStore<T>> | null>(
        null
    );
    if (!storeRef.current) {
        storeRef.current = createSubscribeStore<T>(opts.bufferMs);
    }
    const store = storeRef.current;

    const subRef = useRef<NDKSubscription | null>(null);

    useEffect(() => {
        if (
            !ndk ||
            !filters ||
            (Array.isArray(filters) && filters.length === 0)
        )
            return;

        if (subRef.current) {
            subRef.current.stop();
            subRef.current = null;
        }

        const setupSubscription = () => {
            const currentFilters = filters as NDKFilter[];
            const handleEvent = (event: NDKEvent) => {
                if (!opts.includeDeleted && event.hasTag('deleted')) {
                    return;
                }

                // TODO: Implement WoT filtering if opts.wot is true
                if (!opts.includeMuted && isMuted(event, muteCriteria)) {
                    return;
                }

                event.once('deleted', () => {
                    const state = store.getState();
                    state.removeEventId(event.tagId());
                });

                const state = store.getState();
                state.addEvent(event as T);
            };

            const handleCachedEvents = (events: NDKEvent[]) => {
                if (events && events.length > 0) {
                    const validEvents = events.filter((e: NDKEvent) => {
                        if (!opts.includeDeleted && e.hasTag('deleted'))
                            return false;
                        // TODO: Implement WoT filtering if opts.wot is true
                        if (!opts.includeMuted && isMuted(e, muteCriteria))
                            return false;
                        return true;
                    });

                    if (validEvents.length > 0) {
                        const state = store.getState();
                        state.addEvents(validEvents as T[]);

                        for (const evt of validEvents) {
                            evt.once('deleted', () => {
                                const state = store.getState();
                                state.removeEventId(evt.tagId());
                            });
                        }
                    }
                }
            };

            const handleEose = () => {
                const state = store.getState();
                state.setEose();
            };

            const sub = ndk.subscribe(currentFilters, opts, {
                onEvent: handleEvent,
                onEvents: handleCachedEvents,
                onEose: handleEose,
            });
            subRef.current = sub;
        };

        setupSubscription();

        return () => {
            if (subRef.current) {
                subRef.current.stop();
                subRef.current = null;
            }
        };
    // Added opts to dependency array, removed specific opts.* properties
    }, [
        ndk,
        muteCriteria,
        store,
        opts,
        filters,
        ...dependencies,
    ]);

    useEffect(() => {
        if (!opts.includeMuted) {
            const state = store.getState();
            state.filterMutedEvents(muteCriteria);
        }
    }, [muteCriteria, store, opts.includeMuted]);

    const events = useStore(store, (state) => state.events);
    const eose = useStore(store, (state) => state.eose);
    const subscription = useStore(store, (state) => state.subscriptionRef);

    const returnValue: UseSubscribeResult<T> = {
        events,
        eose,
        subscription: subscription ?? null, // Handle undefined from useStore
        storeRef,
    };

    return returnValue;
}