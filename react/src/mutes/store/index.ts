/**
 * Create the mute store
 */
import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKList } from "@nostr-dev-kit/ndk";
import { create } from "zustand";
import { addExtraMuteItems } from "./add-extra-mute-items";
import { initMutes } from "./init";
import { loadMuteList } from "./load";
import { mute } from "./mute";
import { setActivePubkey } from "./set-active-pubkey";
import type { MuteableItem, NDKMutesState, NDKUserMutes } from "./types";
import { unmute } from "./unmute";

const mutesStateCreator = (
    set: (partial: Partial<NDKMutesState> | ((state: NDKMutesState) => Partial<NDKMutesState>)) => void,
    get: () => NDKMutesState,
) => ({
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
        set({ ndk: ndkInstance });
    },

    initMutes: (pubkey: Hexpubkey) => initMutes(set, get, pubkey),
    loadMuteList: (event: NDKEvent) => loadMuteList(set, get, event),
    mute: (item: MuteableItem, pubkey?: Hexpubkey) => mute(set, get, item, pubkey),
    unmute: (item: MuteableItem, pubkey?: Hexpubkey) => unmute(set, get, item, pubkey),
    setActivePubkey: (pubkey: Hexpubkey | null) => setActivePubkey(set, pubkey),
    addExtraMuteItems: (items: MuteableItem[]) => addExtraMuteItems(set, get, items),
});

export const useNDKMutes = create(mutesStateCreator);
