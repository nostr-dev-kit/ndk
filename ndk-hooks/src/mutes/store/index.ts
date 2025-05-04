import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Hexpubkey, NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKMutesState, NDKUserMutes, MuteableItem } from "./types";
import { initMutes } from "./init";
import { loadMuteList } from "./load";
import { mute } from "./mute";
import { unmute } from "./unmute";
import { setActivePubkey } from "./set-active-pubkey";
import { addExtraMuteItems } from "./add-extra-mute-items";

/**
 * Create the mute store
 */
import NDK, { NDKList } from "@nostr-dev-kit/ndk";

const mutesStateCreator = (set: (state: any) => void, get: () => NDKMutesState) => ({
    ndk: undefined, // Will be set by init
    mutes: new Map<string, NDKUserMutes>(),
    extraMutes: {
        pubkeys: new Set<string>(),
        hashtags: new Set<string>(),
        words: new Set<string>(),
        eventIds: new Set<string>(),
    },
    activePubkey: null,
    muteList: new NDKList(),
    muteCriteria: {
        pubkeys: new Set<string>(),
        eventIds: new Set<string>(),
        hashtags: new Set<string>(),
        words: new Set<string>(),
    },

    /**
     * Initialize the mute store with an NDK instance.
     */
    init: (ndkInstance: NDK) => {
        set((state: NDKMutesState) => {
            state.ndk = ndkInstance;
        });
    },

    initMutes: (pubkey: Hexpubkey) => initMutes(set, get, pubkey),
    loadMuteList: (event: NDKEvent) => loadMuteList(set, get, event),
    mute: (item: MuteableItem, pubkey?: Hexpubkey) => mute(set, get, item, pubkey),
    unmute: (item: MuteableItem, pubkey?: Hexpubkey) => unmute(set, get, item, pubkey),
    setActivePubkey: (pubkey: Hexpubkey | null) => setActivePubkey(set, pubkey),
    addExtraMuteItems: (items: MuteableItem[]) => addExtraMuteItems(set, get, items),
});

// Create the store using the Immer middleware
/**
 * Factory function to create a Zustand store for NDK mutes, given an NDK instance.
 */
export const useNDKMutes = create(immer(mutesStateCreator));
// Export the state type
export type { NDKMutesState };
