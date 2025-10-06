import type { NDKCacheEntry, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Synchronously fetches a user profile by pubkey from the SQLite WASM database.
 */
/**
 * Synchronous profile fetch is NOT supported in Web Worker mode.
 * BREAKING CHANGE: If useWorker is true, this will throw.
 * See CHANGELOG.md for details.
 */
export function fetchProfileSync(
    this: NDKCacheAdapterSqliteWasm,
    pubkey: string,
): NDKCacheEntry<NDKUserProfile> | null {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = "SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1";
    const results = this.db.exec(stmt, [pubkey]);
    if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
        const [profileStr, updatedAt] = results[0].values[0];
        try {
            const profile = JSON.parse(profileStr as string);
            return { ...profile, cachedAt: updatedAt };
        } catch {
            return null;
        }
    }
    return null;
}
