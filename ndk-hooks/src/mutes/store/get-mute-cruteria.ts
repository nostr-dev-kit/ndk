import { EMPTY_MUTE_CRITERIA } from "../hooks/use-mute-filter";
import type { NDKMutesState, MuteCriteria } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";

/**
 * Get mute criteria for a user
 */
export const getMuteCriteria = (get: () => NDKMutesState, pubkey: Hexpubkey): MuteCriteria => {
    const userMutes = get().mutes.get(pubkey);

    if (!userMutes) {
        return EMPTY_MUTE_CRITERIA;
    }

    return userMutes;
};
