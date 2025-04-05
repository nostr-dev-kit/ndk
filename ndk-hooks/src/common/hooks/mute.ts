import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useCallback, useMemo } from "react";
import type { MuteCriteria } from "../../subscribe/store"; // Corrected path and added 'type' keyword
import { isMuted } from "../../utils/mute"; // Corrected path

/**
 * Provides a memoized filter function to check if an NDKEvent should be muted
 * based on the active session's mute lists.
 *
 * @returns {(event: NDKEvent) => boolean} A function that returns `true` if the event should be filtered (muted), `false` otherwise.
 */
export function useMuteFilter(): (event: NDKEvent) => boolean {
    const activeSession = useNDKSessions((s) => (s.activePubkey ? s.sessions.get(s.activePubkey) : undefined));

    const muteCriteria = useMemo((): MuteCriteria => {
        const pubkeys = activeSession?.mutedPubkeys ?? new Set<string>();
        const eventIds = activeSession?.mutedEventIds ?? new Set<string>();
        const hashtags = activeSession?.mutedHashtags ?? new Set<string>();
        const words = activeSession?.mutedWords ?? new Set<string>();

        const wordsRegex = words.size > 0 ? new RegExp(Array.from(words).join("|"), "i") : null;

        const lowerCaseHashtags = new Set<string>();
        for (const h of hashtags) {
            // Changed forEach to for...of
            lowerCaseHashtags.add(h.toLowerCase());
        }

        return {
            mutedPubkeys: pubkeys,
            mutedEventIds: eventIds,
            mutedHashtags: lowerCaseHashtags,
            mutedWordsRegex: wordsRegex,
        };
    }, [activeSession]);

    const filterFn = useCallback(
        (event: NDKEvent): boolean => {
            return isMuted(event, muteCriteria);
        },
        [muteCriteria],
    );

    return filterFn;
}

import { NDKUser } from "@nostr-dev-kit/ndk";
import { useNDKSessions } from "../../session/store"; // Corrected import path

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
    publish = true, // Removed explicit type annotation
): (item: MutableItem) => void {
    const { activePubkey } = useNDKSessions((state) => ({
        activePubkey: state.activePubkey,
    }));

    const muteFn = useCallback(
        (item: MutableItem) => {
            if (!activePubkey) {
                console.warn("useMuteItem: No active session found. Cannot mute item.");
                return;
            }

            let itemType: "pubkey" | "hashtag" | "word" | "event";
            let value: string;

            if (item instanceof NDKEvent) {
                itemType = "event";
                value = item.id;
            } else if (item instanceof NDKUser) {
                itemType = "pubkey";
                value = item.pubkey;
            } else if (typeof item === "string") {
                if (item.startsWith("#") && item.length > 1) {
                    itemType = "hashtag";
                    value = item.substring(1);
                } else {
                    itemType = "word";
                    value = item;
                }
            } else {
                console.warn("useMuteItem: Invalid item type provided.", item);
                return;
            }
        },
        [activePubkey], // Removed unused 'publish' dependency
    );

    return muteFn;
}
