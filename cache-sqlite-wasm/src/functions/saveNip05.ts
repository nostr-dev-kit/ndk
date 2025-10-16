import type { ProfilePointer } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Saves a NIP-05 verification result to the SQLite WASM database.
 * Supports both worker and direct database modes.
 *
 * @param nip05 - The NIP-05 identifier (e.g., "user@domain.com")
 * @param profile - The ProfilePointer if verification succeeded, or null if it failed
 */
export async function saveNip05(
    this: NDKCacheAdapterSqliteWasm,
    nip05: string,
    profile: ProfilePointer | null,
): Promise<void> {
    const stmt = `
        INSERT OR REPLACE INTO nip05 (
            nip05, profile, fetched_at
        ) VALUES (?, ?, ?)
    `;
    const profileStr = profile ? JSON.stringify(profile) : null;
    const fetchedAt = Date.now();

    await this.ensureInitialized();

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "run",
            payload: {
                sql: stmt,
                params: [nip05, profileStr, fetchedAt],
            },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run(stmt, [nip05, profileStr, fetchedAt]);
    }
}
