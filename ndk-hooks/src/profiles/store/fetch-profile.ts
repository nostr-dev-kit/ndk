import { inSeconds } from '../../utils/time';
import type { UserProfilesStore } from '.';

export const fetchProfileImplementation = (
    set: (fn: (state: UserProfilesStore) => Partial<UserProfilesStore>) => void,
    get: () => UserProfilesStore,
    pubkey?: string,
    force?: boolean
) => {
    const { ndk, profiles } = get();
    if (!ndk || !pubkey) return;

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
