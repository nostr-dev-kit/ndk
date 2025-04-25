import type { NDKMutesState } from "./types";
import type { Hexpubkey, NDKEvent } from "@nostr-dev-kit/ndk";
import { initMutes } from "./init";
import { computeMuteCriteria } from "../utils/compute-mute-criteria";
import { EMPTY_MUTE_CRITERIA } from "../hooks";

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
    event: NDKEvent,
) => {
    set((state: any) => {
        const pubkey = event.pubkey;

        // Initialize mutes if they don't exist
        if (!state.mutes.has(pubkey)) {
            initMutes(set, get, pubkey);
        }

        const userMutes = state.mutes.get(pubkey) ?? EMPTY_MUTE_CRITERIA
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

        // Update muteCriteria if this is the active pubkey
        if (state.activePubkey === pubkey) {
            state.muteCriteria = computeMuteCriteria(userMutes, state.extraMutes);
        }
    });
};
