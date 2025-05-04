import type NDK from "@nostr-dev-kit/ndk";
import { type StateCreator, create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Hexpubkey, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKSessionsState, NDKUserSession, SessionStartOptions } from "./types";

import { addSession } from "./add-session";
import { init } from "./init";
import { removeSession } from "./remove-session";
import { startSession } from "./start-session";
import { stopSession } from "./stop-session";
import { switchToUser } from "./switch-to-user";
import { updateSession } from "./update-session";

/**
 * Zustand store for managing NDK user sessions.
 */
// Define the state creator with Immer middleware type
const sessionStateCreator: StateCreator<NDKSessionsState, [["zustand/immer", never]]> = (set, get) => ({
    ndk: undefined, // Add NDK instance holder
    sessions: new Map<Hexpubkey, NDKUserSession>(),
    signers: new Map<Hexpubkey, NDKSigner>(), // Keep signers map for addSession logic
    activePubkey: undefined,

    // Initialization
    init: (ndkInstance: NDK) => init(set, ndkInstance),

    /**
     * Adds the session. This is how we login a user.
     * @param userOrSigner
     * @param setActive - If true, sets the session as active.
     * @returns
     */
    addSession: async (userOrSigner: NDKUser | NDKSigner, setActive?: boolean) => {
        const pubkey = await addSession(set, get, userOrSigner, setActive);
        if (pubkey && setActive) get().switchToUser(pubkey);
        return pubkey;
    },

    startSession: (pubkey: Hexpubkey, opts: SessionStartOptions) => startSession(set, get, pubkey, opts),

    stopSession: (pubkey: Hexpubkey) => stopSession(set, get, pubkey),

    switchToUser: (pubkey: Hexpubkey | null) => switchToUser(set, get, pubkey),

    removeSession: (pubkey: Hexpubkey) => removeSession(set, get, pubkey),

    // Internal update function
    updateSession: (pubkey: Hexpubkey, data: Partial<NDKUserSession>) => updateSession(set, get, pubkey, data),
});

// Create the store using the Immer middleware
export const useNDKSessions = create(immer(sessionStateCreator));

// Export the state type directly from types.ts for external use
export type { NDKSessionsState };
