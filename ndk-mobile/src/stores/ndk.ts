import NDK, { NDKConstructorParams, NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { create, createStore } from "zustand";
import { SettingsStore } from "../types";
import { produce } from "immer";
import { withPayload } from "../providers/ndk/signers";
import { NDKCacheAdapterSqlite } from "../cache-adapter/sqlite";

type OnUserSetCallback = (ndk: NDK, user: NDKUser) => void;

export type InitNDKParams = NDKConstructorParams & {
    settingsStore: SettingsStore;
    onUserSet?: OnUserSetCallback;
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
    randomId: string;
    unpublishedEvents: Map<string, UnpublishedEventEntry>;
    cacheInitialized: boolean;
    initialParams: InitNDKParams;
    onUserSet?: OnUserSetCallback;
}

type Actions = {
    init: (params: InitNDKParams) => void;
    login: (payload: string) => void;
    logout: () => void;
}

type EventHandler = {
    onUserSet?: OnUserSetCallback;
}

export const useNDKStore = create<State & Actions & EventHandler>((set, get) => ({
    ndk: undefined,
    currentUser: null,
    settingsStore: undefined,
    unpublishedEvents: new Map(),
    cacheInitialized: false,
    initialParams: undefined,
    randomId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),

    init: (params: InitNDKParams) => {
        const ndk = new NDK(params);
        const settingsStore = params.settingsStore;
        const user = getUserFromSettingsStore(ndk, settingsStore);

        ndk.pool.on('relay:connect', (relay) => {
            console.log('connected to relay', relay.url);
        });
        ndk.connect();

        // get unpublished events
        ndk.cacheAdapter?.onReady(() => {
            const unpublishedEvents = new Map<string, UnpublishedEventEntry>();
            ndk?.cacheAdapter?.getUnpublishedEvents?.().then((entries) => {
                const e = new Map<string, UnpublishedEventEntry>();
                entries.forEach((entry) => {
                    e.set(entry.event.id, entry);
                });
            });
            set({
                cacheInitialized: true,
                unpublishedEvents,
            });
        })

        ndk.on('event:publish-failed', (event: NDKEvent) => {
            const unpublishedEvents = produce(get().unpublishedEvents, (draft) => {
                draft.set(event.id, { event });
            });
            set({ unpublishedEvents });
        });
        
        const key = params.settingsStore?.getSync('login');

        set({
            ndk,
            settingsStore: params.settingsStore,
            cacheInitialized: ndk.cacheAdapter?.ready !== false,
            initialParams: params,
            onUserSet: (ndk, user) => params.onUserSet?.(ndk, user),
            ...(user ? setCurrentUser(user, ndk, params.onUserSet) : {}),
        });
        
        if (key) {
            get().login(key);
        }
    },

    login: (payload: string, onUserSet?: OnUserSetCallback) => {
        const {ndk, settingsStore, initialParams} = get();
        withPayload(ndk, payload).then((signer) => {
            ndk.signer = signer;

            if (signer) {
                signer.user().then((user) => {
                    if (settingsStore) {
                        settingsStore.set('currentUser', user.pubkey);
                        settingsStore.set('login', payload);
                    }

                    onUserSet ??= get().onUserSet;

                    const userInStore = get().currentUser;
                    if (userInStore?.pubkey !== user.pubkey) {
                        set(setCurrentUser(user, ndk, onUserSet));
                    }
                });
            }
        });
    },

    logout: () => {
        const {ndk, settingsStore} = get();
        ndk.signer = undefined;
        set({ currentUser: null });
        settingsStore.delete('currentUser');
        settingsStore.delete('login');
        settingsStore.delete('wot.last_updated_at');
        settingsStore.delete('wot.length');

        // nuke the database
        if (ndk.cacheAdapter instanceof NDKCacheAdapterSqlite) {
            ndk.cacheAdapter.clear();
        }
    }
}))

function setCurrentUser(
    user: NDKUser,
    ndk: NDK,
    onUserSet: (ndk: NDK, user: NDKUser) => void,
): Partial<State> {
    if (ndk.cacheAdapter && !ndk.cacheAdapter?.ready && onUserSet) {
        ndk.cacheAdapter.onReady(() => {
            onUserSet(ndk, user);
        });
    } else if (onUserSet) {
        onUserSet(ndk, user);
    }

    return { currentUser: user };
}

function getUserFromSettingsStore(ndk: NDK, settingsStore?: SettingsStore) {
    const currentUser = settingsStore?.getSync('currentUser');
    if (currentUser) {
        return ndk.getUser({pubkey: currentUser});
    }
    return null;
}
