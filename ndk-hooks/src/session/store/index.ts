import { create } from 'zustand';
import type { Hexpubkey, NDKSigner, NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKUserSession, SessionInitOptions } from './types';
import { addSigner } from './add-signer';
import { removeSession } from './remove-session';
import { removeSigner } from './remove-signer';
import { switchToUser } from './switch-to-user';
import { createSession } from './create-session';
// Removed deleteSession import
import { ensureSession } from './init-session'; // Updated import name
import { muteItemForSession } from './mute-item-for-session';
import { setActiveSession } from './set-active-session';
// Removed processMuteListForSession import
import { updateSession } from './update-session';

/**
 * Interface for the NDK session store state
 */
export interface NDKSessionsState {
    /**
     * The pubkey of the active session
     */
    activeSessionPubkey: Hexpubkey | null;
    
    /**
     * Map of sessions by pubkey
     */
    sessions: Map<Hexpubkey, NDKUserSession>;
    
    /**
     * Map of available signers keyed by their hex pubkey
     */
    signers: Map<Hexpubkey, NDKSigner>;
    
    /**
     * Adds a signer to the available signers map.
     * @param signer The NDKSigner instance to add.
     * @param makeActive Whether to make this signer's user the active user
     */
    addSigner: (signer: NDKSigner, makeActive?: boolean) => Promise<void>;
    
    /**
     * Removes a signer (authentication), keeping the session data.
     * @param pubkey The pubkey of the signer to remove
     */
    removeSigner: (pubkey: Hexpubkey) => Promise<void>;
    
    // Removed startSession and stopSession interface methods

    /**
     * Removes a session entirely from the store, including stopping subscriptions.
     * @param pubkey The pubkey of the session to remove
     */
    removeSession: (pubkey: Hexpubkey) => Promise<void>;
    
    /**
     * Switches the active user to the one associated with the given pubkey.
     * If a signer is available for this pubkey, it will be set as the active signer.
     * Otherwise, the session will be read-only for this user.
     * @param pubkey The hex pubkey of the user to switch to.
     */
    switchToUser: (pubkey: Hexpubkey) => Promise<void>;

    // Removed createSession interface method (use ensureSession or addSigner)

    // Removed deleteSession interface method

    /**
     * Ensures a session entry exists in the store. Creates if new, updates signer if provided.
     * Does NOT fetch data (profile, follows, etc.).
     * @param user The NDKUser object.
     * @param signer Optional NDKSigner.
     * @returns The pubkey if the session exists or was created, otherwise undefined.
     */
    ensureSession: (user: NDKUser, signer?: NDKSigner) => string | undefined; // Renamed method

    /**
     * Adds an item to the mute list set within a specific session's data.
     * Does NOT publish the updated mute list event.
     * @param pubkey The pubkey of the session.
     * @param value The item to mute (pubkey, eventId, #hashtag, word).
     * @param itemType The type of item being muted.
     */
    muteItemForSession: (pubkey: Hexpubkey, value: string, itemType: 'pubkey' | 'hashtag' | 'word' | 'event') => void; // Removed publish param

    // Removed setActiveSession interface method (used internally by switchToUser)

    // Removed setMuteListForSession interface method

    /**
     * Updates data for an existing session.
     * @param pubkey The pubkey of the session to update.
     * @param data The partial data to update.
     */
    updateSession: (pubkey: Hexpubkey, data: Partial<NDKUserSession>) => void;
}

/**
 * Zustand store for managing NDK sessions
 */
export const useNDKSessions = create<NDKSessionsState>((set, get) => {
    return {
        activeSessionPubkey: null,
        sessions: new Map<Hexpubkey, NDKUserSession>(),
        signers: new Map<Hexpubkey, NDKSigner>(),
        
        addSigner: (signer, makeActive) => 
            addSigner(get, set, signer, makeActive),
            
        removeSigner: (pubkey) => 
            removeSigner(get, set, pubkey),
            
        // Removed startSession and stopSession implementations

        removeSession: (pubkey) =>
            removeSession(get, set, pubkey),
            
        switchToUser: (pubkey) =>
            switchToUser(get, set, pubkey),

        // Removed createSession implementation

        // Removed deleteSession implementation

        ensureSession: (user: NDKUser, signer?: NDKSigner) => // Renamed method
            ensureSession(set, get, user, signer), // Updated function call

        muteItemForSession: (pubkey: Hexpubkey, value: string, itemType: 'pubkey' | 'hashtag' | 'word' | 'event') => // Removed publish, added types
            muteItemForSession(set, get, pubkey, value, itemType), // Removed publish from call

        // Removed setActiveSession implementation
// Removed setMuteListForSession implementation

        updateSession: (pubkey, data) =>
            updateSession(set, get, pubkey, data), // Corrected order: set, get
    };
});