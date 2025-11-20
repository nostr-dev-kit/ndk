import type { ProfilePointer } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Saves a NIP-05 verification result to the SQLite WASM database via worker.
 *
 * @param nip05 - The NIP-05 identifier (e.g., "user@domain.com")
 * @param profile - The ProfilePointer if verification succeeded, or null if it failed
 */
export async function saveNip05(
    this: NDKCacheAdapterSqliteWasm,
    nip05: string,
    profile: ProfilePointer | null,
): Promise<void> {
    const profileStr = profile ? JSON.stringify(profile) : null;
    const fetchedAt = Date.now();

    await this.ensureInitialized();

    // Update LRU cache immediately
    this.metadataCache?.setNip05(nip05, { profile: profileStr, fetched_at: fetchedAt });

    await this.postWorkerMessage({
        type: "saveNip05",
        payload: {
            nip05,
            profile: profileStr,
            fetchedAt,
        },
    });
}
