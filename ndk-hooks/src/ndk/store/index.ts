import type NDK from '@nostr-dev-kit/ndk';
import type { NDKUser } from '@nostr-dev-kit/ndk';
import { create } from 'zustand';

/**
 * Interface for the NDK store state
 */
export interface NDKStoreState {
    /**
     * The NDK instance
     */
    ndk: NDK | null;

    /**
     * The currently active user (can be read-only or have a signer)
     */
    currentUser: NDKUser | null;

    /**
     * Sets the NDK instance
     */
    setNDK: (ndk: NDK) => void;
}

/**
 * Zustand store for managing the NDK instance and current user
 */
export const useNDKStore = create<NDKStoreState>((set) => {
    return {
        ndk: null,
        currentUser: null,

        setNDK: (ndk: NDK) => {
            set({ ndk });
        }
    };
});
