import type { NDKMutesState } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { initMutes } from "./init";
import { computeMuteCriteria } from "../utils/compute-mute-criteria";
import NDK, { NDKEvent, NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import type { MutableItem } from "./types";
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
    set: (state: NDKMutesState) => void,
    get: () => NDKMutesState,
    item: MutableItem,
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
    set((state: NDKMutesState) => {
        // Use provided pubkey or active pubkey
        const userMutes = state.mutes.get(userPubkey);
        if (!userMutes) return;
        const muteEvent = userMutes?.muteListEvent ?? newMuteList(ndk);

        switch (type) {
            case "pubkey":
                userMutes.pubkeys.add(value);
                muteEvent.tags.push(["p", value]);
                break;
            case "event":
                userMutes.eventIds.add(value);
                muteEvent.tags.push(["e", value]);
                break;
            case "hashtag":
                userMutes.hashtags.add(value);
                muteEvent.tags.push(["t", value]);
                break;
            case "word":
                userMutes.words.add(value);
                muteEvent.tags.push(["word", value]);
                break;
            default:
                console.warn("mute: Unknown item type:", type);
        }

        // Update muteCriteria if this is the active pubkey
        if (state.activePubkey === userPubkey) {
            state.muteCriteria = computeMuteCriteria(userMutes, state.extraMutes);
            state.muteList = NDKList.from(muteEvent);
        }

        muteEvent.publishReplaceable();
    });
};
