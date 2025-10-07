import { create } from "zustand";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKCashuMintList, NDKKind } from "@nostr-dev-kit/ndk";

export interface WalletConfigState {
    // Configuration
    mints: string[];
    relays: string[];
    p2pk?: string;

    // State
    isLoading: boolean;
    isPublishing: boolean;
    lastPublished?: number;

    // Actions
    load: (pubkey?: string) => Promise<void>;
    publish: () => Promise<void>;

    // Mint management
    addMint: (url: string) => void;
    removeMint: (url: string) => void;
    setMints: (urls: string[]) => void;

    // Relay management
    addRelay: (url: string) => void;
    removeRelay: (url: string) => void;
    setRelays: (urls: string[]) => void;

    // P2PK
    setP2pk: (pubkey: string) => void;

    // Reset
    reset: () => void;
}

export function createWalletConfigStore(ndk: NDK) {
    return create<WalletConfigState>((set, get) => ({
        mints: [],
        relays: [],
        p2pk: undefined,
        isLoading: false,
        isPublishing: false,
        lastPublished: undefined,

        load: async (pubkey) => {
            set({ isLoading: true });

            const targetPubkey = pubkey || (await ndk.signer?.user())?.pubkey;
            if (!targetPubkey) {
                set({ isLoading: false });
                return;
            }

            const event = await ndk.fetchEvent({
                kinds: [NDKKind.CashuMintList],
                authors: [targetPubkey],
            });

            if (event) {
                const mintList = NDKCashuMintList.from(event);
                set({
                    mints: mintList.mints,
                    relays: mintList.relays,
                    p2pk: mintList.p2pk,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        },

        publish: async () => {
            set({ isPublishing: true });

            const mintList = new NDKCashuMintList(ndk);
            const state = get();

            mintList.mints = state.mints;
            mintList.relays = state.relays;
            if (state.p2pk) {
                mintList.p2pk = state.p2pk;
            }

            await mintList.sign();
            await mintList.publish();

            set({ isPublishing: false, lastPublished: Date.now() });
        },

        addMint: (url) => {
            set((state) => ({
                mints: [...state.mints, url],
            }));
        },

        removeMint: (url) => {
            set((state) => ({
                mints: state.mints.filter((m) => m !== url),
            }));
        },

        setMints: (urls) => {
            set({ mints: urls });
        },

        addRelay: (url) => {
            set((state) => ({
                relays: [...state.relays, url],
            }));
        },

        removeRelay: (url) => {
            set((state) => ({
                relays: state.relays.filter((r) => r !== url),
            }));
        },

        setRelays: (urls) => {
            set({ relays: urls });
        },

        setP2pk: (pubkey) => {
            set({ p2pk: pubkey });
        },

        reset: () => {
            set({
                mints: [],
                relays: [],
                p2pk: undefined,
                isLoading: false,
                isPublishing: false,
                lastPublished: undefined,
            });
        },
    }));
}
