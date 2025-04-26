import type { Hexpubkey, NDKCacheEntry, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Synchronously fetches all user profiles from the SQLite WASM database.
 */
/**
 * Synchronous getAllProfiles is NOT supported in Web Worker mode.
 * BREAKING CHANGE: If useWorker is true, this will throw.
 * See CHANGELOG.md for details.
 */
export function getAllProfilesSync(
    this: NDKCacheAdapterSqliteWasm
): Map<Hexpubkey, NDKCacheEntry<NDKUserProfile>> {
    if (this.useWorker) {
        throw new Error("getAllProfilesSync is not supported in Web Worker mode. Use an async method instead.");
    }
    const stmt = "SELECT pubkey, profile, updated_at FROM profiles";
    const result = this.db.exec(stmt);
    const profiles = new Map<Hexpubkey, NDKCacheEntry<NDKUserProfile>>();
    if (result && result[0] && result[0].values) {
        for (const row of result[0].values) {
            const [pubkey, profileStr, updatedAt] = row;
            try {
                const profile = JSON.parse(profileStr);
                profiles.set(pubkey, { ...profile, cachedAt: updatedAt });
            } catch {
                // skip invalid profile
            }
        }
    }
    return profiles;
}