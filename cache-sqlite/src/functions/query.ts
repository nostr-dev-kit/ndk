import type NDK from "@nostr-dev-kit/ndk";
import { matchFilter, NDKEvent, type NDKFilter, type NDKRawEvent, type NDKSubscription } from "@nostr-dev-kit/ndk";
import type { DatabaseWrapper } from "../db/database";

/**
 * Query events from the SQLite DB using NDKSubscription filters.
 * Adapted from the WASM adapter to use better-sqlite3.
 */
export function query(this: { db?: DatabaseWrapper; ndk?: NDK }, subscription: NDKSubscription): NDKEvent[] {
    if (!this.db) throw new Error("Database not initialized");

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
                    const tagValues = Array.isArray((filter as Record<string, unknown>)[key])
                        ? ((filter as Record<string, unknown>)[key] as string[])
                        : [];
                    const placeholders = tagValues.map(() => "?").join(",");
                    const sql = `
                        SELECT * FROM events
                        INNER JOIN event_tags ON events.id = event_tags.event_id
                        WHERE event_tags.tag = ? AND event_tags.value IN (${placeholders})
                        ORDER BY created_at DESC
                    `;
                    const params = [key[1], ...tagValues];
                    const stmt = this.db.getDatabase().prepare(sql);
                    const rows = stmt.all(...params) as Record<string, unknown>[];
                    if (rows && rows.length > 0) addResults(foundEvents(subscription, rows, filter));
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
            const stmt = this.db.getDatabase().prepare(sql);
            const rows = stmt.all(...params) as Record<string, unknown>[];
            if (rows && rows.length > 0) addResults(foundEvents(subscription, rows, filter));
        } else if (filter.authors) {
            const sql = `
                SELECT * FROM events
                WHERE pubkey IN (${filter.authors.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.authors;
            const stmt = this.db.getDatabase().prepare(sql);
            const rows = stmt.all(...params) as Record<string, unknown>[];
            if (rows && rows.length > 0) addResults(foundEvents(subscription, rows, filter));
        } else if (filter.kinds) {
            const sql = `
                SELECT * FROM events
                WHERE kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.kinds;
            const stmt = this.db.getDatabase().prepare(sql);
            const rows = stmt.all(...params) as Record<string, unknown>[];
            if (rows && rows.length > 0) addResults(foundEvents(subscription, rows, filter));
        } else if (filter.ids) {
            const sql = `
                SELECT * FROM events
                WHERE id IN (${filter.ids.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.ids;
            const stmt = this.db.getDatabase().prepare(sql);
            const rows = stmt.all(...params) as Record<string, unknown>[];
            if (rows && rows.length > 0) addResults(foundEvents(subscription, rows, filter));
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
function foundEvents(
    subscription: NDKSubscription,
    records: Record<string, unknown>[],
    filter?: NDKFilter,
): NDKEvent[] {
    const result: NDKEvent[] = [];
    let now: number | undefined;

    for (const record of records) {
        const event = foundEvent(subscription, record, record.relay as string | undefined, filter);
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
    record: Record<string, unknown>,
    relayUrl: string | undefined,
    filter?: NDKFilter,
): NDKEvent | null {
    try {
        // The raw field contains a JSON stringified event, so we need to parse it
        const deserializedEvent = JSON.parse(record.raw as string);

        if (filter) {
            // Create a copy of the filter without limit for matchFilter
            const { limit, ...filterForMatch } = filter;
            if (!matchFilter(filterForMatch, deserializedEvent as NDKRawEvent)) {
                return null;
            }
        }

        const ndkEvent = new NDKEvent(subscription.ndk, deserializedEvent);
        return ndkEvent;
    } catch (e) {
        console.error("failed to deserialize event", e, record.raw);
        return null;
    }
}
