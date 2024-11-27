import * as SQLite from 'expo-sqlite';

export const migrations = [
    {
        version: 0,
        up: async (db: SQLite.SQLiteDatabase) => {
            await db.execAsync(
                `CREATE TABLE IF NOT EXISTS unpublished_events (
                    id TEXT PRIMARY KEY,
                    event TEXT,
                    relays TEXT,
                    last_try_at INTEGER
                );`
            );

            await db.execAsync(
                `CREATE TABLE IF NOT EXISTS events (
                    id TEXT PRIMARY KEY,
                    created_at INTEGER,
                    pubkey TEXT,
                    event TEXT,
                    kind INTEGER,
                    relay TEXT
                );`
            );
            await db.execAsync(
                `CREATE TABLE IF NOT EXISTS profiles (
                    pubkey TEXT PRIMARY KEY,
                    profile TEXT,
                    catched_at INTEGER
                );`
            );
            await db.execAsync(
                `CREATE TABLE IF NOT EXISTS relay_status (
                    url TEXT PRIMARY KEY,
                    lastConnectedAt INTEGER,
                    dontConnectBefore INTEGER
                );`
            );
            // New table for event tags
            await db.execAsync(
                `CREATE TABLE IF NOT EXISTS event_tags (
                    event_id TEXT,
                    tag TEXT,
                    value TEXT,
                    PRIMARY KEY (event_id, tag)
                );`
            );

            await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_events_pubkey ON events (pubkey);`);
            await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_events_kind ON events (kind);`);
            await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_events_tags_tag ON event_tags (tag);`);
        },
    },
    {
        version: 1,
        up: async (db: SQLite.SQLiteDatabase) => {
            await db.execAsync(`ALTER TABLE profiles ADD COLUMN created_at INTEGER;`);
        },
    },
];