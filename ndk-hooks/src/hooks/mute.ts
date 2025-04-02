import { NDKEvent } from '@nostr-dev-kit/ndk'; // Changed to regular import
import { useCallback, useMemo } from 'react';
import { useUserSession } from '../session';
import { type MuteCriteria } from '../stores/subscribe'; // Assuming MuteCriteria is exported from here
import { isMuted } from '../utils/mute'; // Import the utility function

// Removed duplicated helper functions: setHasAnyIntersection and isMuted
// They are now imported from ../utils/mute.ts

/**
 * Provides a memoized filter function to check if an NDKEvent should be muted
 * based on the active session's mute lists.
 *
 * @returns {(event: NDKEvent) => boolean} A function that returns `true` if the event should be filtered (muted), `false` otherwise.
 */
export function useMuteFilter(): (event: NDKEvent) => boolean {
    const activeSessionData = useUserSession();

    // Prepare mute criteria from active session, memoized for performance
    const muteCriteria = useMemo((): MuteCriteria => {
        const pubkeys = activeSessionData?.mutedPubkeys ?? new Set<string>();
        const eventIds = activeSessionData?.mutedEventIds ?? new Set<string>();
        const hashtags = activeSessionData?.mutedHashtags ?? new Set<string>();
        const words = activeSessionData?.mutedWords ?? new Set<string>();

        // Pre-compile regex for words for performance
        const wordsRegex =
            words.size > 0
                ? new RegExp(Array.from(words).join('|'), 'i')
                : null;

        // Pre-lowercase hashtags for performance
        const lowerCaseHashtags = new Set<string>();
        hashtags.forEach((h) => lowerCaseHashtags.add(h.toLowerCase()));

        return {
            mutedPubkeys: pubkeys,
            mutedEventIds: eventIds,
            mutedHashtags: lowerCaseHashtags,
            mutedWordsRegex: wordsRegex,
        };
    }, [activeSessionData]);

    // Return a memoized filter function that uses the derived criteria
    const filterFn = useCallback(
        (event: NDKEvent): boolean => {
            return isMuted(event, muteCriteria);
        },
        [muteCriteria] // Re-create the filter function only when mute criteria change
    );

    return filterFn;
}

import { NDKUser } from '@nostr-dev-kit/ndk'; // Changed to regular import
import { useNDKSessions } from '../session'; // Import the main store hook

/**
 * Type definition for the item that can be muted.
 */
type MutableItem = NDKEvent | NDKUser | string;

/**
 * Hook that provides a function to mute an item (event, user, hashtag, or word)
 * for the currently active session.
 *
 * @param publish Optional boolean (default: true) indicating whether to publish the updated mute list event.
 * @returns {(item: MutableItem) => void} A memoized function to call with the item to mute.
 *          Does nothing if there is no active session.
 */
export function useMuteItem(
    publish: boolean = true
): (item: MutableItem) => void {
    const { activeSessionPubkey, muteItemForSession } = useNDKSessions(
        (state) => ({
            activeSessionPubkey: state.activeSessionPubkey,
            muteItemForSession: state.muteItemForSession,
        })
    );

    const muteFn = useCallback(
        (item: MutableItem) => {
            if (!activeSessionPubkey) {
                console.warn(
                    'useMuteItem: No active session found. Cannot mute item.'
                );
                return;
            }

            let itemType: 'pubkey' | 'hashtag' | 'word' | 'event';
            let value: string;

            if (item instanceof NDKEvent) {
                itemType = 'event';
                value = item.id;
            } else if (item instanceof NDKUser) {
                itemType = 'pubkey';
                value = item.pubkey;
            } else if (typeof item === 'string') {
                if (item.startsWith('#') && item.length > 1) {
                    itemType = 'hashtag';
                    value = item.substring(1); // Remove the #
                } else {
                    itemType = 'word';
                    value = item;
                }
            } else {
                console.warn('useMuteItem: Invalid item type provided.', item);
                return;
            }

            muteItemForSession(activeSessionPubkey, value, itemType, publish);
        },
        [activeSessionPubkey, muteItemForSession, publish]
    );

    return muteFn;
}
