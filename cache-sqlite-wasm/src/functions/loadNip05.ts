import type { ProfilePointer } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Loads a NIP-05 verification result from the SQLite WASM database via worker.
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
    await this.ensureInitialized();

    // Check LRU cache first
    const cached = this.metadataCache?.getNip05(nip05);
    if (cached !== undefined) {
        // Check if cached result is expired
        if (cached.profile === null || cached.profile === undefined) {
            const now = Date.now();
            if (cached.fetched_at && cached.fetched_at + maxAgeForMissing * 1000 < now) {
                return "missing";
            }
            return null;
        }
        return cached.profile;
    }

    // If in degraded mode, return "missing" (only LRU cache available)
    if (this.degradedMode) return "missing";

    const result = await this.postWorkerMessage<{ profile?: string; fetched_at?: number }>({
        type: "loadNip05",
        payload: { nip05 },
    });

    if (!result) return "missing";

    const now = Date.now();

    // Cache the result
    this.metadataCache?.setNip05(nip05, result);

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
}
