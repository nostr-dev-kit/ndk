import { matchFilter, NDKEvent, type NDKFilter, type NDKSubscription } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";
import { type EventRelay } from "./getEventRelays";
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
    if (!this.ready) {
        if (this.initializationPromise) {
            return this.initializationPromise.then(async () => {
                if (this.useWorker) {
                    return await queryWorker.call(this, subscription);
                }
                if (!this.db) return [];
                return await queryDb(this, subscription);
            });
        }
        return [];
    }

    if (this.useWorker) {
        return queryWorker.call(this, subscription);
    }

    if (!this.db) {
        return [];
    }

    return queryDb(this, subscription);
}

async function queryWorker(this: NDKCacheAdapterSqliteWasm, subscription: NDKSubscription): Promise<NDKEvent[]> {
    // Send filters to worker, let it handle all SQL logic
    const cacheFilters = filterForCache(subscription);

    const result = await this.postWorkerMessage<any>({
        type: "query",
        payload: {
            filters: cacheFilters,
            cacheUnconstrainFilter: subscription.cacheUnconstrainFilter,
        },
    });

    // Process raw event data returned from worker
    const results = new Map<string, NDKEvent>();
    for (const filter of cacheFilters) {
        const events = foundEvents(subscription, result, filter);
        for (const event of events) {
            if (event && event.id) results.set(event.id, event);
        }
    }

    // Fetch relay provenance for all found events
    const eventIds = Array.from(results.keys());
    const relayData = await this.getEventRelays(eventIds);

    // Restore relays on events
    for (const [eventId, event] of results) {
        const relays = relayData.get(eventId) || [];
        restoreRelaysOnEvent(event, relays, subscription);
    }

    return Array.from(results.values());
}

// Sync query function that can be used both in main thread and worker
export function querySync(db: any, filters: NDKFilter[]): any[] {
    const allRecords: any[] = [];

    for (const filter of filters) {
        const hasHashtagFilter = Object.keys(filter).some((key) => key.startsWith("#") && key.length === 2);

        if (hasHashtagFilter) {
            for (const key in filter) {
                if (key.startsWith("#") && key.length === 2) {
                    const tagValues = Array.isArray((filter as any)[key]) ? (filter as any)[key] : [];
                    const placeholders = tagValues.map(() => "?").join(",");
                    const sql = `
                        SELECT * FROM events
                        INNER JOIN event_tags ON events.id = event_tags.event_id
                        WHERE events.deleted = 0 AND event_tags.tag = ? AND event_tags.value IN (${placeholders})
                        ORDER BY created_at DESC
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
                SELECT * FROM events
                WHERE deleted = 0
                AND pubkey IN (${filter.authors.map(() => "?").join(",")})
                AND kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = [...filter.authors, ...filter.kinds];
            const events = db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        } else if (filter.authors) {
            const sql = `
                SELECT * FROM events
                WHERE deleted = 0
                AND pubkey IN (${filter.authors.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.authors;
            const events = db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        } else if (filter.kinds) {
            const sql = `
                SELECT * FROM events
                WHERE deleted = 0
                AND kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.kinds;
            const events = db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        } else if (filter.ids) {
            const sql = `
                SELECT * FROM events
                WHERE deleted = 0
                AND id IN (${filter.ids.map(() => "?").join(",")})
                ORDER BY created_at DESC
            `;
            const params = filter.ids;
            const events = db.exec(sql, params);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        }
    }

    return allRecords;
}

async function queryDb(adapter: NDKCacheAdapterSqliteWasm, subscription: NDKSubscription): Promise<NDKEvent[]> {
    if (!adapter.db) return [];

    const cacheFilters = filterForCache(subscription);
    const allRecords = querySync(adapter.db, cacheFilters);

    // Process records into events
    const results = new Map<string, NDKEvent>();
    for (const filter of cacheFilters) {
        const events = foundEvents(subscription, allRecords, filter);
        for (const event of events) {
            if (event && event.id) results.set(event.id, event);
        }
    }

    // Fetch relay provenance for all found events
    const eventIds = Array.from(results.keys());
    const relayData = await adapter.getEventRelays(eventIds);

    // Restore relays on events
    for (const [eventId, event] of results) {
        const relays = relayData.get(eventId) || [];
        restoreRelaysOnEvent(event, relays, subscription);
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
        // Parse the raw event - handle both array and object formats for backwards compatibility
        const rawParsed = JSON.parse(record.raw);
        let eventData: any;

        if (Array.isArray(rawParsed)) {
            // New format: [id, pubkey, created_at, kind, tags, content, sig]
            eventData = {
                id: rawParsed[0],
                pubkey: rawParsed[1],
                created_at: rawParsed[2],
                kind: rawParsed[3],
                tags: rawParsed[4],
                content: rawParsed[5],
                sig: rawParsed[6],
            };
        } else {
            // Old format: direct object
            eventData = rawParsed;
        }

        if (filter && !matchFilter(filter, eventData as any)) return null;
        const ndkEvent = new NDKEvent(undefined, eventData);
        return ndkEvent;
    } catch (e) {
        console.error("failed to deserialize event", e, "record:", record, "record.raw:", record.raw);
        return null;
    }
}

/**
 * Restores relay provenance on an NDKEvent after retrieval from cache.
 * Sets the primary relay and registers all relays in the subscription manager.
 */
function restoreRelaysOnEvent(event: NDKEvent, relays: EventRelay[], subscription: NDKSubscription): void {
    if (relays.length === 0) return;

    // Set the first relay as the primary relay
    const primaryRelay = subscription.pool.getRelay(relays[0].url, false);
    if (primaryRelay) {
        event.relay = primaryRelay;
    }

    // Register all relays in seenEvents for the onRelays getter
    if (subscription.ndk) {
        for (const relayData of relays) {
            const relay = subscription.pool.getRelay(relayData.url, false);
            if (relay) {
                subscription.ndk.subManager.seenEvent(event.id, relay);
            }
        }
    }
}
