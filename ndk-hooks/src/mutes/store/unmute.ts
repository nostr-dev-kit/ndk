import type { NDKMutesState, MuteItemType } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import NDK, { NDKEvent, NDKKind, NDKUser } from "@nostr-dev-kit/ndk";
import type { MutableItem } from "./types";

import { computeMuteCriteria } from "../utils/compute-mute-criteria";

/**
 * Identifies the type and value of a mutable item
 * @param item The item to identify
 * @returns An object with the type and value of the item, or undefined if the item is invalid
 */
import { identifyMuteItem } from "../utils/identify-mute-item";

/**
 * Unmutes an item (pubkey, event, hashtag, or word) for a user in the mute store.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param pubkey The user's public key
 * @param item The item to unmute
 * @param type The type of the item
 * @param options Options for publishing the mute list
 */
/**
 * Unmutes an item (pubkey, event, hashtag, or word) for a user in the mute store.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param item The item to unmute (NDKEvent, NDKUser, or string)
 * @param pubkey The user's public key (optional, uses active pubkey if undefined)
 */
export const unmute = (
    set: (state: any) => void,
    get: () => NDKMutesState,
    item: MutableItem,
    pubkey?: Hexpubkey,
) => {
    const identified = identifyMuteItem(item);
    if (!identified) {
        console.warn("unmute: Unable to identify item to unmute. Item:", item);
        return;
    }

    const { type, value } = identified;
    set((state: any) => {
        // Use provided pubkey or active pubkey
        const userPubkey = pubkey || state.activePubkey;
        if (!userPubkey) {
            console.warn("unmute: No pubkey provided and no active pubkey found.");
            return;
        }

        const userMutes = state.mutes.get(userPubkey);
        if (!userMutes) return;
        
        const muteEvent = userMutes?.muteListEvent;
        if (!muteEvent) return;

        switch (type) {
            case "pubkey":
                userMutes.pubkeys.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag: string[]) => !(tag[0] === "p" && tag[1] === value));
                break;
            case "event":
                userMutes.eventIds.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag: string[]) => !(tag[0] === "e" && tag[1] === value));
                break;
            case "hashtag":
                userMutes.hashtags.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag: string[]) => !(tag[0] === "t" && tag[1] === value));
                break;
            case "word":
                userMutes.words.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag: string[]) => !(tag[0] === "word" && tag[1] === value));
                break;
        }

        // Update muteCriteria if this is the active pubkey
        if (state.activePubkey === userPubkey) {
            state.muteCriteria = computeMuteCriteria(userMutes, state.extraMutes);
        }
    });
};
