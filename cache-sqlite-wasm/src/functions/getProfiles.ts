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
 * Fetches profiles that match the given filter.
 * - In worker mode, accepts a filter descriptor ({ field, contains } or { fields, contains }) and queries the worker.
 *   Use `fields` to search across multiple profile fields (e.g., ['name', 'displayName', 'nip05']).
 * - In non-worker mode, accepts a filter function and queries the DB directly.
 */
export async function getProfiles(
    this: NDKCacheAdapterSqliteWasm,
    filter: ((pubkey: Hexpubkey, profile: NDKUserProfile) => boolean) | ProfileFilterDescriptor,
): Promise<Map<Hexpubkey, NDKUserProfile>> {
    await this.ensureInitialized();

    if (this.useWorker) {
        if (typeof filter === "function") {
            throw new Error("In worker mode, getProfiles only supports filter descriptors, not functions.");
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
    } else {
        if (typeof filter !== "function") {
            throw new Error("In non-worker mode, getProfiles only supports filter functions.");
        }
        if (!this.db) throw new Error("Database not initialized");
        // Query all profiles and filter in JS
        const stmt = "SELECT pubkey, profile FROM profiles";
        const results = this.db.exec(stmt);
        const map = new Map<Hexpubkey, NDKUserProfile>();
        if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
            for (const row of results[0].values) {
                const [pubkey, profileStr] = row;
                try {
                    const profile = JSON.parse(profileStr as string);
                    if (filter(pubkey as string, profile)) {
                        map.set(pubkey as string, profile);
                    }
                } catch {
                    // skip invalid profile
                }
            }
        }
        return map;
    }
}
