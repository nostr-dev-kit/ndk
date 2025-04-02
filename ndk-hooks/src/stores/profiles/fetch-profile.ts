import type { UserProfilesStore } from ".";
import { inSeconds } from "../../utils/time";


export const fetchProfileImplementation = (
    set: (fn: (state: UserProfilesStore) => Partial<UserProfilesStore>) => void,
    get: () => UserProfilesStore,
    pubkey?: string,
    force?: boolean
) => {
    const { ndk, profiles } = get();
    if (!ndk || !pubkey) {
        console.log('[PROFILE STORE FETCH] ndk?', !!ndk)
        console.log('[PROFILE STORE FETCH] pubkey?', !!pubkey)
        return;
    }
    
    const currentProfile = profiles.get(pubkey);
    if (currentProfile && !force) {
        console.log('[PROFILE STORE] we already have one', {pubkey, currentProfile })
        return;
    }
    
    const user = ndk.getUser({ pubkey: pubkey });
    console.log('[PROFILE STORE] fetching', pubkey)
    user.fetchProfile().then((profile) => {
        console.log('got a profile?', {pubkey, profile: !!profile})
        set((state) => {
            const profiles = new Map(state.profiles);
            if (profile) profiles.set(pubkey, profile);
            const lastFetchedAt = new Map(state.lastFetchedAt);
            lastFetchedAt.set(pubkey, inSeconds(Date.now()));

            return { profiles, lastFetchedAt };
        });
    }).catch((err) => {
        set((state) => {
            const lastFetchedAt = new Map(state.lastFetchedAt);
            lastFetchedAt.set(pubkey, inSeconds(Date.now()));
            return { lastFetchedAt };
        });
    });
}
