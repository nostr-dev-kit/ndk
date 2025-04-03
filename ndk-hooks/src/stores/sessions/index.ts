import { create } from 'zustand';
import type { Hexpubkey, NDKSigner } from '@nostr-dev-kit/ndk';
import type { NDKUserSession } from './types'; // Use type-only import
import { addSigner } from './add-signer';
import { startSession } from './start-session';
import { stopSession } from './stop-session';
import { removeSession } from './remove-session'; // Added import
import { removeSigner } from './remove-signer';
import { switchToUser } from './switch-to-user';

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
    
    /**
     * Starts a session for a user (with or without a signer)
     * @param pubkey The pubkey to start a session for
     * @param options Optional initialization options
     */
    startSession: (
        pubkey: Hexpubkey, 
        options?: { makeActive?: boolean }
    ) => Promise<void>;
    
    /**
     * Stops subscriptions associated with a session.
     * @param pubkey The pubkey of the session whose subscriptions to stop
     */
    stopSession: (pubkey: Hexpubkey) => Promise<void>;

    /**
     * Removes a session entirely from the store, including stopping subscriptions.
     * @param pubkey The pubkey of the session to remove
     */
    removeSession: (pubkey: Hexpubkey) => Promise<void>; // Added definition
    
    /**
     * Switches the active user to the one associated with the given pubkey.
     * If a signer is available for this pubkey, it will be set as the active signer.
     * Otherwise, the session will be read-only for this user.
     * @param pubkey The hex pubkey of the user to switch to.
     */
    switchToUser: (pubkey: Hexpubkey) => Promise<void>;
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
            
        startSession: (pubkey, options) => 
            startSession(get, set, pubkey, options),
            
        stopSession: (pubkey) => 
            stopSession(get, set, pubkey),

        removeSession: (pubkey) => // Added binding
            removeSession(get, set, pubkey),
            
        switchToUser: (pubkey) => 
            switchToUser(get, set, pubkey)
    };
});