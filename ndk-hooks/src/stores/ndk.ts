import NDK, { Hexpubkey, NDKSigner, NDKUser } from '@nostr-dev-kit/ndk';
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
     * Map of available signers keyed by their hex pubkey
     */
    signers: Map<Hexpubkey, NDKSigner>;

    /**
     * Sets the NDK instance
     */
    setNDK: (ndk: NDK) => void;

    /**
     * Adds a signer to the available signers map.
     * @param signer The NDKSigner instance to add.
     */
    addSigner: (signer: NDKSigner, switchTo?: boolean) => Promise<void>;

    /**
     * Switches the active user to the one associated with the given pubkey.
     * If a signer is available for this pubkey, it will be set as the active signer.
     * Otherwise, the session will be read-only for this user.
     * @param pubkey The hex pubkey of the user to switch to.
     */
    switchToUser: (pubkey: Hexpubkey) => Promise<void>;
}

/**
 * Zustand store for managing the NDK instance and current user
 */
export const useNDKStore = create<NDKStoreState>((set, get) => {
    return {
        ndk: null,
        currentUser: null,
        signers: new Map<Hexpubkey, NDKSigner>(),

        setNDK: (ndk: NDK) => {
            set({ ndk });
        },

        addSigner: async (signer: NDKSigner, switchTo = true) => {
            try {
                const user = await signer.user();
                const pubkey = user.pubkey;
                set((state) => ({
                    signers: new Map(state.signers).set(pubkey, signer),
                }));
                console.log(`Signer added for pubkey: ${pubkey}`);

                if (switchTo) {
                    await get().switchToUser(pubkey);
                }
            } catch (error) {
                console.error('Failed to add signer:', error);
                throw error;
            }
        },

        switchToUser: async (pubkey: Hexpubkey) => {
            const ndk = get().ndk;
            if (!ndk) {
                console.error('Cannot switch user: NDK instance not initialized.');
                return;
            }

            const signers = get().signers;
            const newSigner = signers.get(pubkey);

            ndk.signer = newSigner;

            const user = ndk.getUser({ pubkey });

            set({ currentUser: user });

            if (newSigner) {
                console.log(`Switched to user ${pubkey} with active signer.`);
            } else {
                console.log(`Switched to user ${pubkey} in read-only mode.`);
            }
        },
    };
});
