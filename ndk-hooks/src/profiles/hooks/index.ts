import type { Hexpubkey, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useNDKSessions } from '../../session/store'; // Corrected import path (needs ../../)
import {
    type UserProfilesStore,
    useUserProfilesStore,
} from '../store'; // Corrected import path
import { useCurrentUserProfile } from '../../session/hooks'; // Corrected import path

/**
 * Hook for getting a user profile. If the requested pubkey matches the active session user
 * and `forceRefresh` is not true, it returns the profile managed by `useCurrentUserProfile`.
 * Otherwise, it fetches the profile from the global profile store.
 * @param pubkey - The pubkey of the user to fetch
 * @param forceRefresh - Whether to force a refresh of the profile (bypasses delegation to `useCurrentUserProfile`)
 * @returns The user profile or undefined if not available
 */
export function useProfile(
    pubkey: Hexpubkey | undefined,
    forceRefresh?: boolean
): NDKUserProfile | undefined {
    const fetchProfile = useUserProfilesStore((state: UserProfilesStore) => state.fetchProfile); // Added type for state

    const profileSelector = useShallow((state: UserProfilesStore) =>
        pubkey ? state.profiles.get(pubkey) : undefined
    );
    const profile = useUserProfilesStore(profileSelector);

    useEffect(() => {
        if (pubkey) {
            fetchProfile(pubkey, forceRefresh);
        }
    }, [pubkey, fetchProfile, forceRefresh]);

    return profile;
}
