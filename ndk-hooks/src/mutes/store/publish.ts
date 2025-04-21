import type { NDKMutesState } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNDKSessions } from "../../session/store";

/**
 * Publishes the mute list for a user as a Nostr event (kind 10000).
 * @param get Zustand get function
 * @param pubkey The user's public key
 * @returns The published NDKEvent or undefined if publishing failed
 */
export const publishMuteList = async (get: () => NDKMutesState, pubkey: Hexpubkey): Promise<NDKEvent | undefined> => {
    const userMutes = get().mutes.get(pubkey);
    if (!userMutes) return undefined;

    // Get NDK instance from session store
    const ndk = useNDKSessions.getState().ndk;
    if (!ndk) return undefined;

    // Create a new mute list event
    // @ts-ignore - NDK types are not fully compatible
    const event = new ndk.NDKEvent(ndk);
    event.kind = 10000;
    event.content = "";

    // Add tags for muted items
    for (const mutedPubkey of userMutes.pubkeys) {
        event.tags.push(["p", mutedPubkey]);
    }

    for (const mutedEventId of userMutes.eventIds) {
        event.tags.push(["e", mutedEventId]);
    }

    for (const mutedHashtag of userMutes.hashtags) {
        event.tags.push(["t", mutedHashtag]);
    }

    for (const mutedWord of userMutes.words) {
        event.tags.push(["word", mutedWord]);
    }

    try {
        // Sign and publish the event
        await event.sign();
        await event.publish();

        // Update the mute list event in the store
        get().loadMuteList(pubkey, event);

        return event;
    } catch (error) {
        console.error("Failed to publish mute list:", error);
        return undefined;
    }
};
