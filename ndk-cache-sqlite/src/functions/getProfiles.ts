import type { Hexpubkey, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Fetches profiles that match the given filter from the SQLite database.
 */
export async function getProfiles(
    this: NDKCacheAdapterSqlite,
    filter: (pubkey: Hexpubkey, profile: NDKUserProfile) => boolean,
): Promise<Map<Hexpubkey, NDKUserProfile> | undefined> {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = "SELECT pubkey, profile FROM profiles";

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        const rows = prepared.all() as { pubkey: string; profile: string }[];

        const result = new Map<Hexpubkey, NDKUserProfile>();

        for (const row of rows) {
            try {
                const profile = JSON.parse(row.profile) as NDKUserProfile;
                if (filter(row.pubkey, profile)) {
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
