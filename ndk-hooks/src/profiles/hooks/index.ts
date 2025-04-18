import { NDKEvent, NDKKind, serializeProfile, type Hexpubkey, type NDKSigner, type NDKUserProfile } from "@nostr-dev-kit/ndk";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { type UserProfilesStore, useUserProfilesStore } from "../store"; // Corrected import path
import { useNDK } from "../../ndk/hooks";

/**
 * @deprecated Use `useProfileValue` instead.
 */
export function useProfile(pubkey?: Hexpubkey | undefined, forceRefresh?: boolean): NDKUserProfile | undefined {
    return useProfileValue(pubkey, forceRefresh);
}

/**
 * Get a user's profile.
 * Otherwise, it fetches the profile from the global profile store.
 * @param pubkey - The pubkey of the user to fetch
 * @param refresh - Whether to force a refresh of the profile
 * @returns The user profile or undefined if not available
 */
export function useProfileValue(pubkey?: Hexpubkey | undefined, refresh?: boolean): NDKUserProfile | undefined {
    const fetchProfile = useUserProfilesStore((state: UserProfilesStore) => state.fetchProfile); // Added type for state

    const profileSelector = useShallow((state: UserProfilesStore) => (pubkey ? state.profiles.get(pubkey) : undefined));
    const profile = useUserProfilesStore(profileSelector);

    useEffect(() => {
        if (pubkey) {
            fetchProfile(pubkey, refresh);
        }
    }, [pubkey, fetchProfile, refresh]);

    return profile;
}

/**
 * Update a user's profile. This will create a new kind:0 event representing the user's profile
 * and update the local store with the new profile for immediate reactivity.
 *
 * @example Update a user's profile
 * ```ts
 * const updateProfile = useSetProfile();
 * const newProfile = { name: "New Name", picture: "new_picture_url" };
 * updateProfile(newProfile);
 * ```
 */
export function useSetProfile() {
    const setProfile = useUserProfilesStore((state: UserProfilesStore) => state.setProfile);
    const { ndk } = useNDK();

    // biome-ignore lint/correctness/useExhaustiveDependencies: setProfile is not reactive
    const update = useCallback(
        async (newProfile: NDKUserProfile) => {
            if (!ndk) return null;

            const event = new NDKEvent(ndk);
            event.kind = NDKKind.Metadata;
            event.content = serializeProfile(newProfile);
            await event.sign();
            event.publish();

            setProfile(event.pubkey, newProfile);
        },
        [ndk],
    );

    return update;
}