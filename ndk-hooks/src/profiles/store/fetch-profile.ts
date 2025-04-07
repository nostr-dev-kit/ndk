import type { UserProfilesStore } from ".";
import { inSeconds } from "../../utils/time";

export const fetchProfileImplementation = (
    set: (fn: (state: UserProfilesStore) => Partial<UserProfilesStore>) => void,
    get: () => UserProfilesStore,
    pubkey?: string,
    force?: boolean,
) => {
    const { ndk, profiles } = get();
    if (!ndk) {
        console.error("NDK instance is not initialized. Did you use useNDKInit at the beginning of your app?");
        return;
    }
    if (!pubkey) return;

    const currentProfile = profiles.get(pubkey);
    if (currentProfile && !force) return;

    const user = ndk.getUser({ pubkey: pubkey });
    user.fetchProfile()
        .then((profile) => {
            set((state) => {
                const profiles = new Map(state.profiles);
                if (profile) profiles.set(pubkey, profile);
                const lastFetchedAt = new Map(state.lastFetchedAt);
                lastFetchedAt.set(pubkey, inSeconds(Date.now()));

                return { profiles, lastFetchedAt };
            });
        })
        .catch((err) => {
            set((state) => {
                const lastFetchedAt = new Map(state.lastFetchedAt);
                lastFetchedAt.set(pubkey, inSeconds(Date.now()));
                return { lastFetchedAt };
            });
        });
};
