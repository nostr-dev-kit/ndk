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
    const stmt = "SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1";

    await this.ensureInitialized();

    if (this.useWorker) {
        const result = await this.postWorkerMessage<{ profile?: string; updated_at?: number }>({
            type: "get",
            payload: {
                sql: stmt,
                params: [pubkey],
            },
        });
        if (result && result.profile) {
            try {
                const profile = JSON.parse(result.profile);
                return { ...profile, cachedAt: result.updated_at };
            } catch {
                return null;
            }
        }
        return null;
    } else {
        if (!this.db) throw new Error("Database not initialized");

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
}
