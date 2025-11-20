/**
 * Runs all necessary database migrations.
 * Applies the schema for events, profiles, decrypted_events, and unpublished_events tables.
 * @param db The SQLite WASM database instance
 */
import type { SQLDatabase } from "../types";
import { SCHEMA } from "./schema";

const CURRENT_VERSION = 5;

function getCurrentVersion(db: SQLDatabase): number {
    try {
        const result = db.exec("SELECT version FROM schema_version LIMIT 1");
        if (result && result.length > 0 && result[0].values && result[0].values.length > 0) {
            return result[0].values[0][0] as number;
        }
    } catch {
        // Table doesn't exist, version 0
    }
    return 0;
}

function setVersion(db: SQLDatabase, version: number): void {
    db.run("CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)");
    db.run("DELETE FROM schema_version");
    db.run("INSERT INTO schema_version (version) VALUES (?)", [version]);
}

export async function runMigrations(db: SQLDatabase): Promise<void> {
    const currentVersion = getCurrentVersion(db);

    try {
        // Always ensure all tables exist (idempotent)
        db.exec(SCHEMA.events);
        db.exec(SCHEMA.profiles);
        db.exec(SCHEMA.decrypted_events);
        db.exec(SCHEMA.unpublished_events);
        db.exec(SCHEMA.event_tags);
        db.exec(SCHEMA.cache_data);

        // Version 1: Added nip05 table
        if (currentVersion < 1) {
            db.exec(SCHEMA.nip05);
        }

        // Version 2: Ensure nip05 table exists (for databases that might have been corrupted)
        if (currentVersion < 2) {
            db.exec(SCHEMA.nip05);
        }

        // Version 3: Simplify relay tracking - add relay_url to events, drop event_relays table
        if (currentVersion < 3) {
            // Add relay_url column to events table
            try {
                db.exec("ALTER TABLE events ADD COLUMN relay_url TEXT");
            } catch (e) {
                // Column might already exist, that's fine
            }

            // Drop event_relays table - we only track first relay now
            try {
                db.exec("DROP TABLE IF EXISTS event_relays");
                db.exec("DROP INDEX IF EXISTS idx_event_relays_event_id");
            } catch (e) {
                // Table might not exist, that's fine
            }
        }

        // Version 4: Add compound indexes for query performance
        if (currentVersion < 4) {
            // Create compound indexes for common query patterns
            db.exec("CREATE INDEX IF NOT EXISTS idx_events_kind_created_at ON events(kind, created_at)");
            db.exec("CREATE INDEX IF NOT EXISTS idx_events_pubkey_created_at ON events(pubkey, created_at)");
            db.exec("CREATE INDEX IF NOT EXISTS idx_event_tags_tag_value ON event_tags(tag, value)");
        }

        // Version 5: Ensure raw column exists (for databases created before this column was added)
        if (currentVersion < 5) {
            try {
                // Check if raw column exists
                const tableInfo = db.exec("PRAGMA table_info(events)");
                const columns = tableInfo[0]?.values?.map(row => row[1]) || [];

                if (!columns.includes('raw')) {
                    db.exec("ALTER TABLE events ADD COLUMN raw TEXT");
                }
            } catch (e) {
                console.error('[NDK Cache] Failed to add raw column:', e);
                // Column might already exist, that's fine
            }
        }

        setVersion(db, CURRENT_VERSION);

        // Verify nip05 table was created
        try {
            const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='nip05'");
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
