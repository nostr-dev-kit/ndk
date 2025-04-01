import { useActiveSessionData, useNDKSessions } from '../session/store';

/**
 * Returns the list of followed pubkeys (as NDKUser objects) for the active session.
 * Returns an empty array if there is no active session or no follows list.
 */
export const useFollows = (): string[] => {
    const activeSession = useActiveSessionData();
    return activeSession?.follows ?? [];
};

/**
 * Returns the mute list data for the active session.
 * Includes sets of muted pubkeys, hashtags, words, event IDs, and the raw mute list event.
 * Returns default empty sets and undefined for the event if no active session exists.
 */
export const useMuteList = () => {
    const activeSession = useActiveSessionData();
    const event = activeSession?.muteListEvent;
    const pubkeys = activeSession?.mutedPubkeys ?? new Set<string>();
    const hashtags = activeSession?.mutedHashtags ?? new Set<string>();
    const words = activeSession?.mutedWords ?? new Set<string>();
    const eventIds = activeSession?.mutedEventIds ?? new Set<string>();

    return { pubkeys, hashtags, words, eventIds, event };
};