import NDK, { NDKNutzap } from "@nostr-dev-kit/ndk";
import * as SQLite from "expo-sqlite";
import { NDKCacheAdapterSqlite } from "../../cache-adapter/sqlite.js";

function withDb(ndk: NDK) {
    const db = (ndk.cacheAdapter as NDKCacheAdapterSqlite).db;
    if (!(db instanceof SQLite.SQLiteDatabase)) {
        throw new Error("Database is not an instance of SQLiteDatabase");
    }
    return db;
}

export interface NDKDBNutzap {
    event_id: string;
    status: string;
    claim_at: number;
    claimed_at: number;
}

export function getNutzaps(ndk: NDK): NDKDBNutzap[] {
    const db = withDb(ndk);
    const nutzaps = db.getAllSync("SELECT * FROM wallet_nutzaps") as NDKDBNutzap[];

    return nutzaps;
}

export function saveNutzap(ndk: NDK, nutzap: NDKNutzap, status?: string, claimedAt?: number, txEventId?: string) {
    const db = withDb(ndk);

    db.runSync(
        `INSERT OR REPLACE INTO wallet_nutzaps (event_id, status, claimed_at, tx_event_id) 
        VALUES (?, ?, ?, ?)`, 
        [nutzap.id, status, claimedAt, txEventId]
    );
}
