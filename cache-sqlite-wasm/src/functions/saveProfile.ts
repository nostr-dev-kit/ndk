import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Saves a user profile by pubkey to the SQLite WASM database.
 * Supports both worker and direct database modes.
 */
export async function saveProfile(
    this: NDKCacheAdapterSqliteWasm,
    pubkey: string,
    profile: NDKUserProfile,
): Promise<void> {
    const profileStr = JSON.stringify(profile);
    const updatedAt = Math.floor(Date.now() / 1000);

    await this.ensureInitialized();

    // Update LRU cache immediately
    const entry = { ...profile, cachedAt: updatedAt };
    this.metadataCache?.setProfile(pubkey, entry);

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "saveProfile",
            payload: {
                pubkey,
                profile: profileStr,
                updatedAt,
            },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run(
            "INSERT OR REPLACE INTO profiles (pubkey, profile, updated_at) VALUES (?, ?, ?)",
            [pubkey, profileStr, updatedAt]
        );
    }
}
