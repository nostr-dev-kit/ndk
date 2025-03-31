import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNDKStore } from "../stores/ndk.js";
import type { SettingsStore } from "../types.js";
import { useUserProfilesStore } from "@nostr-dev-kit/ndk-hooks";

export const useNDK = () => {
    const ndk = useNDKStore((s) => s.ndk);
    const login = useNDKStore((s) => s.login);
    const logout = useNDKStore((s) => s.logout);

    return { ndk, login, logout };
};

/**
 * Initialize NDK and connected stores
 * @param options - NDK initialization options
 * @param explicitRelayUrls - Optional explicit relay URLs to connect to
 */
export function useNDKInit(ndk: NDK, settingsStore: SettingsStore) {
    const storeInit = useNDKStore((s) => s.init);
    const userStoreInit = useUserProfilesStore((s) => s.initialize);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        storeInit(ndk, settingsStore);
        userStoreInit(ndk);
    }, []);
}

export const useNDKCurrentUser = () => useNDKStore((s) => s.currentUser);

export function useNDKUnpublishedEvents() {
    const { ndk } = useNDK();
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

        if (entries.length !== state.current?.length) {
            // find the new entries so we can return listen when they publish
            for (const entry of entries) {
                if (!previousEntries.has(entry.event.id)) newEntries.push(entry);
            }

            state.current = newEntries;
            setUnpublishedEvents(newEntries);

            // listen for the new events
            for (const entry of newEntries) {
                entry.event.on("published", () => {
                    state.current = state.current?.filter((e) => e.event.id !== entry.event.id);
                    setUnpublishedEvents(state.current);
                });
            }
        }
    }, [ndk]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!ndk?.cacheAdapter?.getUnpublishedEvents) return;

        // first load
        updateStateFromCache();

        ndk.on("event:publish-failed", (_event: NDKEvent) => {
            updateStateFromCache();
        });
    }, []);

    return unpublishedEvents;
}
