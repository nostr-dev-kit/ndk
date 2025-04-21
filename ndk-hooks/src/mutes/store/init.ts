import type { NDKMutesState } from "./types";
import type { Hexpubkey } from "@nostr-dev-kit/ndk";

/**
 * Initializes mute data for a user in the mute store.
 * @param set Zustand set function
 * @param get Zustand get function
 * @param pubkey The user's public key
 */
export const initMutes = (set: (state: any) => void, get: () => NDKMutesState, pubkey: Hexpubkey) => {
    set((state: any) => {
        if (!state.mutes.has(pubkey)) {
            state.mutes.set(pubkey, {
                pubkey,
                pubkeys: new Set<Hexpubkey>(),
                hashtags: new Set<string>(),
                words: new Set<string>(),
                eventIds: new Set<string>(),
            });
        }
    });
};
