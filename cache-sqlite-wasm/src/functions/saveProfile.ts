import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Saves a user profile by pubkey to the SQLite WASM database.
 */
export async function saveProfile(
    this: NDKCacheAdapterSqliteWasm,
    pubkey: string,
    profile: NDKUserProfile,
): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = `
        INSERT OR REPLACE INTO profiles (
            pubkey, profile, updated_at
        ) VALUES (?, ?, ?)
    `;
    const profileStr = JSON.stringify(profile);
    const updatedAt = Math.floor(Date.now() / 1000);
    this.db.run(stmt, [pubkey, profileStr, updatedAt]);
}
