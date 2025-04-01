import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite, NDKSqliteProfileRecord } from "../../index.js";

/**
 * Convenience method to search for profiles in the database.
 */
export function searchProfiles(
    adapter: NDKCacheAdapterSqlite,
    query: string
): [string, NDKUserProfile][] {
    const pubkeys = adapter.db.getAllSync(
        "SELECT * FROM profiles WHERE name LIKE ? OR about LIKE ? OR nip05 LIKE ? OR display_name LIKE ?",
        [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    ) as NDKSqliteProfileRecord[];

    const results: [string, NDKUserProfile][] = [];

    for (const row of pubkeys) {
        const profile = {
            name: row.name,
            about: row.about,
            picture: row.picture,
            banner: row.banner,
            nip05: row.nip05,
            lud16: row.lud16,
            lud06: row.lud06,
            displayName: row.display_name,
            website: row.website,
            created_at: row.created_at,
        };
        results.push([row.pubkey, profile]);
    }

    return results;
}
