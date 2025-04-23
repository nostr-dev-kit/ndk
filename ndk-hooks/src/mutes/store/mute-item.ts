import type { NDKMutesState, MuteItemType, PublishMuteListOptions } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { initMutes } from "./init";
import { computeMuteCriteria } from "../utils/compute-mute-criteria";

/**
 * Mutes an item (pubkey, event, hashtag, or word) for a user in the mute store.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param pubkey The user's public key
 * @param item The item to mute
 * @param type The type of the item
 * @param options Options for publishing the mute list
 */
export const muteItem = (
    set: (state: any) => void,
    get: () => NDKMutesState,
    pubkey: Hexpubkey,
    item: string,
    type: MuteItemType,
    options?: PublishMuteListOptions,
) => {
    set((state: any) => {
        // Initialize mutes if they don't exist
        if (!state.mutes.has(pubkey)) {
            initMutes(set, get, pubkey);
        }

        const userMutes = state.mutes.get(pubkey);
        if (!userMutes) return;

        switch (type) {
            case "pubkey":
                userMutes.pubkeys.add(item);
                break;
            case "event":
                userMutes.eventIds.add(item);
                break;
            case "hashtag":
                userMutes.hashtags.add(item);
                break;
            case "word":
                userMutes.words.add(item);
                break;
        }

        // Update muteCriteria if this is the active pubkey
        if (state.activePubkey === pubkey) {
            state.muteCriteria = computeMuteCriteria(userMutes, state.extraMutes);
        }
    });

    // Publish the updated mute list if requested
    if (options?.publish !== false) {
        get().publishMuteList(pubkey);
    }
};
