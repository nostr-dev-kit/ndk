import NDK, { NDKConstructorParams, NDKEvent, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import { create } from "zustand";
import { SettingsStore } from "../types.js";
import { NDKNip55Signer, withPayload } from "../signers/index.js";
import { NDKCacheAdapterSqlite } from "../cache-adapter/sqlite.js";

export type InitNDKParams = NDKConstructorParams & {
    settingsStore: SettingsStore;
}

type State = {
    ndk: NDK;
    currentUser: NDKUser | null;
    settingsStore?: SettingsStore;
    initialParams: InitNDKParams;
}

type Actions = {
    init: (ndk: NDK, settingsStore: SettingsStore) => void;
    login: (payloadOrSigner: string | NDKSigner) => void;
    logout: () => void;
}

type EventHandler = {
}

export const useNDKStore = create<State & Actions & EventHandler>((set, get) => ({
    ndk: undefined,
    currentUser: null,
    settingsStore: undefined,
    initialParams: undefined,

    
    init: (ndk: NDK, settingsStore: SettingsStore) => {
        set({
            ndk,
            settingsStore,
            currentUser: ndk.activeUser,
        });

        const key = settingsStore?.getSync('login');
        
        if (key) get().login(key);
    },

    login: (payloadOrSigner: string | NDKSigner) => {
        const {ndk, settingsStore} = get();

        const applySigner = (signer: NDKSigner, payload?: string) => {
            ndk.signer = signer;

            if (signer) {
                signer.user().then((user) => {
                    if (settingsStore) {
                        settingsStore.set('currentUser', user.pubkey);
                        if (signer instanceof NDKNip55Signer) {
                            settingsStore.set('login', ['nip55', signer.packageName].join(' '));
                        }
                        else if (payload)
                            settingsStore.set('login', payload);
                    }

                    const userInStore = get().currentUser;
                    if (userInStore?.pubkey !== user.pubkey) {
                        set({ currentUser: user });
                    }
                });
            }
        }

        if (typeof payloadOrSigner === 'string') {
            const payload = payloadOrSigner as string;
            withPayload(ndk, payload, settingsStore).then((signer) => {
                applySigner(signer, payload);
            });
        } else {
            const signer = payloadOrSigner as NDKSigner;
            applySigner(signer);
        }
    },

    logout: () => {
        const {ndk, settingsStore} = get();
        ndk.signer = undefined;
        set({ currentUser: null });
        settingsStore.delete('currentUser');
        settingsStore.delete('login');
        settingsStore.delete('signer');
        settingsStore.delete('wot.last_updated_at');
        settingsStore.delete('wot.length');
        settingsStore.delete('ndkMobileSessionLastEose');

        // nuke the database
        if (ndk.cacheAdapter instanceof NDKCacheAdapterSqlite) {
            ndk.cacheAdapter.clear();
        }
    }
}))
