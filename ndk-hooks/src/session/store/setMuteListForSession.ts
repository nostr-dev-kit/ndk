import { NDKKind } from '@nostr-dev-kit/ndk';
import type { StoreApi } from 'zustand';
import type { SessionState } from '../types';
import { processMuteList } from '../utils.js';

/**
 * Processes the mute list event (Kind 10000) stored in the session's
 * replaceableEvents map and updates the derived muted sets.
 * This should be called whenever the Kind 10000 event changes.
 */
export function processMuteListForSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'],
    pubkey: string
): void {
    set((state) => {
        const session = state.sessions.get(pubkey);
        if (!session || !session.replaceableEvents) return state;

        const muteListEvent = session.replaceableEvents.get(NDKKind.MuteList);

        let mutedPubkeys = new Set<string>();
        let mutedHashtags = new Set<string>();
        let mutedWords = new Set<string>();
        let mutedEventIds = new Set<string>();

        if (muteListEvent) {
            const processed = processMuteList(muteListEvent);
            mutedPubkeys = processed.mutedPubkeys;
            mutedHashtags = processed.mutedHashtags;
            mutedWords = processed.mutedWords;
            mutedEventIds = processed.mutedEventIds;
        }

        const updatedSession = {
            ...session,
            mutedPubkeys,
            mutedHashtags,
            mutedWords,
            mutedEventIds,
        };
        const newSessions = new Map(state.sessions);
        newSessions.set(pubkey, updatedSession);
        return { sessions: newSessions };
    });
}
