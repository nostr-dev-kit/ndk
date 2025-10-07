/**
 * Database schema for cache-sqlite-wasm.
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
    cashu_mint_info: `
        CREATE TABLE IF NOT EXISTS cashu_mint_info (
            mint_url TEXT PRIMARY KEY,
            info TEXT NOT NULL,
            cached_at INTEGER NOT NULL
        );
    `,
    cashu_mint_keys: `
        CREATE TABLE IF NOT EXISTS cashu_mint_keys (
            mint_url TEXT PRIMARY KEY,
            keys TEXT NOT NULL,
            cached_at INTEGER NOT NULL
        );
    `,
    event_relays: `
        CREATE TABLE IF NOT EXISTS event_relays (
            event_id TEXT NOT NULL,
            relay_url TEXT NOT NULL,
            seen_at INTEGER NOT NULL,
            PRIMARY KEY (event_id, relay_url)
        );
        CREATE INDEX IF NOT EXISTS idx_event_relays_event_id ON event_relays(event_id);
    `,
};
