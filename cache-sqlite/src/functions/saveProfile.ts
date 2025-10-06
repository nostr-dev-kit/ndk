import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Saves a user profile to the SQLite database using better-sqlite3.
 */
export async function saveProfile(this: NDKCacheAdapterSqlite, pubkey: string, profile: NDKUserProfile): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = `
        INSERT OR REPLACE INTO profiles (pubkey, profile, updated_at)
        VALUES (?, ?, ?)
    `;
    const profileStr = JSON.stringify(profile);
    const updatedAt = Math.floor(Date.now() / 1000);

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        prepared.run(pubkey, profileStr, updatedAt);
    } catch (e) {
        console.error("Error saving profile:", e);
        throw e;
    }
}
