import initSqlJs, { type Database } from "sql.js";
import { loadFromIndexedDB, saveToIndexedDB } from "./db/indexeddb-utils";
import { runMigrations } from "./db/migrations";
import { querySync } from "./functions/query";
import { setEventSync } from "./functions/setEvent";
import { encodeEvents, type EventForEncoding } from "./binary/encoder";
import type { CacheStats } from "./functions/getCacheStats";
import { PACKAGE_VERSION, PROTOCOL_NAME } from "./version";
import { NDKEvent } from "@nostr-dev-kit/ndk";

// Helper function for getting cache stats within worker
function getCacheStatsSync(db: Database): CacheStats {
    // Get events grouped by kind
    const eventsByKindResult = db.exec(`
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
    const totalEventsResult = db.exec(`SELECT COUNT(*) FROM events WHERE deleted = 0`);
    const totalProfilesResult = db.exec(`SELECT COUNT(*) FROM profiles`);
    const totalEventTagsResult = db.exec(`SELECT COUNT(*) FROM event_tags`);
    const totalDecryptedEventsResult = db.exec(`SELECT COUNT(*) FROM decrypted_events`);
    const totalUnpublishedEventsResult = db.exec(`SELECT COUNT(*) FROM unpublished_events`);
    const cacheDataResult = db.exec(`SELECT COUNT(*) FROM cache_data`);

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


let db: Database | null = null;
let SQL: initSqlJs.SqlJsStatic | null = null;
let dbName: string = "ndk-cache";

let saveTimeout: number | null = null;
let SAVE_DEBOUNCE_MS = 5000; // Increased from 500ms to reduce memory pressure
let DISABLE_AUTOSAVE = false;

// Debounced persistence: saves DB to IndexedDB after writes
function scheduleSave() {
    if (DISABLE_AUTOSAVE) {
        return;
    }

    if (saveTimeout !== null) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(async () => {
        if (db && dbName) {
            const startTime = performance.now();
            const data = db.export();
            const exportTime = performance.now() - startTime;
            const dbSizeMB = (data.byteLength / (1024 * 1024)).toFixed(2);

            console.log(`[Worker] DB export: ${dbSizeMB}MB in ${exportTime.toFixed(0)}ms`);

            try {
                const saveStartTime = performance.now();
                await saveToIndexedDB(dbName, data);
                const saveTime = performance.now() - saveStartTime;
                console.log(`[Worker] DB save to IndexedDB: ${saveTime.toFixed(0)}ms`);
            } catch (err) {
                console.error("[Worker Persistence] Failed to save DB to IndexedDB", err);
            }
        }
    }, SAVE_DEBOUNCE_MS) as unknown as number;
}

// Patch db.run to schedule save after each write
function patchDbPersistence(database: Database): void {
    const origRun = database.run.bind(database);
    database.run = function (sql: string, params?: initSqlJs.BindParams) {
        const result = origRun(sql, params);
        scheduleSave();
        return result;
    };
}

async function initializeDatabase(config: {
    dbName: string;
    wasmUrl?: string;
    saveDebounceMs?: number;
    disableAutosave?: boolean;
}) {
    dbName = config.dbName || "ndk-cache";

    // Apply persistence configuration
    if (config.saveDebounceMs !== undefined) {
        SAVE_DEBOUNCE_MS = config.saveDebounceMs;
    }
    if (config.disableAutosave !== undefined) {
        DISABLE_AUTOSAVE = config.disableAutosave;
    }

    console.log(`[Worker] Persistence config: debounce=${SAVE_DEBOUNCE_MS}ms, autosave=${!DISABLE_AUTOSAVE}`);

    try {
        const sqlJsConfig: any = {};
        if (config.wasmUrl) {
            sqlJsConfig.locateFile = () => config.wasmUrl;
        }
        SQL = await initSqlJs(sqlJsConfig);

        const savedData = await loadFromIndexedDB(dbName);
        if (savedData) {
            db = new SQL.Database(new Uint8Array(savedData));
        } else {
            db = new SQL.Database();
        }
        patchDbPersistence(db);

        await runMigrations(db as any);

        // Initial save after migrations (in case schema changed)
        scheduleSave();

        // Warm up profile LRU cache
        warmupProfileCache(db);
    } catch (error) {
        console.error("Worker: Database initialization failed", error);
        throw error;
    }
}

function warmupProfileCache(database: Database) {
    try {
        // Get the most recently updated profiles to warm the cache
        const stmt = database.prepare(`
            SELECT pubkey, profile, updated_at
            FROM profiles
            ORDER BY updated_at DESC
            LIMIT 500
        `);

        const profiles: Array<{ pubkey: string; profile: any }> = [];

        while (stmt.step()) {
            const row = stmt.getAsObject();
            try {
                profiles.push({
                    pubkey: row.pubkey as string,
                    profile: JSON.parse(row.profile as string),
                });
            } catch (e) {
                // Skip invalid profile JSON
            }
        }
        stmt.free();

        // Send warmup data back to main thread to populate the LRU
        if (profiles.length > 0) {
            self.postMessage({
                type: 'warmupProfiles',
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
            const initResponse = { id, result: "initialized" };
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
                db.run(
                    "INSERT OR REPLACE INTO profiles (pubkey, profile, updated_at) VALUES (?, ?, ?)",
                    [pubkey, profile, updatedAt]
                );
                result = undefined;
                break;
            }
            case "fetchProfile": {
                const { pubkey } = payload;
                const stmt = db.prepare("SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1", [pubkey]);
                if (stmt.step()) {
                    result = stmt.getAsObject();
                } else {
                    result = null;
                }
                stmt.free();
                break;
            }

            // NIP-05 operations
            case "saveNip05": {
                const { nip05, profile, fetchedAt } = payload;
                db.run(
                    "INSERT OR REPLACE INTO nip05 (nip05, profile, fetched_at) VALUES (?, ?, ?)",
                    [nip05, profile, fetchedAt]
                );
                result = undefined;
                break;
            }
            case "loadNip05": {
                const { nip05 } = payload;
                const stmt = db.prepare("SELECT profile, fetched_at FROM nip05 WHERE nip05 = ? LIMIT 1", [nip05]);
                if (stmt.step()) {
                    result = stmt.getAsObject();
                } else {
                    result = null;
                }
                stmt.free();
                break;
            }

            // Event operations
            case "getEvent": {
                const { id } = payload;
                const stmt = db.prepare("SELECT raw FROM events WHERE id = ? AND deleted = 0 LIMIT 1", [id]);
                if (stmt.step()) {
                    result = stmt.getAsObject();
                } else {
                    result = null;
                }
                stmt.free();
                break;
            }
            case "addDecryptedEvent": {
                const { wrapperId, serialized } = payload;
                db.run(
                    "INSERT OR REPLACE INTO decrypted_events (id, event) VALUES (?, ?)",
                    [wrapperId, serialized]
                );
                result = undefined;
                break;
            }
            case "getDecryptedEvent": {
                const { wrapperId } = payload;
                const stmt = db.prepare("SELECT event FROM decrypted_events WHERE id = ? LIMIT 1", [wrapperId]);
                if (stmt.step()) {
                    result = stmt.getAsObject();
                } else {
                    result = null;
                }
                stmt.free();
                break;
            }
            case "discardUnpublishedEvent": {
                const { id } = payload;
                db.run("DELETE FROM unpublished_events WHERE id = ?", [id]);
                result = undefined;
                break;
            }
            case "getUnpublishedEvents": {
                const stmt = db.prepare("SELECT event, relays FROM unpublished_events");
                result = [];
                while (stmt.step()) {
                    result.push(stmt.getAsObject());
                }
                stmt.free();
                break;
            }
            case "addUnpublishedEvent": {
                const { id, event, relays } = payload;

                // Store in unpublished_events table for retry tracking
                db.run(
                    "INSERT OR REPLACE INTO unpublished_events (id, event, relays) VALUES (?, ?, ?)",
                    [id, event, relays]
                );

                // Also store in main events table with relay_url = NULL
                // so it's queryable by subscriptions
                try {
                    const ndkEvent = new NDKEvent(undefined, JSON.parse(event));
                    setEventSync(db, ndkEvent, undefined);
                } catch (e) {
                    console.error('[addUnpublishedEvent] Failed to store event in main table:', e);
                }

                result = undefined;
                break;
            }

            // Relay operations
            case "getRelayStatus": {
                const { relayUrl } = payload;
                // Create table if needed
                db.run("CREATE TABLE IF NOT EXISTS relay_status (url TEXT PRIMARY KEY, info TEXT)");
                const stmt = db.prepare("SELECT info FROM relay_status WHERE url = ? LIMIT 1", [relayUrl]);
                if (stmt.step()) {
                    result = stmt.getAsObject();
                } else {
                    result = null;
                }
                stmt.free();
                break;
            }
            case "updateRelayStatus": {
                const { relayUrl, info } = payload;
                // Create table if needed
                db.run("CREATE TABLE IF NOT EXISTS relay_status (url TEXT PRIMARY KEY, info TEXT)");
                db.run(
                    "INSERT OR REPLACE INTO relay_status (url, info) VALUES (?, ?)",
                    [relayUrl, info]
                );
                result = undefined;
                break;
            }

            case "getProfiles": {
                // payload: { field?: string, fields?: string[], contains: string }
                const { field, fields, contains } = payload;
                const searchFields = fields || (field ? [field] : []);

                if (searchFields.length === 0) {
                    throw new Error("Either 'field' or 'fields' must be provided");
                }

                const conditions = searchFields
                    .map((f: string) => `json_extract(profile, '$.${f}') LIKE ?`)
                    .join(' OR ');

                const sql = `
                    SELECT pubkey, profile
                    FROM profiles
                    WHERE ${conditions}
                `;
                const param = `%${contains}%`;
                const params = searchFields.map(() => param);

                const stmt = db.prepare(sql, params);
                result = [];
                while (stmt.step()) {
                    const row = stmt.getAsObject();
                    try {
                        result.push({
                            pubkey: row.pubkey as string,
                            profile: JSON.parse(row.profile as string),
                        });
                    } catch {
                        // skip invalid profile
                    }
                }
                stmt.free();
                break;
            }
            case "export":
                result = db.export();
                break;
            case "getCacheStats":
                result = getCacheStatsSync(db);
                break;
            case "setEvent": {
                const { event, relay } = payload;
                const relayObj = relay ? { url: relay } : undefined;
                setEventSync(db, event, relayObj);
                result = undefined;
                break;
            }
            case "setEventBatch": {
                const { events } = payload;
                for (const item of events) {
                    const relayObj = item.relay ? { url: item.relay } : undefined;
                    setEventSync(db, item.event, relayObj);
                }
                result = undefined;
                break;
            }
            case "query": {
                const { filters, subId } = payload;
                const queryResult = querySync(db, filters, subId);

                if (queryResult.length > 0) {
                    // Convert to format suitable for binary encoding
                    const eventsForEncoding: EventForEncoding[] = queryResult.map((row: any) => {
                        // Parse the raw field if it's a JSON string
                        let eventData;
                        if (typeof row.raw === 'string') {
                            try {
                                const parsed = JSON.parse(row.raw);
                                eventData = {
                                    id: parsed[0] || row.id,
                                    pubkey: parsed[1] || row.pubkey,
                                    created_at: parsed[2] || row.created_at,
                                    kind: parsed[3] || row.kind,
                                    tags: parsed[4] || (typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : row.tags || []),
                                    content: parsed[5] || row.content,
                                    sig: parsed[6] || row.sig
                                };
                            } catch {
                                // Fallback to individual fields
                                eventData = {
                                    id: row.id,
                                    pubkey: row.pubkey,
                                    created_at: row.created_at,
                                    kind: row.kind,
                                    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : row.tags || [],
                                    content: row.content,
                                    sig: row.sig
                                };
                            }
                        } else {
                            // No raw field or not a string, use individual fields
                            eventData = {
                                id: row.id,
                                pubkey: row.pubkey,
                                created_at: row.created_at,
                                kind: row.kind,
                                tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : row.tags || [],
                                content: row.content,
                                sig: row.sig
                            };
                        }

                        return {
                            id: eventData.id || '',
                            pubkey: eventData.pubkey || '',
                            created_at: eventData.created_at || 0,
                            kind: eventData.kind || 0,
                            sig: eventData.sig || '',
                            content: eventData.content || '',
                            tags: Array.isArray(eventData.tags) ? eventData.tags : [],
                            relay_url: row.relay_url || null
                        };
                    });

                    // Encode to binary
                    const buffer = encodeEvents(eventsForEncoding);

                    // Prepare response with binary data
                    result = {
                        type: 'binary',
                        buffer,
                        eventCount: eventsForEncoding.length,
                    };
                } else {
                    // Empty result
                    result = {
                        type: 'binary',
                        buffer: new ArrayBuffer(0),
                        eventCount: 0,
                    };
                }
                break;
            }
            case "getCacheData": {
                const { namespace, key, maxAgeInSecs } = payload;
                const now = Math.floor(Date.now() / 1000);

                const stmt = db.prepare("SELECT data, cached_at FROM cache_data WHERE namespace = ? AND key = ?");
                stmt.bind([namespace, key]);

                if (stmt.step()) {
                    const row = stmt.getAsObject();
                    const cachedAt = row.cached_at as number;

                    // Check if expired
                    if (maxAgeInSecs && now - cachedAt > maxAgeInSecs) {
                        stmt.free();
                        result = undefined;
                        break;
                    }

                    result = JSON.parse(row.data as string);
                    stmt.free();
                } else {
                    result = undefined;
                    stmt.free();
                }
                break;
            }
            case "setCacheData": {
                const { namespace, key, data } = payload;
                const now = Math.floor(Date.now() / 1000);
                const dataJson = JSON.stringify(data);

                db.run("INSERT OR REPLACE INTO cache_data (namespace, key, data, cached_at) VALUES (?, ?, ?, ?)", [
                    namespace,
                    key,
                    dataJson,
                    now,
                ]);
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

        // Check if we should use transferables
        const transferables: Transferable[] = [];
        if (result && result.type === 'binary' && result.buffer) {
            transferables.push(result.buffer);
        }

        if (transferables.length > 0) {
            // Use any cast to handle Web Worker postMessage signature
            (self as any).postMessage(response, transferables);
        } else {
            self.postMessage(response);
        }
    } catch (error: any) {
        console.error(`Worker: Error processing command ${id} (${type}):`, error);
        const errorResponse = {
            _protocol: PROTOCOL_NAME,
            _version: PACKAGE_VERSION,
            id,
            error: { message: error.message, stack: error.stack },
        };
        self.postMessage(errorResponse);
    }
};

// Add a global error handler
self.addEventListener("error", (event) => {
    console.error("Worker: Uncaught error:", event.message, event.error);
});
