import NDK, { type NDKEvent, type NDKPublishError } from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type NDKStoreState, useNDKStore } from '../stores/ndk';
import { UserProfilesStore, useUserProfilesStore } from '../stores/profiles';

/**
 * Interface for the useNDK hook return value
 */
interface UseNDKResult
    extends Pick<
        NDKStoreState,
        'ndk' | 'setNDK' | 'addSigner' | 'switchToUser'
    > {}

/**
 * Hook to access the NDK instance and setNDK function
 *
 * @returns {UseNDKResult} Object containing the NDK instance and setNDK function
 */
export const useNDK = (): UseNDKResult => {
    const ndk = useNDKStore((state) => state.ndk);
    const setNDK = useNDKStore((state) => state.setNDK);
    const addSigner = useNDKStore((state) => state.addSigner);
    const switchToUser = useNDKStore((state) => state.switchToUser);

    return useMemo(
        () => ({ ndk: ndk!, setNDK, addSigner, switchToUser }),
        [ndk, setNDK, addSigner, switchToUser]
    );
};

/**
 * Hook to access the current NDKUser instance from the store.
 */
export const useNDKCurrentUser = () =>
    useNDKStore((state) => state.currentUser);

/**
 * Hook to get the list of unpublished events from the NDK cache adapter.
 * It listens for publish failures and updates the list accordingly.
 * Requires the cache adapter to implement `getUnpublishedEvents`.
 * @returns An array of objects, each containing the unpublished event, optional target relays, and last attempt timestamp.
 */
export function useNDKUnpublishedEvents() {
    const { ndk } = useNDK();
    const [unpublishedEvents, setUnpublishedEvents] = useState<
        { event: NDKEvent; relays?: WebSocket['url'][]; lastTryAt?: number }[]
    >([]);
    const state = useRef<
        { event: NDKEvent; relays?: WebSocket['url'][]; lastTryAt?: number }[]
    >([]);

    const updateStateFromCache = useCallback(async () => {
        if (!ndk?.cacheAdapter?.getUnpublishedEvents) return;
        const entries = await ndk.cacheAdapter.getUnpublishedEvents();
        const previousEntries = new Set(state.current?.map((e) => e.event.id));
        const newEntries = [];

        let changed = entries.length !== state.current?.length;
        if (!changed) {
            const currentIds = new Set(state.current.map((e) => e.event.id));
            for (const entry of entries) {
                if (!currentIds.has(entry.event.id)) {
                    changed = true;
                    break;
                }
            }
        }

        if (changed) {
            const freshEntries = entries.map((entry) => ({ ...entry }));

            state.current = freshEntries;
            setUnpublishedEvents(freshEntries);

            for (const entry of freshEntries) {
                entry.event.on('published', () => {
                    state.current = state.current?.filter(
                        (e) => e.event.id !== entry.event.id
                    );
                    setUnpublishedEvents(state.current);
                });
            }
        }
    }, [ndk]);

    useEffect(() => {
        if (!ndk?.cacheAdapter?.getUnpublishedEvents) return;

        updateStateFromCache();

        const handlePublishFailed = (
            _event: NDKEvent,
            _error: NDKPublishError,
            _relays: string[]
        ) => {
            updateStateFromCache();
        };

        ndk?.on('event:publish-failed', handlePublishFailed);

        return () => {
            ndk?.off('event:publish-failed', handlePublishFailed);
        };
    }, [ndk, updateStateFromCache]);

    return unpublishedEvents;
}

/**
 * Hook to initialize the NDK instance and related stores.
 *
 * This hook provides a function to set the NDK instance in the NDK store
 * and subsequently initialize other dependent stores like the user profiles store.
 *
 * @returns An initialization function `initializeNDK`.
 */
export function useNDKInit() {
    const setNDK = useNDKStore((state) => state.setNDK);
    const initializeProfilesStore = useUserProfilesStore(
        (state: UserProfilesStore) => state.initialize
    );

    /**
     * Initializes the NDK instance and dependent stores.
     * @param ndkInstance The configured NDK instance to use.
     */
    const initializeNDK = useCallback(
        (ndkInstance: NDK) => {
            if (!ndkInstance) {
                console.error(
                    'useNDKInit: Attempted to initialize with a null NDK instance.'
                );
                return;
            }

            console.log('Initializing NDK instance...');
            setNDK(ndkInstance);

            console.log('Initializing User Profiles store...');
            initializeProfilesStore(ndkInstance);

            console.log('NDK and dependent stores initialized.');
        },
        [setNDK, initializeProfilesStore]
    );

    return initializeNDK;
}
