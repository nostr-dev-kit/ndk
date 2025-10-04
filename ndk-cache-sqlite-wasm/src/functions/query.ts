import type { NDKCacheAdapterSqliteWasm } from "../index";
import { NDKEvent, NDKSubscription, NDKFilter } from "@nostr-dev-kit/ndk";
import { deserialize, matchFilter } from "@nostr-dev-kit/ndk";

import type { QueryExecResult } from "../types";

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
    if (!this.ready || !this.db) {
        if (this.initializationPromise) {
            return this.initializationPromise.then(() => {
                if (!this.db) return [];
                return queryDb(this, subscription);
            });
        }
        return [];
    }

    return queryDb(this, subscription);
}

function queryDb(adapter: NDKCacheAdapterSqliteWasm, subscription: NDKSubscription): NDKEvent[] {
    if (!adapter.db) return [];

    const cacheFilters = filterForCache(subscription);
    const results = new Map<string, NDKEvent>();

    // Helper to add events to the result map
    const addResults = (events: NDKEvent[]) => {
        for (const event of events) {
            if (event && event.id) results.set(event.id, event);
        }
    };

    for (const filter of cacheFilters) {
        const hasHashtagFilter = Object.keys(filter).some((key) => key.startsWith("#") && key.length === 2);

        if (hasHashtagFilter) {
            for (const key in filter) {
                if (key.startsWith("#") && key.length === 2) {
                    const tagValues = Array.isArray((filter as any)[key]) ? (filter as any)[key] : [];
                    const placeholders = tagValues.map(() => "?").join(",");
                    const sql = `
                        SELECT * FROM events
                        INNER JOIN event_tags ON events.id = event_tags.event_id
                        WHERE event_tags.tag = ? AND event_tags.value IN (${placeholders})
                        ORDER BY created_at DESC
                    `;
                    const params = [key[1], ...tagValues];
                    const events = adapter.db.exec(sql, params);
                    const normalizedEvents = normalizeDbRows(events);
                    if (normalizedEvents && normalizedEvents.length > 0)
                        addResults(foundEvents(subscription, normalizedEvents, filter));
                    break;
                }
            }
        } else if (filter.authors && filter.kinds) {
            const sql = `
                SELECT * FROM events
                WHERE pubkey IN (${filter.authors.map(() => "?").join(",")})
                AND kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = [...filter.authors, ...filter.kinds];
            const events = adapter.db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            if (normalizedEvents && normalizedEvents.length > 0)
                addResults(foundEvents(subscription, normalizedEvents, filter));
        } else if (filter.authors) {
            const sql = `
                SELECT * FROM events
                WHERE pubkey IN (${filter.authors.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.authors;
            const events = adapter.db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            if (normalizedEvents && normalizedEvents.length > 0)
                addResults(foundEvents(subscription, normalizedEvents, filter));
        } else if (filter.kinds) {
            const sql = `
                SELECT * FROM events
                WHERE kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.kinds;
            const events = adapter.db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            if (normalizedEvents && normalizedEvents.length > 0)
                addResults(foundEvents(subscription, normalizedEvents, filter));
        } else if (filter.ids) {
            const sql = `
                SELECT * FROM events
                WHERE id IN (${filter.ids.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.ids;
            const events = adapter.db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            if (normalizedEvents && normalizedEvents.length > 0)
                addResults(foundEvents(subscription, normalizedEvents, filter));
        } else {
        }
    }

    return Array.from(results.values());
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

/**
 * Helper to process DB records and return NDKEvent[].
 */
function foundEvents(subscription: NDKSubscription, records: any[], filter?: NDKFilter): NDKEvent[] {
    const result: NDKEvent[] = [];
    let now: number | undefined;

    for (const record of records) {
        const event = foundEvent(subscription, record, record.relay, filter);
        if (event) {
            const expiration = event.tagValue("expiration");
            if (expiration) {
                now ??= Math.floor(Date.now() / 1000);
                if (now > Number.parseInt(expiration)) continue;
            }
            result.push(event);
            if (filter?.limit && result.length >= filter.limit) break;
        }
    }
    return result;
}

/**
 * Helper to create an NDKEvent from a DB record.
 */
function foundEvent(
    subscription: NDKSubscription,
    record: any,
    relayUrl: string | undefined,
    filter?: NDKFilter,
): NDKEvent | null {
    try {
        const deserializedEvent = deserialize(record.raw);
        if (filter && !matchFilter(filter, deserializedEvent as any)) return null;
        const ndkEvent = new NDKEvent(undefined, deserializedEvent);
        return ndkEvent;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("failed to deserialize event", e, record.raw);
        return null;
    }
}
