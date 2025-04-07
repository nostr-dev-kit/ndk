import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent, NDKPublishError, NDKUser } from "@nostr-dev-kit/ndk"; // Add NDKUser
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUserProfilesStore } from "../../profiles/store";
import { useNDKSessions } from "../../session/store"; // Import session store hook
import { type NDKStoreState, useNDKStore } from "../store"; // Corrected path

/**
 * Interface for the useNDK hook return value
 */
interface UseNDKResult extends Pick<NDKStoreState, "ndk" | "setNDK"> {}

/**
 * Hook to access the NDK instance and setNDK function
 *
 * @returns {UseNDKResult} Object containing the NDK instance and setNDK function
 */
export const useNDK = (): UseNDKResult => {
    const ndk = useNDKStore((state) => state.ndk);
    const setNDK = useNDKStore((state) => state.setNDK);

    return useMemo(() => ({ ndk, setNDK }), [ndk, setNDK]);
};

/**
 * Hook to access the NDKUser instance corresponding to the currently active session.
 * Retrieves the active pubkey from the session store and returns the NDKUser object.
 * Returns null if no session is active or NDK is not initialized.
 */
export const useNDKCurrentUser = (): NDKUser | null => {
    const ndk = useNDKStore((state) => state.ndk);
    const activePubkey = useNDKSessions((state) => state.activePubkey);

    return useMemo(() => {
        if (ndk && activePubkey) {
            return ndk.getUser({ pubkey: activePubkey });
        }
        return null;
    }, [ndk, activePubkey]);
};

/**
 * Hook to get the list of unpublished events from the NDK cache adapter.
 * It listens for publish failures and updates the list accordingly.
 * Requires the cache adapter to implement `getUnpublishedEvents`.
 * @returns An array of objects, each containing the unpublished event, optional target relays, and last attempt timestamp.
 */
export function useNDKUnpublishedEvents() {
    const { ndk } = useNDK();
    const [unpublishedEvents, setUnpublishedEvents] = useState<
        { event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]
    >([]);
    const state = useRef<{ event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]>([]);

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
                entry.event.on("published", () => {
                    state.current = state.current?.filter((e) => e.event.id !== entry.event.id);
                    setUnpublishedEvents(state.current);
                });
            }
        }
    }, [ndk]);

    useEffect(() => {
        if (!ndk?.cacheAdapter?.getUnpublishedEvents) return;

        updateStateFromCache();

        const handlePublishFailed = (_event: NDKEvent, _error: NDKPublishError, _relays: string[]) => {
            updateStateFromCache();
        };

        ndk?.on("event:publish-failed", handlePublishFailed);

        return () => {
            ndk?.off("event:publish-failed", handlePublishFailed);
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
    const initializeProfilesStore = useUserProfilesStore((state) => state.initialize);
    const initializeSessionStore = useNDKSessions((state) => state.init); // Get session init function

    /**
     * Initializes the NDK instance and dependent stores.
     * @param ndkInstance The configured NDK instance to use.
     */
    const initializeNDK = useCallback(
        (ndkInstance: NDK) => {
            if (!ndkInstance) {
                console.error("useNDKInit: Attempted to initialize with a null NDK instance.");
                return;
            }

            setNDK(ndkInstance);
            initializeProfilesStore(ndkInstance);
            initializeSessionStore(ndkInstance);
        },
        [setNDK, initializeProfilesStore, initializeSessionStore],
    );

    return initializeNDK;
}
