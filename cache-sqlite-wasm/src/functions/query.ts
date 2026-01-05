import { NDKEvent, type NDKFilter, type NDKSubscription } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";
import type { Database, QueryExecResult } from "../types";
import type { EventForEncoding } from "../binary/encoder";

/**
 * Utility to normalize DB rows from `{ columns, values }` to array of objects.
 */
function normalizeDbRows(queryResults: QueryExecResult[]): Record<string, unknown>[] {
    if (!queryResults || queryResults.length === 0) {
        return [];
    }

    // Take the first result (sql.js exec returns an array of results)
    const queryResult = queryResults[0];
    if (!queryResult || !queryResult.columns || !queryResult.values) {
        return [];
    }

    const { columns, values } = queryResult;

    return values.map((row) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, idx) => {
            obj[col] = row[idx];
        });
        return obj;
    });
}

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

// Sync query function that can be used both in main thread and worker
export function querySync(db: Database, filters: NDKFilter[], subId?: string): Record<string, unknown>[] {
    const allRecords: Record<string, unknown>[] = [];

    for (const filter of filters) {
        const hasHashtagFilter = Object.keys(filter).some((key) => key.startsWith("#") && key.length === 2);

        if (hasHashtagFilter) {
            for (const key in filter) {
                if (key.startsWith("#") && key.length === 2) {
                    const tagValues = Array.isArray((filter as any)[key]) ? (filter as any)[key] : [];
                    const placeholders = tagValues.map(() => "?").join(",");
                    const sql = `
                        SELECT events.*
                        FROM events
                        INNER JOIN event_tags ON events.id = event_tags.event_id
                        WHERE events.deleted = 0 AND event_tags.tag = ? AND event_tags.value IN (${placeholders})
                        ORDER BY events.created_at DESC
                    `;
                    const params = [key[1], ...tagValues];
                    const events = db.exec(sql, params);
                    const normalizedEvents = normalizeDbRows(events);
                    allRecords.push(...normalizedEvents);
                    break;
                }
            }
        } else if (filter.authors && filter.kinds) {
            const sql = `
                SELECT events.*
                FROM events
                WHERE events.deleted = 0
                AND events.pubkey IN (${filter.authors.map(() => "?").join(",")})
                AND events.kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY events.created_at DESC
            `;
            const params = [...filter.authors, ...filter.kinds];
            const events = db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        } else if (filter.authors) {
            const sql = `
                SELECT events.*
                FROM events
                WHERE events.deleted = 0
                AND events.pubkey IN (${filter.authors.map(() => "?").join(",")})
                ORDER BY events.created_at DESC
            `;
            const events = db.exec(sql, filter.authors);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        } else if (filter.kinds) {
            const sql = `
                SELECT events.*
                FROM events
                WHERE events.deleted = 0
                AND events.kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY events.created_at DESC
            `;
            const events = db.exec(sql, filter.kinds);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        } else if (filter.ids) {
            const sql = `
                SELECT events.*
                FROM events
                WHERE events.deleted = 0
                AND events.id IN (${filter.ids.map(() => "?").join(",")})
                ORDER BY events.created_at DESC
            `;
            const events = db.exec(sql, filter.ids);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        }
    }

    return allRecords;
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

