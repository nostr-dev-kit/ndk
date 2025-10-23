import type { Hexpubkey, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Filter descriptor for getProfiles in worker mode.
 */
export type ProfileFilterDescriptor = {
    field?: string;
    fields?: string[];
    contains: string;
};

/**
 * Fetches profiles that match the given filter via worker.
 * Accepts either a filter function or a filter descriptor ({ field, contains } or { fields, contains }).
 * Use `fields` to search across multiple profile fields (e.g., ['name', 'displayName', 'nip05']).
 */
export async function getProfiles(
    this: NDKCacheAdapterSqliteWasm,
    filter: ((pubkey: Hexpubkey, profile: NDKUserProfile) => boolean) | ProfileFilterDescriptor,
): Promise<Map<Hexpubkey, NDKUserProfile> | undefined> {
    await this.ensureInitialized();

    // Worker mode only supports filter descriptors
    if (typeof filter === 'function') {
        throw new Error('getProfiles with filter functions is not supported in worker mode. Use filter descriptors instead.');
    }

    // Send message to worker and get result
    const result: Array<{ pubkey: Hexpubkey; profile: NDKUserProfile }> = await this.postWorkerMessage({
        type: "getProfiles",
        payload: filter,
    });
    const map = new Map<Hexpubkey, NDKUserProfile>();
    for (const { pubkey, profile } of result) {
        map.set(pubkey, profile);
    }
    return map;
}
