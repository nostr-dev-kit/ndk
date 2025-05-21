/**
 * Database schema for ndk-cache-sqlite-wasm.
 * Mirrors the schema used in ndk-mobile's SQLite adapter.
 *
 * This is a TypeScript representation of the SQL schema.
 * The actual SQL statements will be used in migrations.ts.
 */

export const SCHEMA = {
    events: `
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            pubkey TEXT,
            created_at INTEGER,
            kind INTEGER,
            tags TEXT,
            content TEXT,
            sig TEXT,
            raw TEXT,
            deleted INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_events_pubkey ON events(pubkey);
        CREATE INDEX IF NOT EXISTS idx_events_kind ON events(kind);
        CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
    `,
    profiles: `
        CREATE TABLE IF NOT EXISTS profiles (
            pubkey TEXT PRIMARY KEY,
            profile TEXT,
            updated_at INTEGER
        );
    `,
    nutzap_monitor_state: `
        CREATE TABLE IF NOT EXISTS nutzap_monitor_state (
            id TEXT PRIMARY KEY,
            state TEXT
        );
    `,
    decrypted_events: `
        CREATE TABLE IF NOT EXISTS decrypted_events (
            id TEXT PRIMARY KEY,
            event TEXT
        );
    `,
    unpublished_events: `
        CREATE TABLE IF NOT EXISTS unpublished_events (
            id TEXT PRIMARY KEY,
            event TEXT,
            relays TEXT,
            lastTryAt INTEGER
        );
    `,
    event_tags: `
        CREATE TABLE IF NOT EXISTS event_tags (
            event_id TEXT NOT NULL,
            tag TEXT NOT NULL,
            value TEXT,
            PRIMARY KEY (event_id, tag, value)
        );
        CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON event_tags(event_id);
        CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags(tag);
    `,
    // Add more tables as needed to match ndk-mobile
};
