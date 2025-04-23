import {
    type NDKEvent,
    type NDKFilter,
    type NDKSubscription,
    NDKSubscriptionCacheUsage,
    type NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNDK } from "../../ndk/hooks";
import { useMuteFilter } from "../../mutes/hooks/use-mute-filter";

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
 */
export interface UseObserverOptions extends NDKSubscriptionOptions {
    /**
     * Whether to include muted events (default: false)
     */
    includeMuted?: boolean;
}

export function useObserver<T extends NDKEvent>(
    filters: NDKFilter[] | false,
    opts: UseObserverOptions = {},
    dependencies: unknown[] = [],
): T[] {
    const { ndk } = useNDK();
    const sub = useRef<NDKSubscription | null>(null);
    const [events, setEvents] = useState<NDKEvent[]>([]);
    const buffer = useRef<NDKEvent[]>([]);
    const bufferTimeout = useRef<NodeJS.Timeout | number | null>(null);
    const addedEventIds = useRef(new Set<string>());
    console.log("useObserver");
    const muteFilter = useMuteFilter();

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
        if (!ndk || !filters) return;

        let isValid = true;
        if (sub.current) stopFilters();

        const processEvent = (event: NDKEvent) => {
            if (!isValid) return;
            if (!opts.includeMuted && muteFilter(event)) return;
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
                closeOnEose: true,
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
                groupable: false,
                wrap: true,
                ...opts,
            },
            {
                onEvent: (event) => {
                    if (!isValid) return;
                    processEvent(event);
                },
                onEvents: (events) => {
                    const filtered = !opts.includeMuted ? events.filter((e) => !muteFilter(e)) : events;
                    setEvents(filtered);
                },
            },
        );

        if (buffer.current.length > 0) {
            if (bufferTimeout.current) {
                clearTimeout(bufferTimeout.current);
                bufferTimeout.current = null;
            }
            buffer.current = [];
        }

        return () => {
            isValid = false;
            stopFilters();
        };
    }, [ndk, ...dependencies]);

    return events as T[];
}
