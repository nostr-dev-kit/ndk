import type { Hexpubkey, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import {
    type UserProfilesStore,
    useUserProfilesStore,
} from '../stores/profiles';

/**
 * Hook for getting a user profile.
 * @param pubkey - The pubkey of the user to fetch
 * @param forceRefresh - Whether to force a refresh of the profile
 * @returns The user profile or undefined if not available
 */
export function useProfile(pubkey: Hexpubkey | undefined, forceRefresh?: boolean): NDKUserProfile | undefined {
    const fetchProfile = useUserProfilesStore((state) => state.fetchProfile);
    
    const profileSelector = useShallow((state: UserProfilesStore) =>
        pubkey ? state.profiles.get(pubkey) : undefined
    );
    const profile = useUserProfilesStore(profileSelector);

    useEffect(() => {
        if (pubkey) fetchProfile(pubkey, forceRefresh);
    }, [pubkey, fetchProfile, forceRefresh]);

    return profile;
}
