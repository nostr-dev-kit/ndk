// src/session/store/muteItemForSession.ts
import type { StoreApi } from "zustand";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { SessionState } from "../types";

export function muteItemForSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'],
    pubkey: string,
    value: string,
    itemType: "pubkey" | "hashtag" | "word" | "event",
    publish: boolean = true,
): void {
    const session = get().sessions.get(pubkey);
    // Need session and NDK instance to publish
    if (!session || (publish && !session.ndk)) {
        console.warn(`Cannot mute item for session ${pubkey}: Session or NDK instance missing.`);
        return;
    }

    // 1. Get current mute list event or create an empty placeholder
    const currentMuteEvent = session.replaceableEvents?.get(NDKKind.MuteList) ?? new NDKEvent(session.ndk);
    currentMuteEvent.kind = NDKKind.MuteList; // Ensure kind is set if it was new

    // 2. Determine tag type and check if already muted in the event tags
    let tagType: string;
    let alreadyMuted = false;
    const lowerCaseValue = value.toLowerCase(); // Hashtags are case-insensitive

    switch (itemType) {
        case "pubkey":
            tagType = "p";
            alreadyMuted = currentMuteEvent.tags.some(tag => tag[0] === tagType && tag[1] === value);
            break;
        case "hashtag":
            tagType = "t";
            alreadyMuted = currentMuteEvent.tags.some(tag => tag[0] === tagType && tag[1]?.toLowerCase() === lowerCaseValue);
            break;
        case "word":
            tagType = "word";
            alreadyMuted = currentMuteEvent.tags.some(tag => tag[0] === tagType && tag[1] === value);
            break;
        case "event":
            tagType = "e";
            alreadyMuted = currentMuteEvent.tags.some(tag => tag[0] === tagType && tag[1] === value);
            break;
        default:
            console.error(`Invalid itemType for muting: ${itemType}`);
            return;
    }

    if (alreadyMuted) {
        console.debug(`Item ${value} (${itemType}) already muted.`);
        return; // No change needed
    }

    // 3. Perform optimistic update to the store state
    set((state) => {
        const currentSessionState = state.sessions.get(pubkey);
        if (!currentSessionState) return state; // Session might have been deleted

        const newSession = { ...currentSessionState }; // Clone session
        let changed = false;

        switch (itemType) {
            case "pubkey":
                newSession.mutedPubkeys = new Set(newSession.mutedPubkeys).add(value);
                changed = true;
                break;
            case "hashtag":
                newSession.mutedHashtags = new Set(newSession.mutedHashtags).add(lowerCaseValue);
                changed = true;
                break;
            case "word":
                newSession.mutedWords = new Set(newSession.mutedWords).add(value);
                changed = true;
                break;
            case "event":
                newSession.mutedEventIds = new Set(newSession.mutedEventIds).add(value);
                changed = true;
                break;
        }

        if (changed) {
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, newSession);
            return { sessions: newSessions };
        }
        return state; // Should not happen if alreadyMuted check passed, but safety first
    });


    // 4. Create and publish the new event if requested
    if (publish && session.ndk) {
        const newEvent = new NDKEvent(session.ndk);
        newEvent.kind = NDKKind.MuteList;
        // Copy existing tags
        newEvent.tags = currentMuteEvent.tags.map(tag => [...tag]); // Deep copy tags
        // Add the new tag
        newEvent.tags.push([tagType, value]);
        // Content can be empty or stringified JSON of tags, often empty for mute lists
        newEvent.content = "";

        // Sign and publish
        newEvent.publish()
            .then(() => {
                console.debug(`Published updated mute list for ${pubkey}, added ${itemType}: ${value}`);
            })
            .catch((error) => {
                console.error(`Failed to publish mute list update for ${pubkey}:`, error);
                // TODO: Consider reverting the optimistic update here?
                // This is complex as the state might have changed again.
                // For now, log the error. The reactive flow might eventually correct it
                // if the event arrives via subscription despite publish failure reporting.
            });
    }
}