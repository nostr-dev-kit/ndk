import type * as SQLite from "expo-sqlite";

export const migrations = [
    {
        version: 0,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync(
                `CREATE TABLE IF NOT EXISTS unpublished_events (
                    id TEXT PRIMARY KEY,
                    event TEXT,
                    relays TEXT,
                    last_try_at INTEGER
                );`,
            );

            db.execSync(
                `CREATE TABLE IF NOT EXISTS events (
                    id TEXT PRIMARY KEY,
                    created_at INTEGER,
                    pubkey TEXT,
                    event TEXT,
                    kind INTEGER,
                    relay TEXT
                );`,
            );
            db.execSync(
                `CREATE TABLE IF NOT EXISTS profiles (
                    pubkey TEXT PRIMARY KEY,
                    profile TEXT,
                    catched_at INTEGER
                );`,
            );
            db.execSync(
                `CREATE TABLE IF NOT EXISTS relay_status (
                    url TEXT PRIMARY KEY,
                    lastConnectedAt INTEGER,
                    dontConnectBefore INTEGER
                );`,
            );
            // New table for event tags
            db.execSync(
                `CREATE TABLE IF NOT EXISTS event_tags (
                    event_id TEXT,
                    tag TEXT,
                    value TEXT,
                    PRIMARY KEY (event_id, tag)
                );`,
            );

            db.execSync("CREATE INDEX IF NOT EXISTS idx_events_pubkey ON events (pubkey);");
            db.execSync("CREATE INDEX IF NOT EXISTS idx_events_kind ON events (kind);");
            db.execSync("CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags (tag);");
        },
    },
    {
        version: 1,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync("ALTER TABLE profiles ADD COLUMN created_at INTEGER;");
        },
    },
    {
        version: 2,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync("CREATE INDEX IF NOT EXISTS idx_profiles_pubkey ON profiles (pubkey);");
            db.execSync("DROP INDEX IF EXISTS idx_event_tags_tag;");
            db.execSync("CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags (tag, value);");
        },
    },
    {
        version: 3,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync(`CREATE TABLE IF NOT EXISTS wot (
                pubkey TEXT PRIMARY KEY,
                wot INTEGER
            );`);
        },
    },
    {
        version: 4,
        // the format we use to reference to event ids has changed, so we need to truncate the tables
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync("DELETE FROM events;");
            db.execSync("DELETE FROM event_tags;");
        },
    },
    {
        version: 5, // Increment the version number
        up: (db: SQLite.SQLiteDatabase) => {
            // Temporarily disable foreign key constraints
            db.execSync("PRAGMA foreign_keys=off;");

            // Rename the existing table
            db.execSync("ALTER TABLE event_tags RENAME TO event_tags_old;");

            // Create the new table without a primary key
            db.execSync(`
                CREATE TABLE event_tags (
                    event_id TEXT,
                    tag TEXT,
                    value TEXT
                );
            `);

            // Copy data back into the new table
            db.execSync(`
                INSERT INTO event_tags (event_id, tag, value)
                SELECT event_id, tag, value FROM event_tags_old;
            `);

            // Drop the old table
            db.execSync("DROP TABLE event_tags_old;");

            // Add a non-unique index on event_id and tag
            db.execSync(`
                CREATE INDEX IF NOT EXISTS idx_event_tags_event_id_tag ON event_tags (event_id, tag);
            `);

            // Re-enable foreign key constraints
            db.execSync("PRAGMA foreign_keys=on;");
        },
    },

    {
        version: 6,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync("DROP TABLE IF EXISTS wallet_nutzaps;"); // XXX
            db.execSync(`CREATE TABLE IF NOT EXISTS wallet_nutzaps (
                event_id TEXT PRIMARY KEY UNIQUE,
                status TEXT,
                claimed_at INTEGER,
                tx_event_id TEXT
            );`);
        },
    },

    {
        version: 7,
        up: (db: SQLite.SQLiteDatabase) => {
            const profiles = db.getAllSync("SELECT * FROM profiles;") as {
                pubkey: string;
                profile: string;
            }[];

            db.execSync(`
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
                    db.runSync(
                        "UPDATE profiles SET name = ?, about = ?, picture = ?, banner = ?, nip05 = ?, lud16 = ?, lud06 = ?, display_name = ?, website = ? WHERE pubkey = ?;",
                        [
                            profileJson.name,
                            profileJson.about,
                            profileJson.image ?? profileJson.picture,
                            profileJson.banner,
                            profileJson.nip05,
                            profileJson.lud16,
                            profileJson.lud06,
                            profileJson.displayName,
                            profileJson.website,
                            profile.pubkey,
                        ],
                    );
                } catch (_e) {
                    db.runSync("DELETE FROM profiles WHERE pubkey = ?;", [profile.pubkey]);
                }
            }
        },
    },

    {
        version: 8,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync(`
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
    },

    {
        version: 9,
        up: (db: SQLite.SQLiteDatabase) => {
            // Log current indexes to verify
            const _indexes = db.getAllSync(`PRAGMA index_list('event_tags');`);

            // Proceed with dropping and recreating
            db.execSync(`
                ALTER TABLE event_tags RENAME TO event_tags_old;
                CREATE TABLE event_tags (
                    event_id TEXT NOT NULL,
                    tag TEXT NOT NULL,
                    value TEXT COLLATE NOCASE
                );
                INSERT INTO event_tags (event_id, tag, value) SELECT event_id, tag, value FROM event_tags_old;
                DROP TABLE event_tags_old;
                CREATE INDEX IF NOT EXISTS idx_event_tags_event_id_tag ON event_tags (event_id, tag);
                CREATE INDEX IF NOT EXISTS idx_event_tags_tag_value ON event_tags (tag, value);
            `);
        },
    },

    {
        version: 10,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync(`
                CREATE TABLE IF NOT EXISTS nutzap_monitor_state (
                    event_id TEXT PRIMARY KEY,
                    status TEXT NOT NULL,
                    nutzap TEXT,
                    redeemed_by_id TEXT,
                    error_message TEXT,
                    redeemed_amount INTEGER,
                    updated_at INTEGER
                );
            `);
        },
    },

    {
        version: 11,
        up: (db: SQLite.SQLiteDatabase) => {
            // Drop the old nutzaps table as it's no longer needed
            db.execSync("DROP TABLE IF EXISTS wallet_nutzaps;");
        },
    },

    {
        version: 12,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync(`
                CREATE TABLE IF NOT EXISTS mint_info (
                    url TEXT PRIMARY KEY,
                    payload TEXT,
                    created_at INTEGER,
                    updated_at INTEGER
                )
            `);
        },
    },

    // New migration for Cashu mint_keys table
    {
        version: 13,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync(`
                CREATE TABLE IF NOT EXISTS mint_keys (
                    url TEXT,
                    keyset_id TEXT,
                    payload TEXT,
                    created_at INTEGER,
                    updated_at INTEGER,
                    PRIMARY KEY (url, keyset_id)
                )
            `);
        },
    },

    {
        version: 14,
        up: (db: SQLite.SQLiteDatabase) => {
            db.execSync(`
                CREATE TABLE IF NOT EXISTS relays (
                    url TEXT PRIMARY KEY,
                    connect BOOLEAN DEFAULT 1,
                    read BOOLEAN DEFAULT 1,
                    write BOOLEAN DEFAULT 1
                );
            `);
        },
    },

    {
        version: 15,
        up: (db: SQLite.SQLiteDatabase) => {
            // Create a new table for storing decrypted events
            db.execSync(`
                CREATE TABLE IF NOT EXISTS decrypted_events (
                    event_id TEXT PRIMARY KEY,
                    event TEXT NOT NULL,
                    decrypted_at INTEGER NOT NULL
                );
                
                CREATE INDEX IF NOT EXISTS idx_decrypted_events_event_id 
                ON decrypted_events (event_id);
            `);
        },
    },
];
