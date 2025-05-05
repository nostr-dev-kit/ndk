import type { NDKMutesState } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { initMutes } from "./init";
import { computeMuteCriteria } from "../utils/compute-mute-criteria";
import NDK, { NDKEvent, NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import type { MuteableItem } from "./types";
import { identifyMuteItem } from "../utils/identify-mute-item";

export function newMuteList(ndk: NDK) {
    const list = new NDKList(ndk);
    list.kind = NDKKind.MuteList;
    return list;
}

/**
 * Mutes an item (pubkey, event, hashtag, or word) for a user in the mute store.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param item The item to mute (NDKEvent, NDKUser, or string)
 * @param pubkey The user's public key (optional, uses active pubkey if undefined)
 */
export const mute = (
    set: (partial: Partial<NDKMutesState> | ((state: NDKMutesState) => Partial<NDKMutesState>)) => void,
    get: () => NDKMutesState,
    item: MuteableItem,
    pubkey?: Hexpubkey,
) => {
    const identified = identifyMuteItem(item);
    if (!identified) {
        console.warn("mute: Unable to identify item to mute. Item:", item);
        return;
    }

    const state = get();
    const userPubkey = pubkey || state.activePubkey;
    if (!userPubkey) {
        console.warn("mute: No pubkey provided and no active pubkey found.");
        return;
    }

    const ndk = state.ndk;
    if (!ndk) {
        console.warn("mute: NDK instance is not initialized. Call init first.");
        return;
    }

    // ensure we have a user-specific mute entry before we mutate it
    if (!state.mutes.has(userPubkey)) {
        initMutes(set, get, userPubkey);
    }

    const { type, value } = identified;
    set((state) => {
        const userMutes = state.mutes.get(userPubkey);
        if (!userMutes) return {};

        // Clone sets for immutability
        const pubkeys = new Set(userMutes.pubkeys);
        const eventIds = new Set(userMutes.eventIds);
        const hashtags = new Set(userMutes.hashtags);
        const words = new Set(userMutes.words);
        const muteEvent = userMutes.muteListEvent ? NDKList.from(userMutes.muteListEvent) : newMuteList(ndk);

        switch (type) {
            case "pubkey":
                pubkeys.add(value);
                muteEvent.tags.push(["p", value]);
                break;
            case "event":
                eventIds.add(value);
                muteEvent.tags.push(["e", value]);
                break;
            case "hashtag":
                hashtags.add(value);
                muteEvent.tags.push(["t", value]);
                break;
            case "word":
                words.add(value);
                muteEvent.tags.push(["word", value]);
                break;
            default:
                console.warn("mute: Unknown item type:", type);
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

        // Update muteCriteria and muteList if this is the active pubkey
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
