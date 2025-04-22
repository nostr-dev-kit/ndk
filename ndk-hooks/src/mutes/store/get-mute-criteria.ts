import { EMPTY_MUTE_CRITERIA } from "../hooks/use-mute-filter";
import type { NDKMutesState, MuteCriteria } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";

/**
 * Get mute criteria for a user
 */
export const getMuteCriteria = (get: () => NDKMutesState, pubkey: Hexpubkey): MuteCriteria => {
    const userMutes = get().mutes.get(pubkey);
    const extraMutes = get().extraMutes;

    if (!userMutes) {
        // If there are no user mutes but we have extra mutes, return a combined criteria
        if (extraMutes) {
            return {
                pubkeys: extraMutes.pubkeys,
                eventIds: extraMutes.eventIds,
                hashtags: extraMutes.hashtags,
                words: extraMutes.words,
            };
        }
        return EMPTY_MUTE_CRITERIA;
    }

    // Combine user mutes and extra mutes
    const combinedCriteria: MuteCriteria = {
        pubkeys: new Set([...userMutes.pubkeys, ...extraMutes.pubkeys]),
        eventIds: new Set([...userMutes.eventIds, ...extraMutes.eventIds]),
        hashtags: new Set([...userMutes.hashtags, ...extraMutes.hashtags]),
        words: new Set([...userMutes.words, ...extraMutes.words]),
    };

    return combinedCriteria;
};
