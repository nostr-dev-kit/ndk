import type { NDKCacheEntry, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Fetches a user profile by pubkey from the SQLite WASM database.
 * Supports both worker and direct database modes.
 */
export async function fetchProfile(
    this: NDKCacheAdapterSqliteWasm,
    pubkey: string,
): Promise<NDKCacheEntry<NDKUserProfile> | null> {
    await this.ensureInitialized();

    // Check LRU cache first
    const cached = this.metadataCache?.getProfile(pubkey);
    if (cached) {
        return cached;
    }

    if (this.useWorker) {
        const result = await this.postWorkerMessage<{ profile?: string; updated_at?: number }>({
            type: "fetchProfile",
            payload: { pubkey },
        });
        if (result && result.profile) {
            try {
                const profile = JSON.parse(result.profile);
                const entry = { ...profile, cachedAt: result.updated_at };
                // Update LRU cache
                this.metadataCache?.setProfile(pubkey, entry);
                return entry;
            } catch {
                return null;
            }
        }
        return null;
    } else {
        if (!this.db) throw new Error("Database not initialized");

        const results = this.db.exec("SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1", [pubkey]);
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
}
