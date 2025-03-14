import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNDKStore } from "../stores/ndk.js";
import { SettingsStore } from "../types.js";

export const useNDK = () => {
    const ndk = useNDKStore((s) => s.ndk);
    const login = useNDKStore((s) => s.login);
    const logout = useNDKStore((s) => s.logout);

    return { ndk, login, logout };
};

export const useNDKInit = (ndk: NDK, settingsStore: SettingsStore) => {
    const storeInit = useNDKStore((s) => s.init);

    useEffect(() => {
        storeInit(ndk, settingsStore);
    }, []);
};

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
            entries.forEach((entry) => {
                if (!previousEntries.has(entry.event.id)) newEntries.push(entry);
            });

            state.current = newEntries;
            setUnpublishedEvents(newEntries);

            // listen for the new events
            newEntries.forEach((entry) => {
                entry.event.on("published", () => {
                    state.current = state.current?.filter((e) => e.event.id !== entry.event.id);
                    setUnpublishedEvents(state.current);
                });
            });
        }
    }, [ndk, setUnpublishedEvents]);

    useEffect(() => {
        if (!ndk?.cacheAdapter?.getUnpublishedEvents) return;

        // first load
        updateStateFromCache();

        ndk.on("event:publish-failed", (event: NDKEvent) => {
            console.log("publish failed on hook", event.id);
            updateStateFromCache();
        });
    }, []);

    return unpublishedEvents;
}
