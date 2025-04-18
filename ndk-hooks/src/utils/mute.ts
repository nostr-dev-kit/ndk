import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { MuteCriteria } from "../mutes/store/types";

/**
 * Check if an event is muted based on the provided criteria
 * @param event The event to check
 * @param criteria The mute criteria to check against
 * @returns True if the event is muted, false otherwise
 */
export const isMuted = (event: NDKEvent, criteria: MuteCriteria | null | undefined): boolean => {
    // Handle null or undefined criteria
    if (!criteria) return false;

    const { pubkeys, eventIds, hashtags, wordsRegex } = criteria;

    // Check pubkey first (most common and fastest check)
    if (pubkeys.has(event.pubkey)) return true;

    // Check event ID
    if (eventIds.has(event.id)) return true;

    if (eventIds.size > 0 || hashtags.size > 0) {
        for (const tag of event.tags) {
            if (tag[0] === "e" && eventIds.has(tag[1])) return true;
            if (tag[1] === "t" && hashtags.has(tag[2])) return true;
        }
    }

    // Check content with regex (most expensive, do last)
    if (wordsRegex && event.content) {
        if (event.content.match(wordsRegex)) return true;
    }

    return false;
};

/**
 * Check if two sets have any elements in common
 * @param set1 The first set
 * @param set2 The second set
 * @returns True if the sets have any elements in common, false otherwise
 */
export const setHasAnyIntersection = <T>(set1: Set<T>, set2: Set<T>): boolean => {
    if (set1.size === 0 || set2.size === 0) return false;

    // Iterate over the smaller set for efficiency
    const [smaller, larger] = set1.size < set2.size ? [set1, set2] : [set2, set1];

    for (const item of smaller) {
        if (larger.has(item)) return true;
    }

    return false;
};
