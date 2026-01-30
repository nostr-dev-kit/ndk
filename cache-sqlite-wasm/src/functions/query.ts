import { NDKEvent, type NDKFilter, type NDKSubscription } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";
import type { EventForEncoding } from "../binary/encoder";

/**
 * Query events from the WASM-backed SQLite DB using NDKSubscription filters.
 * Mirrors the logic of the mobile adapter, but uses async/await and WASM DB API.
 */
export function query(
    this: NDKCacheAdapterSqliteWasm,
    subscription: NDKSubscription,
): NDKEvent[] | Promise<NDKEvent[]> {
    // If in degraded mode, return empty results (no cache available)
    if (this.degradedMode) return [];

    if (!this.ready) {
        if (this.initializationPromise) {
            return this.initializationPromise.then(async () => {
                // Check again after initialization completes
                if (this.degradedMode) return [];
                return await queryWorker.call(this, subscription);
            });
        }
        return [];
    }

    return queryWorker.call(this, subscription);
}

async function queryWorker(this: NDKCacheAdapterSqliteWasm, subscription: NDKSubscription): Promise<NDKEvent[]> {
    // Send filters to worker - worker handles matchFilter, limits, and deduplication
    const cacheFilters = filterForCache(subscription);

    const result = await this.postWorkerMessage<any>({
        type: "query",
        payload: {
            filters: cacheFilters,
        },
    });

    let eventsData: EventForEncoding[];

    // Handle both JSON and binary responses from worker
    if (result.type === 'json') {
        eventsData = result.events;
    } else if (result.type === 'binary') {
        const { decodeEvents } = await import('../binary/decoder');
        try {
            eventsData = decodeEvents(result.buffer);
        } catch (error) {
            console.error('Failed to decode events from cache, cache may be corrupted:', error);
            return [];
        }
    } else {
        console.error('Unknown result type from worker:', result.type);
        return [];
    }

    // Convert pre-filtered events to NDKEvent instances
    const events: NDKEvent[] = [];

    for (const eventData of eventsData) {
        const ndkEvent = new NDKEvent(undefined, {
            id: eventData.id,
            pubkey: eventData.pubkey,
            created_at: eventData.created_at,
            kind: eventData.kind,
            tags: eventData.tags,
            content: eventData.content,
            sig: eventData.sig,
        });

        // Track cached event IDs for O(1) duplicate checking on writes
        this.addCachedEventId(eventData.id);

        // Set relay on event if we have one
        if (eventData.relay_url) {
            const relay = subscription.pool.getRelay(eventData.relay_url, false);
            if (relay) {
                ndkEvent.relay = relay;
            }
        }

        events.push(ndkEvent);
    }

    return events;
}

/**
 * Helper to adjust filters for cache, similar to mobile implementation.
 */
function filterForCache(subscription: NDKSubscription): NDKFilter[] {
    if (!subscription.cacheUnconstrainFilter) return subscription.filters;
    const filterCopy = subscription.filters.map((filter) => ({ ...filter }));
    return filterCopy.filter((filter) => {
        for (const key of subscription.cacheUnconstrainFilter!) {
            delete filter[key];
        }
        return Object.keys(filter).length > 0;
    });
}

