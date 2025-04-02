import { NDKEvent } from '@nostr-dev-kit/ndk';
import { type MuteCriteria } from '../stores/subscribe'; // Assuming MuteCriteria is exported from here

/**
 * Checks if two sets have any common elements.
 * @param set1 First set.
 * @param set2 Second set.
 * @returns `true` if there is at least one common element, `false` otherwise.
 */
export const setHasAnyIntersection = (
    set1: Set<string>,
    set2: Set<string>
): boolean => {
    if (set1.size === 0 || set2.size === 0) return false;
    for (const item of set1) {
        if (set2.has(item)) return true;
    }
    return false;
};

/**
 * Checks if an event should be considered muted based on the provided criteria.
 * @param event The NDKEvent to check.
 * @param criteria The MuteCriteria containing sets of muted items and regex.
 * @returns `true` if the event matches any mute criteria, `false` otherwise.
 */
export const isMuted = (event: NDKEvent, criteria: MuteCriteria): boolean => {
    const { mutedPubkeys, mutedEventIds, mutedHashtags, mutedWordsRegex } =
        criteria;

    // Basic checks first for performance
    if (mutedPubkeys.has(event.pubkey)) return true;
    if (
        mutedWordsRegex &&
        event.content &&
        event.content.match(mutedWordsRegex)
    )
        return true;

    // Check tags only if necessary
    const tags = new Set(
        event.getMatchingTags('t').map((tag) => tag[1].toLowerCase())
    );
    if (setHasAnyIntersection(mutedHashtags, tags)) return true;

    const taggedEvents = new Set(
        event.getMatchingTags('e').map((tag) => tag[1])
    );
    taggedEvents.add(event.id); // Include the event's own ID
    if (setHasAnyIntersection(mutedEventIds, taggedEvents)) return true;

    return false;
};
