import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Hexpubkey, NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKMutesState, NDKUserMutes, MuteItemType, PublishMuteListOptions, MuteableItem } from "./types";
import { initMutes } from "./init";
import { getMuteCriteria } from "./get-mute-cruteria";
import { loadMuteList } from "./load";
import { muteItem } from "./mute-item";
import { unmuteItem } from "./unmute-item";
import { setActivePubkey } from "./set-active-pubkey";
import { publishMuteList } from "./publish";
import { isItemMuted } from "./is-item-muted";
import { addExtraMuteItems } from "./add-extra-mute-items";

// Enable Map and Set support for Immer
enableMapSet();

/**
 * Create the mute store
 */
// Using any types to avoid complex type issues with Immer and Zustand
// In a real implementation, we would properly type these
// @ts-ignore - Using simpler types to avoid complex type issues with Immer and Zustand
const mutesStateCreator = (set: (state: any) => void, get: () => NDKMutesState) => ({
    mutes: new Map<Hexpubkey, NDKUserMutes>(),
    extraMutes: {
        pubkeys: new Set<Hexpubkey>(),
        hashtags: new Set<string>(),
        words: new Set<string>(),
        eventIds: new Set<string>(),
    },
    activePubkey: null,

    initMutes: (pubkey: Hexpubkey) => initMutes(set, get, pubkey),
    loadMuteList: (pubkey: Hexpubkey, event: NDKEvent) => loadMuteList(set, get, pubkey, event),
    muteItem: (pubkey: Hexpubkey, item: string, type: MuteItemType, options?: PublishMuteListOptions) =>
        muteItem(set, get, pubkey, item, type, options),
    unmuteItem: (pubkey: Hexpubkey, item: string, type: MuteItemType, options?: PublishMuteListOptions) =>
        unmuteItem(set, get, pubkey, item, type, options),
    setActivePubkey: (pubkey: Hexpubkey | null) => setActivePubkey(set, pubkey),
    getMuteCriteria: (pubkey: Hexpubkey) => getMuteCriteria(get, pubkey),
    isItemMuted: (pubkey: Hexpubkey, item: string, type: MuteItemType) => isItemMuted(get, pubkey, item, type),
    addExtraMuteItems: (items: MuteableItem[]) =>
        addExtraMuteItems(set, get, items),
    publishMuteList: (pubkey: Hexpubkey) => publishMuteList(get, pubkey),
});

// Create the store using the Immer middleware
export const useNDKMutes = create(immer(mutesStateCreator));

// Export the state type
export type { NDKMutesState };
