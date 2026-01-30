/**
 * Runs all necessary database migrations.
 * Applies the schema for events, profiles, decrypted_events, and unpublished_events tables.
 * @param db The SQLite WASM database instance
 */
import type { Database } from "../types";
import { SCHEMA } from "./schema";

const CURRENT_VERSION = 5;

async function getCurrentVersion(db: Database): Promise<number> {
    try {
        const result = await db.exec("SELECT version FROM schema_version LIMIT 1");
        if (result && result.length > 0 && result[0].values && result[0].values.length > 0) {
            return result[0].values[0][0] as number;
        }
    } catch {
        // Table doesn't exist, version 0
    }
    return 0;
}

async function setVersion(db: Database, version: number): Promise<void> {
    await db.run("CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)");
    await db.run("DELETE FROM schema_version");
    await db.run("INSERT INTO schema_version (version) VALUES (?)", [version]);
}

export async function runMigrations(db: Database): Promise<void> {
    const currentVersion = await getCurrentVersion(db);
    console.log("[Migrations] Current schema version:", currentVersion);

    try {
        // Always ensure all tables exist (idempotent)
        console.log("[Migrations] Creating events table...");
        await db.exec(SCHEMA.events);

        // Verify events table was created
        const eventsCheck = await db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='events'");
        if (!eventsCheck[0]?.values?.length) {
            throw new Error("Failed to create events table!");
        }
        console.log("[Migrations] Events table verified");

        for (const idx of SCHEMA.events_indexes) {
            await db.exec(idx);
        }
        console.log("[Migrations] Events indexes created");
        console.log("[Migrations] Creating profiles table...");
        await db.exec(SCHEMA.profiles);
        console.log("[Migrations] Creating decrypted_events table...");
        await db.exec(SCHEMA.decrypted_events);
        console.log("[Migrations] Creating unpublished_events table...");
        await db.exec(SCHEMA.unpublished_events);
        console.log("[Migrations] Creating event_tags table...");
        await db.exec(SCHEMA.event_tags);
        for (const idx of SCHEMA.event_tags_indexes) {
            await db.exec(idx);
        }
        console.log("[Migrations] Creating cache_data table...");
        await db.exec(SCHEMA.cache_data);
        for (const idx of SCHEMA.cache_data_indexes) {
            await db.exec(idx);
        }
        console.log("[Migrations] Base tables created successfully");

        // Version 1: Added nip05 table
        if (currentVersion < 1) {
            await db.exec(SCHEMA.nip05);
        }

        // Version 2: Ensure nip05 table exists (for databases that might have been corrupted)
        if (currentVersion < 2) {
            await db.exec(SCHEMA.nip05);
        }

        // Version 3: Simplify relay tracking - add relay_url to events, drop event_relays table
        if (currentVersion < 3) {
            // Add relay_url column to events table if it doesn't exist
            const tableInfo = await db.exec("PRAGMA table_info(events)");
            const columns = tableInfo[0]?.values?.map((row: any[]) => row[1]) || [];

            if (!columns.includes('relay_url')) {
                await db.exec("ALTER TABLE events ADD COLUMN relay_url TEXT");
            }

            // Drop event_relays table - we only track first relay now
            await db.exec("DROP TABLE IF EXISTS event_relays");
            await db.exec("DROP INDEX IF EXISTS idx_event_relays_event_id");
        }

        // Version 4: Add compound indexes for query performance
        // (These are now created with the tables above, but keep for compatibility with older schemas)
        if (currentVersion < 4) {
            try {
                await db.exec("CREATE INDEX IF NOT EXISTS idx_events_kind_created_at ON events(kind, created_at)");
            } catch { /* Index might already exist */ }
            try {
                await db.exec("CREATE INDEX IF NOT EXISTS idx_events_pubkey_created_at ON events(pubkey, created_at)");
            } catch { /* Index might already exist */ }
            try {
                await db.exec("CREATE INDEX IF NOT EXISTS idx_event_tags_tag_value ON event_tags(tag, value)");
            } catch { /* Index might already exist */ }
        }

        // Version 5: Ensure raw column exists (for databases created before this column was added)
        if (currentVersion < 5) {
            try {
                // Check if raw column exists
                const tableInfo = await db.exec("PRAGMA table_info(events)");
                const columns = tableInfo[0]?.values?.map((row: any[]) => row[1]) || [];

                if (!columns.includes('raw')) {
                    await db.exec("ALTER TABLE events ADD COLUMN raw TEXT");
                }
            } catch (e) {
                console.error('[NDK Cache] Failed to add raw column:', e);
                // Column might already exist, that's fine
            }
        }

        await setVersion(db, CURRENT_VERSION);

        // Verify nip05 table was created
        try {
            const tables = await db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='nip05'");
            if (!tables || tables.length === 0 || !tables[0].values || tables[0].values.length === 0) {
                console.error('[NDK Cache] ERROR: nip05 table was not created!');
            }
        } catch (verifyError) {
            console.error('[NDK Cache] Failed to verify nip05 table:', verifyError);
        }
    } catch (error) {
        console.error('[NDK Cache] Migration failed:', error);
        throw error;
    }
}
