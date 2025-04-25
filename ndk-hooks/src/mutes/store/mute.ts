import type { NDKMutesState } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { initMutes } from "./init";
import { computeMuteCriteria } from "../utils/compute-mute-criteria";
import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { MutableItem } from "./types";
import { identifyMuteItem } from "../utils/identify-mute-item";

export function newMuteList(ndk: NDK, pubkey: Hexpubkey) {
    return new NDKEvent(ndk, {
        kind: NDKKind.MuteList,
    })
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

    const { type, value } = identified;
    set((state: NDKMutesState) => {
        // Use provided pubkey or active pubkey
        const userPubkey = pubkey || state.activePubkey;
        if (!userPubkey) {
            console.warn("mute: No pubkey provided and no active pubkey found.");
            return;
        }

        // Initialize mutes if they don't exist
        if (!state.mutes.has(userPubkey)) {
            initMutes(set, get, userPubkey);
        }

        const ndk = state.ndk;
        if (!ndk) {
            console.warn("mute: NDK instance is not initialized. Call useNDKMutes.getState().init(ndk) first.");
            return;
        }
        const userMutes = state.mutes.get(userPubkey);
        if (!userMutes) return;
        const muteEvent = userMutes?.muteListEvent ?? newMuteList(ndk, userPubkey);

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
        }

        muteEvent.publishReplaceable();
    });
};
