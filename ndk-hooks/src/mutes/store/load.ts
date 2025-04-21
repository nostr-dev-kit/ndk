import type { NDKMutesState } from "./types";
import type { Hexpubkey, NDKEvent } from "@nostr-dev-kit/ndk";
import { initMutes } from "./init";

/**
 * Loads a mute list event into the mute store for a user.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param pubkey The user's public key
 * @param event The mute list event (kind 10000)
 */
export const loadMuteList = (
    set: (state: any) => void,
    get: () => NDKMutesState,
    pubkey: Hexpubkey,
    event: NDKEvent,
) => {
    set((state: any) => {
        // Initialize mutes if they don't exist
        if (!state.mutes.has(pubkey)) {
            initMutes(set, get, pubkey);
        }

        const userMutes = state.mutes.get(pubkey);
        if (!userMutes) return;

        const newMutedPubkeys = new Set<Hexpubkey>();
        const newMutedEvents = new Set<string>();
        const newMutedHashtags = new Set<string>();
        const newMutedWords = new Set<string>();

        for (const tag of event.tags) {
            if (tag[0] === "p") newMutedPubkeys.add(tag[1]);
            else if (tag[0] === "e") newMutedEvents.add(tag[1]);
            else if (tag[0] === "t") newMutedHashtags.add(tag[1]);
            else if (tag[0] === "word") newMutedWords.add(tag[1]);
        }

        userMutes.pubkeys = newMutedPubkeys;
        userMutes.eventIds = newMutedEvents;
        userMutes.hashtags = newMutedHashtags;
        userMutes.words = newMutedWords;
        userMutes.muteListEvent = event;
    });
};
