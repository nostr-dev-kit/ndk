import type { NDKMutesState } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import NDK, { NDKEvent, NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import type { MutableItem } from "./types";
import { computeMuteCriteria } from "../utils/compute-mute-criteria";
import { identifyMuteItem } from "../utils/identify-mute-item";

/**
 * Unmutes an item (pubkey, event, hashtag, or word) for a user in the mute store.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param item The item to unmute (NDKEvent, NDKUser, or string)
 * @param pubkey The user's public key (optional, uses active pubkey if undefined)
 */
export const unmute = (
    set: (updater: (state: NDKMutesState) => void) => void,
    get: () => NDKMutesState,
    item: MutableItem,
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

    // all guards passed—now do exactly one Immer producer
    set((draft) => {
        const { type, value } = identified;

        switch (type) {
            case "pubkey":
                draft.mutes.get(userPubkey)!.pubkeys.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag) => !(tag[0] === "p" && tag[1] === value));
                break;
            case "event":
                draft.mutes.get(userPubkey)!.eventIds.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag) => !(tag[0] === "e" && tag[1] === value));
                break;
            case "hashtag":
                draft.mutes.get(userPubkey)!.hashtags.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag) => !(tag[0] === "t" && tag[1] === value));
                break;
            case "word":
                draft.mutes.get(userPubkey)!.words.delete(value);
                muteEvent.tags = muteEvent.tags.filter((tag) => !(tag[0] === "word" && tag[1] === value));
                break;
        }

        if (draft.activePubkey === userPubkey) {
            draft.muteCriteria = computeMuteCriteria(draft.mutes.get(userPubkey)!, draft.extraMutes);
            draft.muteList = NDKList.from(muteEvent);
        }

        // publish after all draft mutations
        muteEvent.publishReplaceable();
    });
};
