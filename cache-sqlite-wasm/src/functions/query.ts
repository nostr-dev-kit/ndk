import { matchFilter, NDKEvent, type NDKFilter, type NDKSubscription } from "@nostr-dev-kit/ndk";
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
            subId: subscription.subId,
        },
    });

    // Import decoder dynamically to avoid circular dependency
    const { decodeEvents } = await import('../binary/decoder');

    let eventsData: EventForEncoding[];

    try {
        eventsData = decodeEvents(result.buffer);
    } catch (error) {
        console.error('Failed to decode events from cache, cache may be corrupted:', error);
        // Return empty results on decode error - cache will be rebuilt
        return [];
    }

    // Process raw event data returned from worker
    const results = new Map<string, NDKEvent>();

    for (const filter of cacheFilters) {
        const eventsWithRelay = foundEvents(subscription, eventsData, filter);
        for (const { event, relayUrl } of eventsWithRelay) {
            if (event && event.id) {
                results.set(event.id, event);
                // Set relay on event if we have one
                if (relayUrl) {
                    const relay = subscription.pool.getRelay(relayUrl, false);
                    if (relay) {
                        event.relay = relay;
                        if (subscription.ndk) {
                            subscription.ndk.subManager.seenEvent(event.id, relay);
                        }
                    }
                }
            }
        }
    }

    return Array.from(results.values());
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
            const params = filter.authors;
            const events = db.exec(sql, params);
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
            const params = filter.kinds;
            const events = db.exec(sql, params);
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
    const allRecords = querySync(adapter.db, cacheFilters, subscription.subId);

    // Process records into events
    const results = new Map<string, NDKEvent>();

    for (const filter of cacheFilters) {
        const eventsWithRelay = foundEvents(subscription, allRecords, filter);
        for (const { event, relayUrl } of eventsWithRelay) {
            if (event && event.id) {
                results.set(event.id, event);
                // Set relay on event if we have one
                if (relayUrl) {
                    const relay = subscription.pool.getRelay(relayUrl, false);
                    if (relay) {
                        event.relay = relay;
                        if (subscription.ndk) {
                            subscription.ndk.subManager.seenEvent(event.id, relay);
                        }
                    }
                }
            }
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
 * Helper to process DB records and return events with relay data.
 */
function foundEvents(subscription: NDKSubscription, records: (Record<string, unknown> | EventForEncoding)[], filter?: NDKFilter): EventWithRelay[] {
    const result: EventWithRelay[] = [];
    let now: number | undefined;

    for (const record of records) {
        const eventWithRelay = foundEvent(subscription, record, (record as any).relay, filter);
        if (eventWithRelay) {
            const expiration = eventWithRelay.event.tagValue("expiration");
            if (expiration) {
                now ??= Math.floor(Date.now() / 1000);
                if (now > Number.parseInt(expiration)) continue;
            }
            result.push(eventWithRelay);
            if (filter?.limit && result.length >= filter.limit) break;
        }
    }
    return result;
}

interface EventWithRelay {
    event: NDKEvent;
    relayUrl: string | null;
}

/**
 * Helper to create an NDKEvent from a DB record.
 */
function foundEvent(
    subscription: NDKSubscription,
    record: Record<string, unknown> | EventForEncoding,
    relayUrl: string | undefined,
    filter?: NDKFilter,
): EventWithRelay | null {
    try {
        let eventData: Record<string, unknown>;

        // If record has raw field, parse it (from database storage)
        // If not, use record directly (from binary decoding)
        if ('raw' in record && record.raw !== undefined && record.raw !== null) {
            // Parse the raw event - handle both array and object formats for backwards compatibility
            const rawParsed = JSON.parse(record.raw as string);

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
        } else {
            // No raw field - record already has event fields directly (e.g., from binary decode)
            eventData = {
                id: record.id,
                pubkey: record.pubkey,
                created_at: record.created_at,
                kind: record.kind,
                tags: record.tags,
                content: record.content,
                sig: record.sig,
            };
        }

        if (filter && !matchFilter(filter, eventData as any)) return null;
        const ndkEvent = new NDKEvent(undefined, eventData);

        // Get relay URL from record (first relay seen)
        const relayUrl = ('relay_url' in record ? record.relay_url as string : null) || null;

        return { event: ndkEvent, relayUrl };
    } catch (e) {
        console.error("failed to deserialize event", e, "record:", record, "record.raw:", 'raw' in record ? record.raw : undefined);
        return null;
    }
}

