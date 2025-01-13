import NDK, { NDKConstructorParams, NDKEvent, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import { create } from "zustand";
import { SettingsStore } from "../types";
import { NDKNip55Signer, withPayload } from "../signers";
import { NDKCacheAdapterSqlite } from "../cache-adapter/sqlite";

export type InitNDKParams = NDKConstructorParams & {
    settingsStore: SettingsStore;
}


export interface UnpublishedEventEntry {
    event: NDKEvent;
    relays?: string[];
    lastTryAt?: number;
}

type State = {
    ndk: NDK;
    currentUser: NDKUser | null;
    settingsStore?: SettingsStore;
    unpublishedEvents: Map<string, UnpublishedEventEntry>;
    cacheInitialized: boolean;
    initialParams: InitNDKParams;
}

type Actions = {
    init: (params: InitNDKParams) => void;
    login: (payloadOrSigner: string | NDKSigner) => void;
    logout: () => void;
}

type EventHandler = {
}

export const useNDKStore = create<State & Actions & EventHandler>((set, get) => ({
    ndk: undefined,
    currentUser: null,
    settingsStore: undefined,
    unpublishedEvents: new Map(),
    cacheInitialized: false,
    initialParams: undefined,

    init: (params: InitNDKParams) => {
        const ndk = new NDK(params);
        const settingsStore = params.settingsStore;
        const user = getUserFromSettingsStore(ndk, settingsStore);

        ndk.connect();

        // get unpublished events
        ndk.cacheAdapter?.onReady(() => {
            ndk?.cacheAdapter?.getUnpublishedEvents?.().then((entries) => {
                const e = new Map<string, UnpublishedEventEntry>();
                entries.forEach((entry) => {
                    e.set(entry.event.id, entry);
                    entry.event.once("published", () => {
                        console.log('published', entry.event.id);
                    })
                });

                set({
                    cacheInitialized: true,
                    unpublishedEvents: e,
                });
            })
        })

        ndk.on('event:publish-failed', (event: NDKEvent) => {
            const current = new Map(get().unpublishedEvents);
            current.set(event.id, { event });
            set({ unpublishedEvents: current });
        });
        
        const key = params.settingsStore?.getSync('login');

        set({
            ndk,
            settingsStore: params.settingsStore,
            cacheInitialized: ndk.cacheAdapter?.ready !== false,
            initialParams: params,
            ...(user ? { currentUser: user } : {}),
        });
        
        if (key) {
            get().login(key);
        }
    },

    login: (payloadOrSigner: string | NDKSigner) => {
        const {ndk, settingsStore} = get();

        const applySigner = (signer: NDKSigner, payload?: string) => {
            ndk.signer = signer;

            if (signer) {
                signer.user().then((user) => {
                    if (settingsStore) {
                        settingsStore.set('currentUser', user.pubkey);
                        if (signer instanceof NDKNip55Signer)
                            settingsStore.set('signer', 'nip55');
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

        // nuke the database
        if (ndk.cacheAdapter instanceof NDKCacheAdapterSqlite) {
            ndk.cacheAdapter.clear();
        }
    }
}))

function getUserFromSettingsStore(ndk: NDK, settingsStore?: SettingsStore) {
    const currentUser = settingsStore?.getSync('currentUser');
    if (currentUser) {
        return ndk.getUser({pubkey: currentUser});
    }
    return null;
}
