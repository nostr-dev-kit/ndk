import type { NDKMutesState } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";

/**
 * Initializes mute data for a user in the mute store.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param pubkey The user's public key
 */
export const initMutes = (
    set: (partial: Partial<NDKMutesState> | ((state: NDKMutesState) => Partial<NDKMutesState>)) => void,
    get: () => NDKMutesState,
    pubkey: Hexpubkey,
) => {
    set((state) => {
        if (state.mutes.has(pubkey)) return {};
        const newMutes = new Map(state.mutes);
        newMutes.set(pubkey, {
            pubkeys: new Set<Hexpubkey>(),
            hashtags: new Set<string>(),
            words: new Set<string>(),
            eventIds: new Set<string>(),
        });
        return { mutes: newMutes };
    });
};
