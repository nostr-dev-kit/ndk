import type { NDKCacheEntry, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Fetches a user profile by pubkey from the SQLite database using better-sqlite3.
 */
export async function fetchProfile(
    this: NDKCacheAdapterSqlite,
    pubkey: string,
): Promise<NDKCacheEntry<NDKUserProfile> | null> {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = "SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1";

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        const result = prepared.get(pubkey) as { profile?: string; updated_at?: number } | undefined;

        if (result && result.profile) {
            try {
                const profile = JSON.parse(result.profile);
                return { ...profile, cachedAt: result.updated_at };
            } catch {
                return null;
            }
        }
        return null;
    } catch (e) {
        console.error("Error fetching profile:", e);
        return null;
    }
}
