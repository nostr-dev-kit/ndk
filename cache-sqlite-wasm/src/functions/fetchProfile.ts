import type { NDKCacheEntry, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Fetches a user profile by pubkey from the SQLite WASM database via worker.
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
}
