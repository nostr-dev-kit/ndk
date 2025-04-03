import type { StoreApi } from 'zustand';
import type { NDKSessionsState } from './index';

/**
 * Adds an item to the appropriate mute list set within a specific session's data.
 * Does NOT publish the updated mute list event.
 */
export function muteItemForSession(
    set: StoreApi<NDKSessionsState>['setState'],
    get: StoreApi<NDKSessionsState>['getState'],
    pubkey: string,
    value: string,
    itemType: 'pubkey' | 'hashtag' | 'word' | 'event'
    // Removed publish parameter
): void {
    set((state) => {
        const session = state.sessions.get(pubkey);
        if (!session) {
            console.warn(`Session not found for pubkey ${pubkey} in muteItemForSession`);
            return state; // Return current state if session doesn't exist
        }

        // Create copies of the sets to avoid direct mutation
        const mutedPubkeys = new Set(session.mutedPubkeys);
        const mutedHashtags = new Set(session.mutedHashtags);
        const mutedWords = new Set(session.mutedWords);
        const mutedEventIds = new Set(session.mutedEventIds);

        // Add the item to the correct set
        switch (itemType) {
            case 'pubkey':
                mutedPubkeys.add(value);
                break;
            case 'hashtag':
                // Store hashtags consistently (e.g., lowercase) if needed
                mutedHashtags.add(value.startsWith('#') ? value.substring(1) : value);
                break;
            case 'word':
                mutedWords.add(value);
                break;
            case 'event':
                mutedEventIds.add(value);
                break;
        }

        // Create the updated session object
        const updatedSession = {
            ...session,
            mutedPubkeys,
            mutedHashtags,
            mutedWords,
            mutedEventIds,
        };

        // Create a new map for the sessions state
        const newSessions = new Map(state.sessions);
        newSessions.set(pubkey, updatedSession);

        // Return the updated state
        return { sessions: newSessions };
    });

    // Note: Publishing the Kind 10000 event should be handled
    // by a separate mechanism (e.g., a hook) that observes
    // changes in the session store and uses the global NDK instance.
}
