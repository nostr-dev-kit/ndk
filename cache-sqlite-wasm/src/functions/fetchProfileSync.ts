import type { NDKCacheEntry, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Synchronously fetches a user profile by pubkey.
 * In worker mode, reads from LRU cache only.
 * In non-worker mode, checks LRU first, then falls back to database.
 */
export function fetchProfileSync(
    this: NDKCacheAdapterSqliteWasm,
    pubkey: string,
): NDKCacheEntry<NDKUserProfile> | null {
    // In worker mode, return from LRU cache only
    if (this.useWorker) {
        return this.metadataCache?.getProfile(pubkey) || null;
    }

    // In non-worker mode, check LRU first
    const cached = this.metadataCache?.getProfile(pubkey);
    if (cached) {
        return cached;
    }

    // Fall back to database
    if (!this.db) return null;

    const stmt = "SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1";
    const results = this.db.exec(stmt, [pubkey]);
    if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
        const [profileStr, updatedAt] = results[0].values[0];
        try {
            const profile = JSON.parse(profileStr as string);
            const entry = { ...profile, cachedAt: updatedAt };
            // Update LRU cache
            this.metadataCache?.setProfile(pubkey, entry);
            return entry;
        } catch {
            return null;
        }
    }
    return null;
}
