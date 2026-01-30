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
            deleted INTEGER DEFAULT 0,
            relay_url TEXT
        )
    `,
    events_indexes: [
        "CREATE INDEX IF NOT EXISTS idx_events_pubkey ON events(pubkey)",
        "CREATE INDEX IF NOT EXISTS idx_events_kind ON events(kind)",
        "CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_events_kind_created_at ON events(kind, created_at)",
        "CREATE INDEX IF NOT EXISTS idx_events_pubkey_created_at ON events(pubkey, created_at)",
    ],
    profiles: `
        CREATE TABLE IF NOT EXISTS profiles (
            pubkey TEXT PRIMARY KEY,
            profile TEXT,
            updated_at INTEGER
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
        )
    `,
    event_tags_indexes: [
        "CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON event_tags(event_id)",
        "CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags(tag)",
        "CREATE INDEX IF NOT EXISTS idx_event_tags_tag_value ON event_tags(tag, value)",
    ],
    cache_data: `
        CREATE TABLE IF NOT EXISTS cache_data (
            namespace TEXT NOT NULL,
            key TEXT NOT NULL,
            data TEXT NOT NULL,
            cached_at INTEGER NOT NULL,
            PRIMARY KEY (namespace, key)
        )
    `,
    cache_data_indexes: [
        "CREATE INDEX IF NOT EXISTS idx_cache_data_namespace ON cache_data(namespace)",
    ],
    nip05: `
        CREATE TABLE IF NOT EXISTS nip05 (
            nip05 TEXT PRIMARY KEY,
            profile TEXT,
            fetched_at INTEGER NOT NULL
        );
    `,
};
