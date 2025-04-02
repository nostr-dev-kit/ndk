// src/session/store/processMuteListForSession.ts (File renamed conceptually)
import type { StoreApi } from "zustand";
import { NDKKind } from "@nostr-dev-kit/ndk";
import type { SessionState } from "../types";
import { processMuteList } from "../utils.js"; // Needs the utility function

/**
 * Processes the mute list event (Kind 10000) stored in the session's
 * replaceableEvents map and updates the derived muted sets.
 * This should be called whenever the Kind 10000 event changes.
 */
export function processMuteListForSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'],
    pubkey: string,
): void {
    set((state) => {
        const session = state.sessions.get(pubkey);
        // Ensure session and replaceableEvents map exist
        if (!session || !session.replaceableEvents) return state;

        // Get the mute list event from the map
        const muteListEvent = session.replaceableEvents.get(NDKKind.MuteList);

        // Default to empty sets if no mute list event is found
        let mutedPubkeys = new Set<string>();
        let mutedHashtags = new Set<string>();
        let mutedWords = new Set<string>();
        let mutedEventIds = new Set<string>();

        // Process the event if it exists
        if (muteListEvent) {
            const processed = processMuteList(muteListEvent);
            mutedPubkeys = processed.mutedPubkeys;
            mutedHashtags = processed.mutedHashtags;
            mutedWords = processed.mutedWords;
            mutedEventIds = processed.mutedEventIds;
        }

        // Update the session with the derived sets
        const updatedSession = {
            ...session,
            // No longer storing muteListEvent here directly
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