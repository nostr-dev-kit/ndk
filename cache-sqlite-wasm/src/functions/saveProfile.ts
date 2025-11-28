import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Saves a user profile by pubkey to the SQLite WASM database via worker.
 */
export async function saveProfile(
    this: NDKCacheAdapterSqliteWasm,
    pubkey: string,
    profile: NDKUserProfile,
): Promise<void> {
    const profileStr = JSON.stringify(profile);
    const updatedAt = Math.floor(Date.now() / 1000);

    await this.ensureInitialized();

    // Update LRU cache immediately (works even in degraded mode)
    const entry = { ...profile, cachedAt: updatedAt };
    this.metadataCache?.setProfile(pubkey, entry);

    // If in degraded mode, skip persistent storage (LRU cache only)
    if (this.degradedMode) return;

    await this.postWorkerMessage({
        type: "saveProfile",
        payload: {
            pubkey,
            profile: profileStr,
            updatedAt,
        },
    });
}
