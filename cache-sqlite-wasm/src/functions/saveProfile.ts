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
    const stmt = `
        INSERT OR REPLACE INTO profiles (
            pubkey, profile, updated_at
        ) VALUES (?, ?, ?)
    `;
    const profileStr = JSON.stringify(profile);
    const updatedAt = Math.floor(Date.now() / 1000);

    await this.ensureInitialized();

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "run",
            payload: {
                sql: stmt,
                params: [pubkey, profileStr, updatedAt],
            },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run(stmt, [pubkey, profileStr, updatedAt]);
    }
}
