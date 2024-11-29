import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useNDK } from './ndk'

export function useUserProfile(pubkey: string) {
    const { ndk } = useNDK()

    const user = useMemo(() => ndk?.getUser({ pubkey }), [ndk, pubkey]);

    const fetchFromCache = useCallback(() => {
        if (!ndk) return null;
        
        const cachedProfile = ndk.cacheAdapter.fetchProfileSync?.(pubkey)
        if (cachedProfile) cachedProfile.pubkey = pubkey;
        
        return cachedProfile;
    }, [ndk, pubkey]);
    
    // Try to load synchronously first
    const initialState = useMemo(() => {
        if (!ndk || !pubkey) {
            return { userProfile: null, user: null, loading: false, cache: false, pubkey }
        }

        const cachedProfile = fetchFromCache();
        return { userProfile: cachedProfile, user, loading: !cachedProfile, cache: !!cachedProfile, pubkey }
    }, [ndk, pubkey])

    const [state, setState] = useState(initialState)

    useEffect(() => {
        let mounted = true
        
        if (!mounted) return;

        if (!ndk || !pubkey || (state.userProfile && state.userProfile.pubkey === pubkey)) return

        // if the props changed, we need to refetch
        if (state.userProfile && state.userProfile.pubkey !== pubkey) {
            const newProfile = fetchFromCache();

            setState(prev => ({ ...prev, userProfile: newProfile, loading: !newProfile, cache: !!newProfile }));

            // if we got a new profile from the cache, we don't need to update the state again
            if (newProfile) return;
        }

        state.user?.fetchProfile()
            .then(profile => {
                // make sure we are mounted and that the pubkey prop didn't change
                if (!mounted || state.pubkey !== pubkey) return;

                if (profile) profile.pubkey = pubkey;
                setState(prev => ({ ...prev, pubkey, userProfile: profile, cache: false, loading: false }))
            })
            .catch(error => {
                console.error('Error fetching user profile:', error)
                if (mounted) {
                    setState(prev => ({ ...prev, pubkey, loading: false, fromCache: false }))
                }
            })

        return () => { mounted = false }
    }, [ndk, pubkey])

    return state
}
