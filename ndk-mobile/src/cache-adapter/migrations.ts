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
    {
        version: 2,
        up: async (db: SQLite.SQLiteDatabase) => {
            await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_profiles_pubkey ON profiles (pubkey);`);
            await db.execAsync(`DROP INDEX IF EXISTS idx_event_tags_tag;`);
            await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags (tag, value);`);
        },
    },
    {
        version: 3,
        up: async (db: SQLite.SQLiteDatabase) => {
            await db.execAsync(`CREATE TABLE IF NOT EXISTS wot (
                pubkey TEXT PRIMARY KEY,
                wot INTEGER
            );`);
        },
    },
    {
        version: 4,
        // the format we use to reference to event ids has changed, so we need to truncate the tables
        up: async (db: SQLite.SQLiteDatabase) => {
            await db.execAsync(`DELETE FROM events;`);
            await db.execAsync(`DELETE FROM event_tags;`);
        },
    },
    {
        version: 5, // Increment the version number
        up: async (db: SQLite.SQLiteDatabase) => {
            // Temporarily disable foreign key constraints
            await db.execAsync('PRAGMA foreign_keys=off;');
    
            // Rename the existing table
            await db.execAsync('ALTER TABLE event_tags RENAME TO event_tags_old;');
    
            // Create the new table without a primary key
            await db.execAsync(`
                CREATE TABLE event_tags (
                    event_id TEXT,
                    tag TEXT,
                    value TEXT
                );
            `);
    
            // Copy data back into the new table
            await db.execAsync(`
                INSERT INTO event_tags (event_id, tag, value)
                SELECT event_id, tag, value FROM event_tags_old;
            `);
    
            // Drop the old table
            await db.execAsync('DROP TABLE event_tags_old;');
    
            // Add a non-unique index on event_id and tag
            await db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_event_tags_event_id_tag ON event_tags (event_id, tag);
            `);
    
            // Re-enable foreign key constraints
            await db.execAsync('PRAGMA foreign_keys=on;');
        },
    },
    
    {
        version: 6,
        up: async (db: SQLite.SQLiteDatabase) => {
            await db.execAsync(`DROP TABLE IF EXISTS wallet_nutzaps;`); // XXX
            await db.execAsync(`CREATE TABLE IF NOT EXISTS wallet_nutzaps (
                event_id TEXT PRIMARY KEY UNIQUE,
                status TEXT,
                claimed_at INTEGER,
                tx_event_id TEXT
            );`);
        },
    },

    {
        version: 7,
        up: async (db: SQLite.SQLiteDatabase) => {
            const profiles = await db.getAllSync(`SELECT * FROM profiles;`) as { pubkey: string, profile: string }[];
            
            await db.execAsync(`
                ALTER TABLE profiles ADD COLUMN name TEXT;
                ALTER TABLE profiles ADD COLUMN about TEXT;
                ALTER TABLE profiles ADD COLUMN picture TEXT;
                ALTER TABLE profiles ADD COLUMN banner TEXT;
                ALTER TABLE profiles ADD COLUMN nip05 TEXT;
                ALTER TABLE profiles ADD COLUMN lud16 TEXT;
                ALTER TABLE profiles ADD COLUMN lud06 TEXT;
                ALTER TABLE profiles ADD COLUMN display_name TEXT;
                ALTER TABLE profiles ADD COLUMN website TEXT;
            `);
            
            for (const profile of profiles) {
                try {
                    const profileJson = JSON.parse(profile.profile);
                    await db.runAsync(`UPDATE profiles SET name = ?, about = ?, picture = ?, banner = ?, nip05 = ?, lud16 = ?, lud06 = ?, display_name = ?, website = ? WHERE pubkey = ?;`, [profileJson.name, profileJson.about, profileJson.image ?? profileJson.picture, profileJson.banner, profileJson.nip05, profileJson.lud16, profileJson.lud06, profileJson.displayName, profileJson.website, profile.pubkey]);
                } catch (e) {
                    await db.runAsync(`DELETE FROM profiles WHERE pubkey = ?;`, [profile.pubkey]);
                }
            }
        },
    },

    {
        version: 8,
        up: async (db: SQLite.SQLiteDatabase) => {
            await db.execAsync(`
                -- Create the new table with NOCASE collation
                CREATE TABLE event_tags_new (
                    event_id TEXT NOT NULL,
                    tag TEXT NOT NULL,
                    value TEXT COLLATE NOCASE,
                    PRIMARY KEY (event_id, tag, value)
                );

                -- Insert deduplicated data (group by case-insensitive value)
                INSERT INTO event_tags_new (event_id, tag, value)
                SELECT event_id, tag, value
                FROM event_tags
                GROUP BY event_id, tag, LOWER(value);  -- Deduplicate by lowercase value

                -- Drop the old table
                DROP TABLE event_tags;

                -- Rename the new table
                ALTER TABLE event_tags_new RENAME TO event_tags;
            `);
        },
    }
];
