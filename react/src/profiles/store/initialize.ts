import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { UserProfilesStore } from ".";

export function initializeProfilesStore(set: (state: Partial<UserProfilesStore>) => void, ndk: NDK) {
    // warm up from the cache if we have one
    const cacheAdapter = ndk.cacheAdapter;
    if (cacheAdapter?.getAllProfilesSync) {
        // get all the keys
        const keys = cacheAdapter.getAllProfilesSync();
        const profiles = new Map<Hexpubkey, NDKUserProfile>();
        const lastFetchedAt = new Map<Hexpubkey, number>();
        for (const [key, profile] of keys) {
            profiles.set(key, profile);
            lastFetchedAt.set(key, profile.cachedAt ?? 0);
        }
        set({ profiles, lastFetchedAt, ndk });
    } else {
        set({ ndk });
    }
}
