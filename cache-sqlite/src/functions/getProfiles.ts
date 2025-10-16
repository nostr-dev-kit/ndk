import type { Hexpubkey, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Fetches profiles that match the given filter from the SQLite database.
 */
export async function getProfiles(
    this: NDKCacheAdapterSqlite,
    filter: ((pubkey: Hexpubkey, profile: NDKUserProfile) => boolean) | { field?: string; fields?: string[]; contains: string },
): Promise<Map<Hexpubkey, NDKUserProfile> | undefined> {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = "SELECT pubkey, profile FROM profiles";

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        const rows = prepared.all() as { pubkey: string; profile: string }[];

        const result = new Map<Hexpubkey, NDKUserProfile>();

        // Convert descriptor filter to function if needed
        const filterFn = typeof filter === 'function'
            ? filter
            : (pubkey: Hexpubkey, profile: NDKUserProfile) => {
                const searchLower = filter.contains.toLowerCase();
                const fields = filter.fields || (filter.field ? [filter.field] : ['name', 'displayName', 'nip05']);
                return fields.some(field => {
                    const value = (profile as any)[field];
                    return typeof value === 'string' && value.toLowerCase().includes(searchLower);
                });
            };

        for (const row of rows) {
            try {
                const profile = JSON.parse(row.profile) as NDKUserProfile;
                if (filterFn(row.pubkey, profile)) {
                    result.set(row.pubkey, profile);
                }
            } catch (e) {
                console.error("Error parsing profile:", e);
            }
        }

        return result;
    } catch (e) {
        console.error("Error fetching profiles:", e);
        return undefined;
    }
}
