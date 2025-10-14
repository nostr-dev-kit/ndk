import type { ProfilePointer } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Loads a NIP-05 verification result from the SQLite WASM database.
 * Supports both worker and direct database modes.
 *
 * @param nip05 - The NIP-05 identifier (e.g., "user@domain.com")
 * @param maxAgeForMissing - Maximum age in seconds before a failed lookup should be retried (default: 3600)
 * @returns ProfilePointer if found and valid, null if not found but cached as missing, "missing" if should be refetched
 */
export async function loadNip05(
    this: NDKCacheAdapterSqliteWasm,
    nip05: string,
    maxAgeForMissing = 3600,
): Promise<ProfilePointer | null | "missing"> {
    const stmt = "SELECT profile, fetched_at FROM nip05 WHERE nip05 = ? LIMIT 1";

    if (this.useWorker) {
        const result = await this.postWorkerMessage<{ profile?: string; fetched_at?: number }>({
            type: "get",
            payload: {
                sql: stmt,
                params: [nip05],
            },
        });

        if (!result) return "missing";

        const now = Date.now();

        if (result.profile === null || result.profile === undefined) {
            // Failed lookup cached or no profile - check if it's expired
            if (result.fetched_at && result.fetched_at + maxAgeForMissing * 1000 < now) {
                return "missing";
            }
            return null;
        }

        try {
            return JSON.parse(result.profile);
        } catch {
            return "missing";
        }
    } else {
        if (!this.db) throw new Error("Database not initialized");

        const results = this.db.exec(stmt, [nip05]);
        if (!results || results.length === 0 || !results[0].values || results[0].values.length === 0) {
            return "missing";
        }

        const [profileStr, fetchedAt] = results[0].values[0];
        const now = Date.now();

        if (profileStr === null) {
            // Failed lookup cached - check if it's expired
            if (fetchedAt && (fetchedAt as number) + maxAgeForMissing * 1000 < now) {
                return "missing";
            }
            return null;
        }

        try {
            return JSON.parse(profileStr as string);
        } catch {
            return "missing";
        }
    }
}
