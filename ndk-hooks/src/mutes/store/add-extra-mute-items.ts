import type { NDKMutesState, MuteableItem } from "./types";
import { identifyMuteItem } from "../utils/identify-mute-item";

/**
 * Adds multiple extra mute items to the application-level mute store.
 * These items won't be included in the published mute list.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param items Array of items to mute
 */
export const addExtraMuteItems = (
    set: (state: any) => void,
    get: () => NDKMutesState,
    items: MuteableItem[],
) => {
    set((state: any) => {
        for (const item of items) {
            const identified = identifyMuteItem(item);
            if (!identified) continue;

            const { type, value } = identified;

            switch (type) {
                case "pubkey":
                    state.extraMutes.pubkeys.add(value);
                    break;
                case "event":
                    state.extraMutes.eventIds.add(value);
                    break;
                case "hashtag":
                    state.extraMutes.hashtags.add(value.toLowerCase());
                    break;
                case "word":
                    state.extraMutes.words.add(value.toLowerCase());
                    break;
            }
        }
    });
};