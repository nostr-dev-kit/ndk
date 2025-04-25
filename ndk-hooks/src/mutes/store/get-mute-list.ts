import { Hexpubkey, NDKEvent, NDKList } from "@nostr-dev-kit/ndk";
import { NDKMutesState } from "./types";
import { newMuteList } from "./mute";

export function getMuteList(
    set: (state: NDKMutesState) => void,
    get: () => NDKMutesState,
    pubkey?: Hexpubkey
): NDKList {
    const { ndk, activePubkey, mutes } = get();
    if (!ndk) throw new Error("NDK instance is not initialized. Call useNDKMutes.getState().init(ndk) first.");
    
    const emptyMuteList = newMuteList(ndk);
    const userPubkey = pubkey || activePubkey;
    if (!userPubkey) {
        throw new Error("No pubkey provided and no active pubkey found.");
    }

    const userMutes = mutes.get(userPubkey);
    return userMutes?.muteListEvent ?? emptyMuteList;
}
