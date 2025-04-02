import type { Hexpubkey, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useNDKSessions } from '../session'; // Added import
import {
    type UserProfilesStore,
    useUserProfilesStore,
} from '../stores/profiles';
import { useCurrentUserProfile } from './session'; // Added import

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
    // const activeSessionPubkey = useNDKSessions(state => state.activeSessionPubkey);
    // const currentUserProfile = useCurrentUserProfile();

    // Delegate if pubkey matches active user AND forceRefresh is not requested
    // if (pubkey && pubkey === activeSessionPubkey && !forceRefresh) {
    //     return currentUserProfile;
    // }

    // Original logic for non-active user or when forceRefresh is true
    const fetchProfile = useUserProfilesStore((state) => state.fetchProfile);

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
