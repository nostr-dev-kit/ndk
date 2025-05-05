import type { NDKMutesState } from "./types";
import { NDKList, type Hexpubkey, type NDKEvent } from "@nostr-dev-kit/ndk";
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
    set: (partial: Partial<NDKMutesState> | ((state: NDKMutesState) => Partial<NDKMutesState>)) => void,
    get: () => NDKMutesState,
    event: NDKEvent
) => {
    set((state) => {
        const pubkey = event.pubkey;

        // Initialize mutes if they don't exist
        if (!state.mutes.has(pubkey)) {
            initMutes(set, get, pubkey);
        }

        const userMutes = state.mutes.get(pubkey) ?? EMPTY_MUTE_CRITERIA;
        if (!userMutes) return {};

        // Clone userMutes for immutability
        const updatedUserMutes = {
            ...userMutes,
            pubkeys: new Set<Hexpubkey>(),
            eventIds: new Set<string>(),
            hashtags: new Set<string>(),
            words: new Set<string>(),
            muteListEvent: NDKList.from(event),
        };

        for (const tag of event.tags) {
            if (tag[0] === "p") updatedUserMutes.pubkeys.add(tag[1]);
            else if (tag[0] === "e") updatedUserMutes.eventIds.add(tag[1]);
            else if (tag[0] === "t") updatedUserMutes.hashtags.add(tag[1]);
            else if (tag[0] === "word") updatedUserMutes.words.add(tag[1]);
        }

        // Clone mutes map and set updated user mutes
        const newMutes = new Map(state.mutes);
        newMutes.set(pubkey, updatedUserMutes);

        let update: Partial<NDKMutesState> = { mutes: newMutes };

        // Update muteCriteria and muteList if this is the active pubkey
        if (state.activePubkey === pubkey) {
            update = {
                ...update,
                muteCriteria: computeMuteCriteria(updatedUserMutes, state.extraMutes),
                muteList: NDKList.from(event),
            };
        }

        return update;
    });
};
