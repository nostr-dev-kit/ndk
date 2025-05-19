import type { NDKMutesState } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { computeMuteCriteria } from "../utils/compute-mute-criteria";

/**
 * Sets the active pubkey for mute operations in the mute store.
 * @param set Zustand set function
 * @param pubkey The pubkey to set as active
 */
export function setActivePubkey(
    set: (partial: Partial<NDKMutesState> | ((state: NDKMutesState) => Partial<NDKMutesState>)) => void,
    pubkey: Hexpubkey | null,
) {
    set((state) => {
        const userMutes = pubkey ? state.mutes.get(pubkey) : undefined;
        return {
            activePubkey: pubkey,
            muteCriteria: computeMuteCriteria(userMutes, state.extraMutes),
        };
    });
}
