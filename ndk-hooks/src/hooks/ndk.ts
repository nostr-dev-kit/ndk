import { useMemo, useCallback, useEffect, useRef, useState } from 'react'; // Added react hooks
import { useNDKStore, type NDKStoreState } from '../stores/ndk';
import type NDK from '@nostr-dev-kit/ndk';
import type { NDKEvent, NDKPublishError } from "@nostr-dev-kit/ndk"; // Added types

/**
 * Interface for the useNDK hook return value
 */
interface UseNDKResult {
  /**
   * The NDK instance
   */
  ndk: NDK | null;

  /**
   * Function to set the NDK instance
   */
  setNDK: (ndk: NDK) => void;
}

/**
 * Hook to access the NDK instance and setNDK function
 *
 * @returns {UseNDKResult} Object containing the NDK instance and setNDK function
 */
export const useNDK = (): UseNDKResult => {
  const ndk = useNDKStore((state) => state.ndk);
  const setNDK = useNDKStore((state) => state.setNDK);

  // Memoize the result to ensure reference stability between renders
  return useMemo(() => ({ ndk, setNDK }), [ndk, setNDK]);
};


/**
 * Hook to access the current NDKUser instance from the store.
 */
export const useNDKCurrentUser = () => useNDKStore((state) => state.currentUser);

/**
 * Hook to get the list of unpublished events from the NDK cache adapter.
 * It listens for publish failures and updates the list accordingly.
 * Requires the cache adapter to implement `getUnpublishedEvents`.
 * @returns An array of objects, each containing the unpublished event, optional target relays, and last attempt timestamp.
 */
export function useNDKUnpublishedEvents() {
    const { ndk } = useNDK(); // Use the local useNDK hook
    const [unpublishedEvents, setUnpublishedEvents] = useState<
        { event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]
    >([]);
    const state = useRef<{ event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]>(
        []
    );

    const updateStateFromCache = useCallback(async () => {
        if (!ndk?.cacheAdapter?.getUnpublishedEvents) return;
        const entries = await ndk.cacheAdapter.getUnpublishedEvents();
        const previousEntries = new Set(state.current?.map((e) => e.event.id));
        const newEntries = [];

        // Check if lengths differ or if any entry ID is not in previousEntries
        let changed = entries.length !== state.current?.length;
        if (!changed) {
            const currentIds = new Set(state.current.map(e => e.event.id));
            for (const entry of entries) {
                if (!currentIds.has(entry.event.id)) {
                    changed = true;
                    break;
                }
            }
        }


        if (changed) {
             // Rebuild newEntries from the latest cache data
             const freshEntries = entries.map(entry => ({ ...entry })); // Create shallow copies

             state.current = freshEntries;
             setUnpublishedEvents(freshEntries);

             // Re-attach listeners to the new event instances
             for (const entry of freshEntries) {
                 entry.event.on("published", () => {
                     // Filter based on the current state ref
                     state.current = state.current?.filter((e) => e.event.id !== entry.event.id);
                     setUnpublishedEvents(state.current);
                 });
             }
        }
    }, [ndk]); // Dependency array includes ndk

    useEffect(() => {
        if (!ndk?.cacheAdapter?.getUnpublishedEvents) return;

        updateStateFromCache();

        // Correct handler signature (assuming this is the NDK v2 signature)
        const handlePublishFailed = (_event: NDKEvent, _error: NDKPublishError, _relays: string[]) => {
            updateStateFromCache();
        };

        ndk?.on("event:publish-failed", handlePublishFailed);

        // Cleanup function
        return () => {
            ndk?.off("event:publish-failed", handlePublishFailed);
        };
    }, [ndk, updateStateFromCache]);

    return unpublishedEvents;
}