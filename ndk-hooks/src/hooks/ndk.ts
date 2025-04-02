import NDK, { type NDKEvent, type NDKPublishError } from '@nostr-dev-kit/ndk'; // Consolidated NDK import
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type NDKStoreState, useNDKStore } from '../stores/ndk';
import { UserProfilesStore, useUserProfilesStore } from '../stores/profiles'; // Added profile store import

/**
 * Interface for the useNDK hook return value
 */
interface UseNDKResult
    extends Pick<
        NDKStoreState,
        'ndk' | 'setNDK' | 'addSigner' | 'switchToUser'
    > {
    // Interface now inherits relevant types from NDKStoreState
    // Keeping it potentially extendable if needed later
}

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

    // Memoize the result to ensure reference stability between renders
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
    const { ndk } = useNDK(); // Use the local useNDK hook
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

        // Check if lengths differ or if any entry ID is not in previousEntries
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
            // Rebuild newEntries from the latest cache data
            const freshEntries = entries.map((entry) => ({ ...entry })); // Create shallow copies

            state.current = freshEntries;
            setUnpublishedEvents(freshEntries);

            // Re-attach listeners to the new event instances
            for (const entry of freshEntries) {
                entry.event.on('published', () => {
                    // Filter based on the current state ref
                    state.current = state.current?.filter(
                        (e) => e.event.id !== entry.event.id
                    );
                    setUnpublishedEvents(state.current);
                });
            }
        }
    }, [ndk]); // Dependency array includes ndk

    useEffect(() => {
        if (!ndk?.cacheAdapter?.getUnpublishedEvents) return;

        updateStateFromCache();

        // Correct handler signature (assuming this is the NDK v2 signature)
        const handlePublishFailed = (
            _event: NDKEvent,
            _error: NDKPublishError,
            _relays: string[]
        ) => {
            updateStateFromCache();
        };

        ndk?.on('event:publish-failed', handlePublishFailed);

        // Cleanup function
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
    // Get the initialize action from the profiles store
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

            // Initialize the profiles store, passing the NDK instance
            console.log('Initializing User Profiles store...');
            initializeProfilesStore(ndkInstance);

            console.log('NDK and dependent stores initialized.');
        },
        [setNDK, initializeProfilesStore]
    );

    return initializeNDK;
}
