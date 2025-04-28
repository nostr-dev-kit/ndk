import type { NDKCacheEntry, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Fetches a user profile by pubkey from the SQLite WASM database.
 */
export async function fetchProfile(
    this: NDKCacheAdapterSqliteWasm,
    pubkey: string,
): Promise<NDKCacheEntry<NDKUserProfile> | null> {
    const stmt = "SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1";
    const result = this.db.exec(stmt, [pubkey]);
    if (result && result[0] && result[0].values && result[0].values[0]) {
        const [profileStr, updatedAt] = result[0].values[0];
        try {
            const profile = JSON.parse(profileStr);
            return { ...profile, cachedAt: updatedAt };
        } catch {
            return null;
        }
    }
    return null;
}
