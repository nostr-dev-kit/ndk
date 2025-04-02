import {
    type NDKEvent,
    type NDKFilter,
    NDKRelaySet,
    NDKSubscription,
    type NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
// import { useNDKCurrentUser } from './ndk'; // Not strictly needed here if only using session data
import { useUserSession } from '../session';
import {
    createSubscribeStore,
    type MuteCriteria,
    type SubscribeStore,
} from '../stores/subscribe';
import { isMuted } from '../utils/mute'; // Import the utility function
import { useNDK } from './ndk';

// Removed duplicated helper function: setHasAnyIntersection
// isMuted is now imported from ../utils/mute.ts

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
    dependencies: any[] = []
) {
    const { ndk } = useNDK();
    // const currentUser = useNDKCurrentUser(); // Not strictly needed if only using session data
    const activeSessionData = useUserSession();

    // Extract and prepare mute criteria from active session for performance
    const muteCriteria = useMemo((): MuteCriteria => {
        const pubkeys = activeSessionData?.mutedPubkeys ?? new Set<string>();
        const eventIds = activeSessionData?.mutedEventIds ?? new Set<string>();
        const hashtags = activeSessionData?.mutedHashtags ?? new Set<string>();
        const words = activeSessionData?.mutedWords ?? new Set<string>();

        // Pre-compile regex for words for performance
        const wordsRegex =
            words.size > 0
                ? new RegExp(Array.from(words).join('|'), 'i')
                : null;

        // Pre-lowercase hashtags for performance
        const lowerCaseHashtags = new Set<string>();
        hashtags.forEach((h) => lowerCaseHashtags.add(h.toLowerCase()));

        return {
            mutedPubkeys: pubkeys,
            mutedEventIds: eventIds,
            mutedHashtags: lowerCaseHashtags,
            mutedWordsRegex: wordsRegex,
        };
    }, [activeSessionData]);
    // Ensure store instance is stable across renders, even with Fast Refresh
    const storeRef = useRef<ReturnType<typeof createSubscribeStore<T>> | null>(
        null
    );
    if (!storeRef.current) {
        // Pass bufferMs directly, assuming opts stability is handled by useEffect deps
        storeRef.current = createSubscribeStore<T>(opts.bufferMs);
    }
    const store = storeRef.current;

    // Reference to subscription - doesn't trigger re-renders when changed
    const subRef = useRef<NDKSubscription | null>(null);

    // Setup subscription only when NDK or deps change
    useEffect(() => {
        // Skip if no NDK or no filters
        if (
            !ndk ||
            !filters ||
            (Array.isArray(filters) && filters.length === 0)
        )
            return;

        // Clean up previous subscription
        if (subRef.current) {
            subRef.current.stop();
            subRef.current = null;
        }

        // Helper function to set up event handlers and start subscription
        const setupSubscription = () => {
            // Create subscription - we know filters is not false here
            // because of the check above, but we need to tell TypeScript
            const currentFilters = filters as NDKFilter[];
            // Define handler for individual events (received after initial cache load if onEvents is used)
            const handleEvent = (event: NDKEvent) => {
                // Renamed back to handleEvent
                // Skip deleted events if includeDeleted is false
                if (!opts.includeDeleted && event.hasTag('deleted')) {
                    return;
                }

                // Skip muted events if includeMuted is false (default)
                // TODO: Implement WoT filtering if opts.wot is true
                if (!opts.includeMuted && isMuted(event, muteCriteria)) {
                    return;
                }

                // Set up deleted event handler
                event.once('deleted', () => {
                    const state = store.getState();
                    state.removeEventId(event.tagId());
                });

                // Add event to store
                const state = store.getState();
                state.addEvent(event as T);
            };

            // Define handler for the initial batch of events from the cache
            const handleCachedEvents = (events: NDKEvent[]) => {
                // Renamed parameter
                if (events && events.length > 0) {
                    // Filter out deleted and muted events if needed from the cached batch
                    const validEvents = events.filter((e: NDKEvent) => {
                        if (!opts.includeDeleted && e.hasTag('deleted'))
                            return false;
                        // TODO: Implement WoT filtering if opts.wot is true
                        if (!opts.includeMuted && isMuted(e, muteCriteria))
                            return false;
                        return true;
                    });

                    if (validEvents.length > 0) {
                        // Add all valid events at once
                        const state = store.getState();
                        state.addEvents(validEvents as T[]);

                        // Set up deleted handlers for each event
                        for (const evt of validEvents) {
                            evt.once('deleted', () => {
                                const state = store.getState();
                                state.removeEventId(evt.tagId());
                            });
                        }
                    }
                }
            };

            // Define handler for EOSE
            const handleEose = () => {
                const state = store.getState();
                state.setEose();
            };

            // Create subscription, passing handlers directly
            const sub = ndk.subscribe(currentFilters, opts, {
                // autoStart object with handlers
                onEvent: handleEvent, // Use the renamed handler
                onEvents: handleCachedEvents,
                onEose: handleEose,
            });
            subRef.current = sub;

            // Old logic removed:
            // - sub.on('event', ...)
            // - sub.on('eose', ...)
            // - sub.start(false)
            // - Processing of `cached` variable
        };

        // Set up subscription
        setupSubscription();

        // Cleanup function
        return () => {
            if (subRef.current) {
                subRef.current.stop();
                // store.getState().setSubscription(undefined); // Removed call
                subRef.current = null;
            }
        };
    }, [
        ndk,
        muteCriteria,
        store,
        opts.includeDeleted,
        opts.includeMuted,
        opts.relaySet,
        opts.relayUrls,
        filters,
        ...dependencies,
    ]); // Updated dependencies

    // Effect to filter existing events when mute list changes
    useEffect(() => {
        // Only filter if includeMuted is false
        if (!opts.includeMuted) {
            const state = store.getState();
            state.filterMutedEvents(muteCriteria);
        }
        // No need to filter if includeMuted is true, as muted events are allowed
    }, [muteCriteria, store, opts.includeMuted]); // Updated dependency

    // Extract store state in a way that doesn't cause unnecessary re-renders
    const events = useStore(store, (state) => state.events);
    const eose = useStore(store, (state) => state.eose);
    // const isSubscribed = useStore(store, (state) => state.isSubscribed); // Removed
    // Note: Returning subscriptionRef directly might cause re-renders if the ref object itself changes,
    // but the underlying subscription might be what consumers need. Consider if a stable selector is better.
    const subscription = useStore(store, (state) => state.subscriptionRef);

    // Expose storeRef for testing purposes if needed
    const returnValue: any = {
        events,
        eose,
        // isSubscribed, // Removed
        subscription, // Keep subscription ref? Or remove too? Let's keep for now.
    };

    // Add storeRef only in test environment (optional, but cleaner)
    // Alternatively, always return it. For simplicity here, always return.
    returnValue.storeRef = storeRef;

    return returnValue;
}

// Removed duplicated helper function: isMuted
// It is now imported from ../utils/mute.ts
