import {
    type NDKEvent,
    type NDKFilter,
    type NDKSubscription,
    NDKSubscriptionCacheUsage,
    type NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNDK } from '../../ndk/hooks'; // Corrected path

/**
 * Subscribes to NDK events based on the provided filters and returns the matching events.
 *
 * This hook is designed for efficiently observing events from the cache.
 * It incorporates several optimizations:
 *
 * - **Cache First:** Prioritizes fetching events synchronously from the NDK cache (`cacheUsage: ONLY_CACHE` by default).
 * - **Deduplication:** Ensures each unique event (based on `event.tagId()`) is added only once.
 * - **Buffering:** Asynchronous events received from relays are buffered for a short period (50ms)
 *   to batch updates and reduce re-renders. Synchronous events from the cache are flushed immediately.
 * - **Automatic Cleanup:** Stops the NDK subscription when the component unmounts or when filters/dependencies change.
 *
 * @template T - The specific type of NDKEvent expected (defaults to NDKEvent).
 * @param {NDKFilter | NDKFilter[] | false} filters - A single NDK filter, an array of filters, or `false` to disable the subscription.
 *   If `false`, the hook will return an empty array and perform no subscription.
 * @param {NDKSubscriptionOptions} [opts={}] - Optional NDK subscription options to override the defaults.
 * @param {any[]} [dependencies=[]] - Optional React useEffect dependency array. The hook will re-subscribe
 *   if any value in this array changes. The `filters` parameter is implicitly included as a dependency.
 * @returns {T[]} An array containing the unique events matching the filters.
 *
 * @example
 * // Get all profile events for a specific pubkey from the cache
 * const pubkey = 'npub...';
 * const filters = { kinds: [0], authors: [pubkey] };
 * const profileEvents = useObserver<NDKUserProfile>(filters);
 *
 * // Observe notes mentioning the user, re-subscribing if `userId` changes
 * const userId = '...';
 * const mentionFilters = { kinds: [1], '#p': [userId] };
 * const mentionEvents = useObserver(mentionFilters, { cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST }, [userId]);
 */
export function useObserver<T extends NDKEvent>(
    filters: NDKFilter[] | false,
    opts: NDKSubscriptionOptions = {},
    dependencies: unknown[] = []
): T[] {
    const { ndk } = useNDK();
    const sub = useRef<NDKSubscription | null>(null);
    const [events, setEvents] = useState<NDKEvent[]>([]);
    const buffer = useRef<NDKEvent[]>([]);
    const bufferTimeout = useRef<NodeJS.Timeout | null>(null);
    const addedEventIds = useRef(new Set<string>());

    dependencies.push(!!filters);

    const stopFilters = useCallback(() => {
        if (sub.current) sub.current.stop();
        sub.current = null;
        buffer.current = [];
        if (bufferTimeout.current) {
            clearTimeout(bufferTimeout.current);
            bufferTimeout.current = null;
        }
        addedEventIds.current.clear();
        setEvents([]);
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!ndk || !filters || filters.length === 0) return;

        let isValid = true;
        if (sub.current) stopFilters();

        const processEvent = (event: NDKEvent) => {
            if (!isValid) return;
            const tagId = event.tagId();
            if (addedEventIds.current.has(tagId)) return;
            addedEventIds.current.add(tagId);
            buffer.current.push(event);
            if (!bufferTimeout.current) {
                bufferTimeout.current = setTimeout(() => {
                    setEvents((prev) => [...prev, ...buffer.current]);
                    buffer.current = [];
                    bufferTimeout.current = null;
                }, 50);
            }
        };

        sub.current = ndk.subscribe(
            filters,
            {
                skipVerification: true,
                closeOnEose: true,
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
                groupable: false,
                subId: 'observer-hook',
                wrap: true,
                ...opts,
            },
            {
                onEvent: (event) => {
                    if (!isValid) return;
                    processEvent(event);
                },
                onEvents: (events) => {
                    for (const event of events) processEvent(event);
                }
            }
        );

        if (buffer.current.length > 0) {
            if (bufferTimeout.current) {
                clearTimeout(bufferTimeout.current);
                bufferTimeout.current = null;
            }
            setEvents(buffer.current);
            buffer.current = [];
        }

        return () => {
            isValid = false;
            stopFilters();
        };
    }, [ndk, ...dependencies, stopFilters]);

    return events as T[];
}