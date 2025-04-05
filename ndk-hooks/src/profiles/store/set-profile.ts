import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { inSeconds } from '../../utils/time';
import type { UserProfilesStore } from './index';

export const setProfileImplementation = (
    set: (fn: (state: UserProfilesStore) => Partial<UserProfilesStore>) => void,
    pubkey: string,
    profile: NDKUserProfile,
    cachedAt?: number
) => {
    set((state) => {
        const newProfiles = new Map(state.profiles);
        newProfiles.set(pubkey, profile);
        const newLastFetchedAt = new Map(state.lastFetchedAt);
        newLastFetchedAt.set(pubkey, cachedAt ?? inSeconds(Date.now()));
        return { profiles: newProfiles, lastFetchedAt: newLastFetchedAt };
    });
};
