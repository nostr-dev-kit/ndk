import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { create } from "zustand";
import { fetchProfileImplementation } from "./fetch-profile";
import { initializeProfilesStore } from "./initialize";
import { setProfileImplementation } from "./set-profile";

interface UserProfilesItems {
    /**
     * The NDK instance
     */
    ndk: NDK | undefined;

    /**
     * The profile map
     */
    profiles: Map<Hexpubkey, NDKUserProfile>;

    /**
     * Map of timestamps in seconds of the last time a profile was fetched
     * (even if we couldn't find one)
     */
    lastFetchedAt: Map<Hexpubkey, number>;
}

interface UserProfilesStoreActions {
    initialize: (ndk: NDK) => void;

    /**
     * Store an already fetched profile
     * @param pubkey - The pubkey of the profile to store
     * @param profile - The profile to store
     * @param cachedAt - The timestamp in seconds when the profile was retrieved
     */
    setProfile: (pubkey: string, profile: NDKUserProfile, cachedAt?: number) => void;

    /*
     * Fetch a profile from the NDK instance
     *
     * @param pubkey - The pubkey of the profile to fetch
     * @param force - Whether to force the fetch even if the profile is already cached
     */
    fetchProfile: (pubkey?: string, force?: boolean) => void;
}

export type UserProfilesStore = UserProfilesItems & UserProfilesStoreActions;

export const useUserProfilesStore = create<UserProfilesStore>((set, get) => ({
    profiles: new Map(),
    lastFetchedAt: new Map(),
    ndk: undefined,
    /** @internal */
    initialize: (ndk: NDK) => initializeProfilesStore(set, ndk),
    setProfile: (pubkey: string, profile: NDKUserProfile, cachedAt?: number) =>
        setProfileImplementation(set, pubkey, profile, cachedAt),
    fetchProfile: (pubkey?: string, force?: boolean) => fetchProfileImplementation(set, get, pubkey, force),
}));
