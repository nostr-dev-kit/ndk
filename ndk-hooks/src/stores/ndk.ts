import { create } from 'zustand';
import NDK, { NDKUser } from '@nostr-dev-kit/ndk';

/**
 * Interface for the NDK store state
 */
export interface NDKStoreState {
  /**
   * The NDK instance
   */
  ndk: NDK | null;

  /**
   * The current user (if logged in)
   */
  currentUser: NDKUser | null;

  /**
   * Sets the NDK instance
   */
  setNDK: (ndk: NDK) => void;

  /**
   * Sets the current user
   */
  setCurrentUser: (user: NDKUser | null) => void;
}

/**
 * Zustand store for managing the NDK instance and current user
 */
export const useNDKStore = create<NDKStoreState>((set, get) => {
  // Keep track of the registered event handlers to clean them up later

  return {
    ndk: null,
    currentUser: null,
    setNDK: (ndk: NDK) => {
      // The signer:ready event means the current user is available
      // In a real implementation, we would use ndk.activeUser
      const signerReadyHandler = () => {
        const currentUser = ndk.activeUser || null;
        set({ currentUser });
      };

      set((state) => {
        const currentNDK = state.ndk;

        // Clean up event listeners from previous NDK instance
        if (currentNDK) {
          currentNDK.off('signer:ready', signerReadyHandler);
        }

        // Set up the signer:ready event listener
        ndk.on('signer:ready', signerReadyHandler);

        return { ndk };
      });
    },
    setCurrentUser: (user: NDKUser | null) => {
      set({ currentUser: user });
    },
  };
});