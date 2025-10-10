import {
    NDKEvent,
    NDKKind,
    serializeProfile,
    type Hexpubkey,
    type NDKSigner,
    type NDKUser,
    type NDKUserProfile,
} from "@nostr-dev-kit/ndk";
import { UseProfileValueOptions } from "../types";
import { useCallback, useEffect } from "react";
import { shallow } from "zustand/shallow";
import { type UserProfilesStore, useUserProfilesStore } from "../store"; // Corrected import path
import { useNDK } from "../../ndk/hooks";

export { useUser } from "./use-user";

/**
 * @deprecated Use `useProfileValue` instead.
 */

export function useProfile(pubkey?: Hexpubkey | undefined, forceRefresh?: boolean): NDKUserProfile | undefined {
    return useProfileValue(pubkey, { refresh: forceRefresh });
}

/**
 * Get a user's profile.
 * Otherwise, it fetches the profile from the global profile store.
 * @param userOrPubkey - The NDKUser, pubkey, null or undefined
 * @param opts - Options for fetching the profile
 * @returns The user profile or undefined if not available
 */
export function useProfileValue(
    userOrPubkey?: Hexpubkey | NDKUser | null | undefined,
    opts?: UseProfileValueOptions,
): NDKUserProfile | undefined {
    const fetchProfile = useUserProfilesStore((state: UserProfilesStore) => state.fetchProfile);

    // Extract pubkey from NDKUser or use directly if it's a string
    const pubkey = typeof userOrPubkey === "string" ? userOrPubkey : userOrPubkey?.pubkey;

    const profileSelector = (state: UserProfilesStore) => (pubkey ? state.profiles.get(pubkey) : undefined);
    const profile = useUserProfilesStore(profileSelector) as NDKUserProfile | undefined;

    useEffect(() => {
        if (pubkey) {
            fetchProfile(pubkey, opts);
        }
    }, [pubkey, fetchProfile, opts]);

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
