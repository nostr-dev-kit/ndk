import { create, type StateCreator } from 'zustand'; // Import StateCreator as type
import { immer } from 'zustand/middleware/immer'; // Import Immer middleware
import type NDK from '@nostr-dev-kit/ndk';
import type { Hexpubkey, NDKSigner, NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKSessionsState, NDKUserSession, SessionStartOptions } from './types';

// Import new/updated action implementations (we will create/modify these files next)
import { init } from './init'; // New init function
import { addSession } from './add-session'; // Renamed from ensureSession/init-session
import { startSession } from './start-session'; // New startSession function
import { stopSession } from './stop-session'; // New stopSession function
import { switchToUser } from './switch-to-user'; // Will be updated
import { removeSession } from './remove-session'; // Will be updated
import { updateSession } from './update-session'; // Keep internal update

/**
 * Zustand store for managing NDK user sessions.
 */
// Define the state creator with Immer middleware type
const sessionStateCreator: StateCreator<NDKSessionsState, [['zustand/immer', never]]> = (set, get) => ({
    ndk: undefined, // Add NDK instance holder
    sessions: new Map<Hexpubkey, NDKUserSession>(),
    signers: new Map<Hexpubkey, NDKSigner>(), // Keep signers map for addSession logic
    activePubkey: null, // Renamed from activeSessionPubkey

    // Initialization
    init: (ndkInstance: NDK) =>
        init(set, ndkInstance),

    // Session Management
    addSession: (userOrSigner: NDKUser | NDKSigner) =>
        addSession(set, get, userOrSigner),

    startSession: (pubkey: Hexpubkey, opts: SessionStartOptions) =>
        startSession(set, get, pubkey, opts),

    stopSession: (pubkey: Hexpubkey) =>
        stopSession(set, get, pubkey),

    switchToUser: (pubkey: Hexpubkey | null) => // Allow null to deactivate
        switchToUser(set, get, pubkey),

    removeSession: (pubkey: Hexpubkey) =>
        removeSession(set, get, pubkey),

    // Internal update function
    updateSession: (pubkey: Hexpubkey, data: Partial<NDKUserSession>) =>
        updateSession(set, get, pubkey, data),

    // Removed functions:
    // - addSigner
    // - removeSigner
    // - muteItemForSession
    // - createSession (replaced by addSession)
    // - ensureSession (replaced by addSession)
    // - setActiveSession (handled by switchToUser)
});

// Create the store using the Immer middleware
export const useNDKSessions = create(immer(sessionStateCreator));

// Export the state type directly from types.ts for external use
export type { NDKSessionsState };