import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useNDK } from './ndk'

export function useUserProfile(pubkey: string) {
    const { ndk } = useNDK();

    const user = useMemo(() => ndk?.getUser({ pubkey }), [ndk, pubkey]);

    const fetchFromCache = useCallback(() => {
        if (!ndk) return null;

        const cachedProfile = ndk.cacheAdapter.fetchProfileSync?.(pubkey);
        if (cachedProfile) cachedProfile.pubkey = pubkey;

        return cachedProfile;
    }, [ndk, pubkey]);

    const [state, setState] = useState(() => {
        if (!ndk || !pubkey) {
            return { userProfile: null, user: null, loading: false, cache: false, pubkey };
        }

        const cachedProfile = fetchFromCache();
        return {
            userProfile: cachedProfile,
            user,
            loading: !cachedProfile,
            cache: !!cachedProfile,
            pubkey,
        };
    });

    // Use a ref to track the currently active pubkey fetch
    const activePubkeyRef = useRef(pubkey);

    useEffect(() => {
        activePubkeyRef.current = pubkey;

        if (!ndk || !pubkey) return;

        // If the cached profile is already loaded, don't fetch again
        if (state.userProfile && state.userProfile.pubkey === pubkey) return;

        const cachedProfile = fetchFromCache();
        if (cachedProfile) {
            setState({
                userProfile: cachedProfile,
                user,
                loading: false,
                cache: true,
                pubkey,
            });
            return; // If we have a cached profile, no need to fetch remotely
        }

        setState((prev) => ({ ...prev, loading: true, userProfile: null, cache: false, pubkey }));

        const fetchProfile = async () => {
            try {
                const profile = await user?.fetchProfile();
                if (activePubkeyRef.current !== pubkey) {
                    return;
                }
                if (profile) profile.pubkey = pubkey;

                setState({
                    userProfile: profile || null,
                    user,
                    loading: false,
                    cache: false,
                    pubkey,
                });
            } catch (error) {
                console.error(`Error fetching user profile for ${pubkey}:`, error);
                if (activePubkeyRef.current === pubkey) {
                    setState((prev) => ({ ...prev, loading: false }));
                }
            }
        };

        fetchProfile();
    }, [ndk, pubkey, user, fetchFromCache]);

    return state;
}