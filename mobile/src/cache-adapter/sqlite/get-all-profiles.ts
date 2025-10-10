import type { Hexpubkey, NDKCacheEntry, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite, NDKSqliteProfileRecord } from "./index.js";

/**
 * Retrieve all profiles from the cache synchronously
 * @returns A map of pubkeys to profiles
 */
export function getAllProfilesSync(this: NDKCacheAdapterSqlite): Map<Hexpubkey, NDKCacheEntry<NDKUserProfile>> {
    const profiles = new Map<Hexpubkey, NDKCacheEntry<NDKUserProfile>>();

    try {
        const results = this.db.getAllSync(
            "SELECT pubkey, name, about, picture, banner, nip05, lud16, lud06, display_name, website, catched_at, created_at FROM profiles",
        ) as NDKSqliteProfileRecord[];

        for (const result of results) {
            const profile = {
                name: result.name,
                about: result.about,
                picture: result.picture,
                banner: result.banner,
                nip05: result.nip05,
                lud16: result.lud16,
                lud06: result.lud06,
                displayName: result.display_name,
                website: result.website,
                created_at: result.created_at,
                cachedAt: result.catched_at,
            };

            profiles.set(result.pubkey, profile);
        }
    } catch (e) {
        console.error("Error fetching all profiles", e);
    }

    return profiles;
}
