import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import NDK, { NDKEvent, NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import { computeMuteCriteria } from "../utils/compute-mute-criteria";
import { identifyMuteItem } from "../utils/identify-mute-item";
import type { MuteableItem, NDKMutesState } from "./types";

/**
 * Unmutes an item (pubkey, event, hashtag, or word) for a user in the mute store.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param item The item to unmute (NDKEvent, NDKUser, or string)
 * @param pubkey The user's public key (optional, uses active pubkey if undefined)
 */
export const unmute = (
    set: (partial: Partial<NDKMutesState> | ((state: NDKMutesState) => Partial<NDKMutesState>)) => void,
    get: () => NDKMutesState,
    item: MuteableItem,
    pubkey?: Hexpubkey,
) => {
    const identified = identifyMuteItem(item);
    if (!identified) {
        console.warn("unmute: Unable to identify item to unmute. Item:", item);
        return;
    }

    const state = get();
    const userPubkey = pubkey || state.activePubkey;
    if (!userPubkey) {
        console.warn("unmute: No pubkey provided and no active pubkey found.");
        return;
    }

    const userMutes = state.mutes.get(userPubkey);
    if (!userMutes) {
        console.warn("unmute: No mutes initialized for pubkey", userPubkey);
        return;
    }

    const muteEvent = userMutes.muteListEvent;
    if (!muteEvent) {
        console.warn("unmute: No existing mute list event to modify.");
        return;
    }

    set((state) => {
        const { type, value } = identified;
        const userMutes = state.mutes.get(userPubkey);
        if (!userMutes) return {};

        // Clone sets for immutability
        const pubkeys = new Set(userMutes.pubkeys);
        const eventIds = new Set(userMutes.eventIds);
        const hashtags = new Set(userMutes.hashtags);
        const words = new Set(userMutes.words);
        const muteEvent = userMutes.muteListEvent ? NDKList.from(userMutes.muteListEvent) : undefined;

        if (!muteEvent) {
            console.warn("unmute: No existing mute list event to modify.");
            return {};
        }

        switch (type) {
            case "pubkey":
                pubkeys.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag) => !(tag[0] === "p" && tag[1] === value));
                break;
            case "event":
                eventIds.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag) => !(tag[0] === "e" && tag[1] === value));
                break;
            case "hashtag":
                hashtags.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag) => !(tag[0] === "t" && tag[1] === value));
                break;
            case "word":
                words.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag) => !(tag[0] === "word" && tag[1] === value));
                break;
        }

        const updatedUserMutes = {
            ...userMutes,
            pubkeys,
            eventIds,
            hashtags,
            words,
            muteListEvent: muteEvent,
        };

        // Clone mutes map and set updated user mutes
        const newMutes = new Map(state.mutes);
        newMutes.set(userPubkey, updatedUserMutes);

        let update: Partial<NDKMutesState> = { mutes: newMutes };

        if (state.activePubkey === userPubkey) {
            update = {
                ...update,
                muteCriteria: computeMuteCriteria(updatedUserMutes, state.extraMutes),
                muteList: NDKList.from(muteEvent),
            };
        }

        // Publish after state update (side effect)
        setTimeout(() => muteEvent.publishReplaceable(), 0);

        return update;
    });
};
