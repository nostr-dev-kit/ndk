import { useEffect, useState, useMemo } from 'react'
import { useNDK } from './ndk'

export function useUserProfile(pubkey: string | undefined) {
    const { ndk } = useNDK()
    
    // Try to load synchronously first
    const initialState = useMemo(() => {
        if (!ndk || !pubkey) {
            return { userProfile: null, user: null, loading: false }
        }

        const user = ndk.getUser({ pubkey })
        const cachedProfile = ndk.cacheAdapter.fetchProfileSync?.(pubkey)
        
        if (cachedProfile) {
            return { userProfile: cachedProfile, user, loading: false }
        }
        
        return { userProfile: null, user, loading: true }
    }, [ndk, pubkey])

    const [state, setState] = useState(initialState)

    useEffect(() => {
        if (!ndk || !pubkey || state.userProfile) return

        let mounted = true
        
        state.user?.fetchProfile()
            .then(profile => {
                if (mounted) {
                    setState({ userProfile: profile, user: state.user, loading: false })
                }
            })
            .catch(error => {
                console.error('Error fetching user profile:', error)
                if (mounted) {
                    setState(prev => ({ ...prev, loading: false }))
                }
            })

        return () => { mounted = false }
    }, [ndk, pubkey, state.user, state.userProfile])

    return state
}
