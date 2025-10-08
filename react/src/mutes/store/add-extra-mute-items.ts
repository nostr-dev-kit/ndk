import { computeMuteCriteria } from "../utils/compute-mute-criteria";
import { identifyMuteItem } from "../utils/identify-mute-item";
import type { MuteableItem, NDKMutesState } from "./types";

/**
 * Adds multiple extra mute items to the application-level mute store.
 * These items won't be included in the published mute list.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param items Array of items to mute
 */
export const addExtraMuteItems = (
    set: (partial: Partial<NDKMutesState> | ((state: NDKMutesState) => Partial<NDKMutesState>)) => void,
    get: () => NDKMutesState,
    items: MuteableItem[],
) => {
    set((state) => {
        // Clone sets for immutability
        const pubkeys = new Set(state.extraMutes.pubkeys);
        const eventIds = new Set(state.extraMutes.eventIds);
        const hashtags = new Set(state.extraMutes.hashtags);
        const words = new Set(state.extraMutes.words);

        for (const item of items) {
            const identified = identifyMuteItem(item);
            if (!identified) continue;

            const { type, value } = identified;

            switch (type) {
                case "pubkey":
                    pubkeys.add(value);
                    break;
                case "event":
                    eventIds.add(value);
                    break;
                case "hashtag":
                    hashtags.add(value.toLowerCase());
                    break;
                case "word":
                    words.add(value.toLowerCase());
                    break;
            }
        }

        const newExtraMutes = {
            pubkeys,
            eventIds,
            hashtags,
            words,
        };

        // Update muteCriteria for the current active pubkey
        const userMutes = state.activePubkey ? state.mutes.get(state.activePubkey) : undefined;
        return {
            extraMutes: newExtraMutes,
            muteCriteria: computeMuteCriteria(userMutes, newExtraMutes),
        };
    });
};
