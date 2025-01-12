import { useNDKStore } from '../stores/ndk';

export const useNDK = () => {
    const ndk = useNDKStore(s => s.ndk);
    const init = useNDKStore(s => s.init);
    const login = useNDKStore(s => s.login);
    const logout = useNDKStore(s => s.logout);

    return { ndk, init, login, logout };
}

export const useNDKCurrentUser = () => useNDKStore(s => s.currentUser);
export const useNDKCacheInitialized = () => useNDKStore(s => s.cacheInitialized);
export const useNDKUnpublishedEvents = () => useNDKStore(s => s.unpublishedEvents);
