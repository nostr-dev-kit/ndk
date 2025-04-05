import type NDK from '@nostr-dev-kit/ndk';
import type { NDKSigner, NDKUser } from '@nostr-dev-kit/ndk';
import { create } from 'zustand';

/**
 * Interface for the NDK store state
 */
export interface NDKStoreState {
    /**
     * The NDK instance
     */
    ndk: NDK | null;

    // currentUser removed, managed by session store now

    /**
     * Sets the NDK instance
     */
    setNDK: (ndk: NDK) => void;

    setSigner: (signer: NDKSigner | undefined) => void;
}

/**
 * Zustand store for managing the NDK instance and current user
 */
export const useNDKStore = create<NDKStoreState>((set) => {
    return {
        ndk: null,
        // currentUser removed

        setNDK: (ndk: NDK) => {
            set({ ndk });
        },

        setSigner: (signer: NDKSigner | undefined) => {
            set((state) => {
                if (state.ndk) {
                    state.ndk.signer = signer;
                }
                return { ndk: state.ndk };
            });
        }
    };
});
