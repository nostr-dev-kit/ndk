/**
 * SQLite WASM Worker using wa-sqlite with OPFS VFS
 *
 * This worker provides persistent SQLite storage using OPFS with:
 * - Incremental writes (only changed pages are written)
 * - No main thread blocking
 * - Async operations for wa-sqlite compatibility
 */

import { WaSqliteDatabase, type QueryExecResult } from "./db/wa-sqlite-db";
import { cleanupOldIndexedDB } from "./db/migration";
import { runMigrations } from "./db/migrations";
import { encodeEvents, type EventForEncoding } from "./binary/encoder";
import type { CacheStats } from "./functions/getCacheStats";
import { PACKAGE_VERSION, PROTOCOL_NAME } from "./version";
import { NDKEvent, NDKKind, matchFilter, type NDKFilter } from "@nostr-dev-kit/ndk";

// Helper function for getting cache stats within worker
async function getCacheStats(db: WaSqliteDatabase): Promise<CacheStats> {
    // Get events grouped by kind
    const eventsByKindResult = await db.exec(`
        SELECT kind, COUNT(*) as count
        FROM events
        WHERE deleted = 0
        GROUP BY kind
        ORDER BY kind
    `);

    const eventsByKind: Record<number, number> = {};
    if (eventsByKindResult[0]) {
        for (const row of eventsByKindResult[0].values) {
            eventsByKind[row[0] as number] = row[1] as number;
        }
    }

    // Get total counts for each table
    const totalEventsResult = await db.exec(`SELECT COUNT(*) FROM events WHERE deleted = 0`);
    const totalProfilesResult = await db.exec(`SELECT COUNT(*) FROM profiles`);
    const totalEventTagsResult = await db.exec(`SELECT COUNT(*) FROM event_tags`);
    const totalDecryptedEventsResult = await db.exec(`SELECT COUNT(*) FROM decrypted_events`);
    const totalUnpublishedEventsResult = await db.exec(`SELECT COUNT(*) FROM unpublished_events`);
    const cacheDataResult = await db.exec(`SELECT COUNT(*) FROM cache_data`);

    return {
        eventsByKind,
        totalEvents: (totalEventsResult[0]?.values[0]?.[0] as number) || 0,
        totalProfiles: (totalProfilesResult[0]?.values[0]?.[0] as number) || 0,
        totalEventTags: (totalEventTagsResult[0]?.values[0]?.[0] as number) || 0,
        totalDecryptedEvents: (totalDecryptedEventsResult[0]?.values[0]?.[0] as number) || 0,
        totalUnpublishedEvents: (totalUnpublishedEventsResult[0]?.values[0]?.[0] as number) || 0,
        cacheData: (cacheDataResult[0]?.values[0]?.[0] as number) || 0,
    };
}

// Helper to set an event (async version)
async function setEvent(db: WaSqliteDatabase, event: any, relay?: { url: string }): Promise<void> {
    const stmt = `
        INSERT OR REPLACE INTO events (
            id, pubkey, created_at, kind, tags, content, sig, raw, deleted, relay_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const tags = JSON.stringify(event.tags ?? []);
    const raw = JSON.stringify([
        event.id,
        event.pubkey,
        event.created_at,
        event.kind,
        event.tags ?? [],
        event.content,
        event.sig,
    ]);
    const values = [
        event.id ?? "",
        event.pubkey ?? "",
        event.created_at ?? 0,
        event.kind ?? 0,
        tags,
        event.content ?? "",
        event.sig ?? "",
        raw,
        0,
        relay?.url ?? null,
    ];

    await db.run(stmt, values);

    // Store event tags for efficient querying (only single-letter indexable tags)
    const seenKeys = new Set<string>();

    if (event.tags && event.tags.length > 0) {
        for (const tag of event.tags) {
            if (tag.length >= 2 && tag[0].length === 1) {
                const tagName = tag[0];
                const tagValue = tag[1] || null;
                const key = `${event.id}:${tagName}:${tagValue}`;

                if (seenKeys.has(key)) continue;
                seenKeys.add(key);

                try {
                    await db.run("INSERT OR IGNORE INTO event_tags (event_id, tag, value) VALUES (?, ?, ?)", [
                        event.id,
                        tagName,
                        tagValue,
                    ]);
                } catch (e) {
                    console.error('[setEvent] Failed to insert tag:', tag, e);
                }
            }
        }
    }

    // Extract and save profile from kind:0 events (only if newer than existing)
    if (event.kind === NDKKind.Metadata || event.kind === 0) {
        try {
            const profile = typeof event.content === "string" ? JSON.parse(event.content) : event.content;
            if (profile && event.pubkey) {
                const eventTimestamp = event.created_at ?? 0;
                // Only update if newer than existing profile
                await db.run(`
                    INSERT INTO profiles (pubkey, profile, updated_at) VALUES (?, ?, ?)
                    ON CONFLICT(pubkey) DO UPDATE SET profile = excluded.profile, updated_at = excluded.updated_at
                    WHERE excluded.updated_at > profiles.updated_at
                `, [
                    event.pubkey,
                    JSON.stringify(profile),
                    eventTimestamp,
                ]);
            }
        } catch {
            // Invalid profile JSON, skip
        }
    }
}

// Helper to query events (async version)
async function queryEvents(db: WaSqliteDatabase, filters: NDKFilter[]): Promise<Record<string, unknown>[]> {
    const allRecords: Record<string, unknown>[] = [];

    function normalizeDbRows(queryResults: QueryExecResult[]): Record<string, unknown>[] {
        if (!queryResults || queryResults.length === 0) return [];
        const queryResult = queryResults[0];
        if (!queryResult || !queryResult.columns || !queryResult.values) return [];
        const { columns, values } = queryResult;
        return values.map((row) => {
            const obj: Record<string, unknown> = {};
            columns.forEach((col, idx) => {
                obj[col] = row[idx];
            });
            return obj;
        });
    }

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
                    const events = await db.exec(sql, params);
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
            const events = await db.exec(sql, params);
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
            const events = await db.exec(sql, filter.authors);
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
            const events = await db.exec(sql, filter.kinds);
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
            const events = await db.exec(sql, filter.ids);
            const normalizedEvents = normalizeDbRows(events);
            allRecords.push(...normalizedEvents);
        }
    }

    return allRecords;
}

let db: WaSqliteDatabase | null = null;
let dbName: string = "ndk-cache";
let persistenceMode: "opfs" | "idb" | "memory" = "memory";

async function initializeDatabase(config: { dbName: string }) {
    dbName = config.dbName || "ndk-cache";
    // Note: OPFS paths should NOT have leading slash
    const dbPath = `${dbName}.sqlite3`;

    try {
        db = await WaSqliteDatabase.create(dbPath);
        persistenceMode = db.persistenceMode;
        console.log(`[Worker] Using ${db.persistenceMode} persistence at ${dbPath}`);

        // Run schema migrations
        await runMigrations(db);

        // Sync to ensure migrations are persisted
        await db.sync();

        // Clean up old IndexedDB storage if exists (from sql.js era)
        await cleanupOldIndexedDB(dbName);

        // Warm up profile LRU cache
        await warmupProfileCache(db);

    } catch (error) {
        console.warn("[Worker] OPFS unavailable, falling back to in-memory database:", error);

        db = await WaSqliteDatabase.createInMemory();
        persistenceMode = "memory";

        // Run schema migrations
        await runMigrations(db);
    }

    console.log(`[Worker] Database initialized (persistence: ${persistenceMode})`);
}

async function warmupProfileCache(database: WaSqliteDatabase) {
    try {
        const rows = await database.queryAll(`
            SELECT pubkey, profile, updated_at
            FROM profiles
            ORDER BY updated_at DESC
            LIMIT 500
        `);

        const profiles: Array<{ pubkey: string; profile: any }> = [];

        for (const row of rows) {
            try {
                profiles.push({
                    pubkey: row.pubkey as string,
                    profile: JSON.parse(row.profile as string),
                });
            } catch {
                // Skip invalid profile JSON
            }
        }

        if (profiles.length > 0) {
            self.postMessage({
                type: "warmupProfiles",
                profiles,
            });
        }
    } catch (error) {
        console.error("[Worker] Profile LRU warmup failed:", error);
    }
}

self.onmessage = async (event: MessageEvent) => {
    const { id, type, payload } = event.data;

    try {
        if (type === "init") {
            await initializeDatabase(payload);

            const initResponse = {
                id,
                result: { initialized: true, persistenceMode },
            };
            self.postMessage(initResponse);
            return;
        }

        if (!db) {
            throw new Error("Database not initialized yet.");
        }

        let result: any;
        switch (type) {
            // Profile operations
            case "saveProfile": {
                const { pubkey, profile, updatedAt } = payload;
                await db.run(
                    "INSERT OR REPLACE INTO profiles (pubkey, profile, updated_at) VALUES (?, ?, ?)",
                    [pubkey, profile, updatedAt]
                );
                result = undefined;
                break;
            }
            case "fetchProfile": {
                const { pubkey } = payload;
                result = await db.queryOne(
                    "SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1",
                    [pubkey]
                );
                break;
            }

            // NIP-05 operations
            case "saveNip05": {
                const { nip05, profile, fetchedAt } = payload;
                await db.run(
                    "INSERT OR REPLACE INTO nip05 (nip05, profile, fetched_at) VALUES (?, ?, ?)",
                    [nip05, profile, fetchedAt]
                );
                result = undefined;
                break;
            }
            case "loadNip05": {
                const { nip05 } = payload;
                result = await db.queryOne(
                    "SELECT profile, fetched_at FROM nip05 WHERE nip05 = ? LIMIT 1",
                    [nip05]
                );
                break;
            }

            // Event operations
            case "getEvent": {
                const { id: eventId } = payload;
                result = await db.queryOne(
                    "SELECT raw FROM events WHERE id = ? AND deleted = 0 LIMIT 1",
                    [eventId]
                );
                break;
            }
            case "addDecryptedEvent": {
                const { wrapperId, serialized } = payload;
                await db.run(
                    "INSERT OR REPLACE INTO decrypted_events (id, event) VALUES (?, ?)",
                    [wrapperId, serialized]
                );
                result = undefined;
                break;
            }
            case "getDecryptedEvent": {
                const { wrapperId } = payload;
                result = await db.queryOne(
                    "SELECT event FROM decrypted_events WHERE id = ? LIMIT 1",
                    [wrapperId]
                );
                break;
            }
            case "discardUnpublishedEvent": {
                const { id: eventId } = payload;
                await db.run("DELETE FROM unpublished_events WHERE id = ?", [eventId]);
                result = undefined;
                break;
            }
            case "getUnpublishedEvents": {
                result = await db.queryAll("SELECT event, relays FROM unpublished_events");
                break;
            }
            case "addUnpublishedEvent": {
                const { id: eventId, event: eventJson, relays } = payload;

                await db.run(
                    "INSERT OR REPLACE INTO unpublished_events (id, event, relays) VALUES (?, ?, ?)",
                    [eventId, eventJson, relays]
                );

                try {
                    const ndkEvent = new NDKEvent(undefined, JSON.parse(eventJson));
                    await setEvent(db, ndkEvent, undefined);
                } catch (e) {
                    console.error("[addUnpublishedEvent] Failed to store event in main table:", e);
                }

                result = undefined;
                break;
            }

            // Relay operations
            case "getRelayStatus": {
                const { relayUrl } = payload;
                await db.run("CREATE TABLE IF NOT EXISTS relay_status (url TEXT PRIMARY KEY, info TEXT)");
                result = await db.queryOne(
                    "SELECT info FROM relay_status WHERE url = ? LIMIT 1",
                    [relayUrl]
                );
                break;
            }
            case "updateRelayStatus": {
                const { relayUrl, info } = payload;
                await db.run("CREATE TABLE IF NOT EXISTS relay_status (url TEXT PRIMARY KEY, info TEXT)");
                await db.run("INSERT OR REPLACE INTO relay_status (url, info) VALUES (?, ?)", [
                    relayUrl,
                    info,
                ]);
                result = undefined;
                break;
            }

            case "getProfiles": {
                const { field, fields, contains } = payload;
                const searchFields = fields || (field ? [field] : []);

                if (searchFields.length === 0) {
                    throw new Error("Either 'field' or 'fields' must be provided");
                }

                const conditions = searchFields
                    .map((f: string) => `json_extract(profile, '$.${f}') LIKE ?`)
                    .join(" OR ");

                const sql = `
                    SELECT pubkey, profile
                    FROM profiles
                    WHERE ${conditions}
                `;
                const param = `%${contains}%`;
                const params = searchFields.map(() => param);

                const rows = await db.queryAll(sql, params);
                result = [];
                for (const row of rows) {
                    try {
                        result.push({
                            pubkey: row.pubkey as string,
                            profile: JSON.parse(row.profile as string),
                        });
                    } catch {
                        // skip invalid profile
                    }
                }
                break;
            }

            case "getCacheStats":
                result = await getCacheStats(db);
                break;

            case "getPersistenceMode":
                result = persistenceMode;
                break;

            case "setEvent": {
                const { event, relay } = payload;
                const relayObj = relay ? { url: relay } : undefined;
                await setEvent(db, event, relayObj);
                result = undefined;
                break;
            }
            case "setEventBatch": {
                const { events } = payload;
                for (const item of events) {
                    const relayObj = item.relay ? { url: item.relay } : undefined;
                    await setEvent(db, item.event, relayObj);
                }
                // Sync after batch to ensure data is flushed
                await db.sync();
                result = undefined;
                break;
            }
            case "query": {
                const { filters } = payload as { filters: NDKFilter[] };

                let queryResult: Record<string, unknown>[];
                try {
                    queryResult = await queryEvents(db, filters);
                } catch (e: any) {
                    console.error(`[Worker] queryEvents failed:`, e.message);
                    throw e;
                }

                const eventsForEncoding: EventForEncoding[] = [];
                const seenIds = new Set<string>();
                const now = Math.floor(Date.now() / 1000);

                const parseRow = (row: Record<string, unknown>) => {
                    let tags: string[][] = [];

                    if (typeof row.raw === "string") {
                        try {
                            const parsed = JSON.parse(row.raw as string);
                            if (Array.isArray(parsed[4])) {
                                tags = parsed[4];
                            } else if (typeof row.tags === "string") {
                                tags = JSON.parse(row.tags || "[]");
                            }
                            return {
                                id: parsed[0] || (row.id as string),
                                pubkey: parsed[1] || (row.pubkey as string),
                                created_at: parsed[2] || (row.created_at as number),
                                kind: parsed[3] || (row.kind as number),
                                tags,
                                content: parsed[5] || (row.content as string),
                                sig: parsed[6] || (row.sig as string),
                                relay_url: (row.relay_url as string) || null,
                            };
                        } catch {
                            // fall through
                        }
                    }

                    if (typeof row.tags === "string") {
                        try {
                            tags = JSON.parse(row.tags || "[]");
                        } catch {
                            tags = [];
                        }
                    } else if (Array.isArray(row.tags)) {
                        tags = row.tags as string[][];
                    }

                    return {
                        id: row.id as string,
                        pubkey: row.pubkey as string,
                        created_at: row.created_at as number,
                        kind: row.kind as number,
                        tags,
                        content: row.content as string,
                        sig: row.sig as string,
                        relay_url: (row.relay_url as string) || null,
                    };
                };

                for (const filter of filters) {
                    const limit = filter.limit || Infinity;
                    let count = 0;

                    for (const row of queryResult) {
                        if (count >= limit) break;

                        let eventData;
                        try {
                            eventData = parseRow(row);
                        } catch (e: any) {
                            console.error(`[Worker] parseRow failed:`, e.message);
                            continue;
                        }

                        if (seenIds.has(eventData.id)) continue;

                        const expirationTag = eventData.tags?.find(
                            (t: string[]) => t[0] === "expiration"
                        );
                        if (expirationTag && now > parseInt(expirationTag[1])) continue;

                        try {
                            if (!matchFilter(filter, eventData as any)) continue;
                        } catch (e: any) {
                            console.error(
                                `[Worker] matchFilter failed for event ${eventData.id}:`,
                                e.message
                            );
                            throw e;
                        }

                        seenIds.add(eventData.id);
                        count++;
                        eventsForEncoding.push({
                            id: eventData.id || "",
                            pubkey: eventData.pubkey || "",
                            created_at: eventData.created_at || 0,
                            kind: eventData.kind || 0,
                            sig: eventData.sig || "",
                            content: eventData.content || "",
                            tags: Array.isArray(eventData.tags) ? eventData.tags : [],
                            relay_url: eventData.relay_url,
                        });
                    }
                }

                if (eventsForEncoding.length > 0) {
                    if (eventsForEncoding.length < 100) {
                        result = {
                            type: "json",
                            events: eventsForEncoding,
                            eventCount: eventsForEncoding.length,
                        };
                    } else {
                        const buffer = encodeEvents(eventsForEncoding);
                        result = {
                            type: "binary",
                            buffer,
                            eventCount: eventsForEncoding.length,
                        };
                    }
                } else {
                    result = {
                        type: "json",
                        events: [],
                        eventCount: 0,
                    };
                }
                break;
            }
            case "getCacheData": {
                const { namespace, key, maxAgeInSecs } = payload;
                const now = Math.floor(Date.now() / 1000);

                const row = await db.queryOne(
                    "SELECT data, cached_at FROM cache_data WHERE namespace = ? AND key = ?",
                    [namespace, key]
                );

                if (row) {
                    const cachedAt = row.cached_at as number;

                    if (maxAgeInSecs && now - cachedAt > maxAgeInSecs) {
                        result = undefined;
                        break;
                    }

                    result = JSON.parse(row.data as string);
                } else {
                    result = undefined;
                }
                break;
            }
            case "setCacheData": {
                const { namespace, key, data } = payload;
                const now = Math.floor(Date.now() / 1000);
                const dataJson = JSON.stringify(data);

                await db.run(
                    "INSERT OR REPLACE INTO cache_data (namespace, key, data, cached_at) VALUES (?, ?, ?, ?)",
                    [namespace, key, dataJson, now]
                );
                result = undefined;
                break;
            }
            default:
                throw new Error(`Unknown command type: ${type}`);
        }

        const response = {
            _protocol: PROTOCOL_NAME,
            _version: PACKAGE_VERSION,
            id,
            result,
        };

        const transferables: Transferable[] = [];
        if (result && result.type === "binary" && result.buffer) {
            transferables.push(result.buffer);
        }

        if (transferables.length > 0) {
            (self as any).postMessage(response, transferables);
        } else {
            self.postMessage(response);
        }
    } catch (error: any) {
        console.error(`[Worker] Error processing command ${id} (${type}):`, error);
        const errorResponse = {
            _protocol: PROTOCOL_NAME,
            _version: PACKAGE_VERSION,
            id,
            error: { message: error.message, stack: error.stack },
        };
        self.postMessage(errorResponse);
    }
};

self.addEventListener("error", (event) => {
    console.error("Worker: Uncaught error:", event.message, event.error);
});
