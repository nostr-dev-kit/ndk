import type { Hexpubkey, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Filter descriptor for getProfiles in worker mode.
 */
export type ProfileFilterDescriptor = {
    field: string;
    contains: string;
};

/**
 * Fetches profiles that match the given filter.
 * - In worker mode, accepts a filter descriptor ({ field, contains }) and queries the worker.
 * - In non-worker mode, accepts a filter function and queries the DB directly.
 */
export async function getProfiles(
    this: NDKCacheAdapterSqliteWasm,
    filter: ((pubkey: Hexpubkey, profile: NDKUserProfile) => boolean) | ProfileFilterDescriptor,
): Promise<Map<Hexpubkey, NDKUserProfile>> {
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
        const result = this.db.exec(stmt);
        const map = new Map<Hexpubkey, NDKUserProfile>();
        if (result && result.values && result.values.length > 0) {
            for (const row of result.values) {
                const [pubkey, profileStr] = row;
                try {
                    const profile = JSON.parse(profileStr);
                    if (filter(pubkey, profile)) {
                        map.set(pubkey, profile);
                    }
                } catch {
                    // skip invalid profile
                }
            }
        }
        return map;
    }
}
