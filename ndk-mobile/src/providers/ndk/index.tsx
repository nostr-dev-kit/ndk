import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import NDK, { NDKConstructorParams, NDKEvent, NDKSigner, NDKUser } from '@nostr-dev-kit/ndk';
import 'react-native-get-random-values';
import '@bacons/text-decoder/install';
import NDKContext from '../../context/ndk';
import * as SecureStore from 'expo-secure-store';
import { withPayload } from './signers';

export interface UnpublishedEventEntry {
    event: NDKEvent;
    relays?: string[];
    lastTryAt?: number;
}

const NDKProvider = ({
    children,
    connect = true,
    ...opts
}: PropsWithChildren<
    NDKConstructorParams & {
        connect?: boolean;
    }
>) => {
    const ndk = useRef(new NDK({ ...opts }));
    const [currentUser, setCurrentUser] = useState<NDKUser | null>(null);
    const [unpublishedEvents, setUnpublishedEvents] = useState<Map<string, UnpublishedEventEntry>>(new Map());
    const [cacheInitialized, setCacheInitialized] = useState<boolean | null>(opts?.cacheAdapter ? false : null);

    if (!ndk.current.cacheAdapter?.ready) {
        ndk.current.cacheAdapter?.onReady(() => {
            setCacheInitialized(true);
        });
    }

    useEffect(() => {
        ndk.current.cacheAdapter?.getUnpublishedEvents?.().then((entries) => {
            const e = new Map<string, UnpublishedEventEntry>();
            entries.forEach((entry) => {
                e.set(entry.event.id, entry);
            });
            setUnpublishedEvents(e);
        });
    }, []);

    if (connect) {
        ndk.current.connect();
    }

    ndk.current.on('event:publish-failed', (event: NDKEvent) => {
        if (unpublishedEvents.has(event.id)) return;
        unpublishedEvents.set(event.id, { event });
        setUnpublishedEvents(unpublishedEvents);
        event.once('published', () => {
            unpublishedEvents.delete(event.id);
            setUnpublishedEvents(unpublishedEvents);
        });
    });

    useEffect(() => {
        const storePayload = SecureStore.getItem('key');

        if (storePayload) {
            loginWithPayload(storePayload, { save: false });
        }
    }, []);

    async function loginWithPayload(payload: string, opts?: { save?: boolean }) {
        const signer = withPayload(ndk.current, payload);
        await login(signer);
        if (!ndk.current.signer) return;

        if (opts?.save) {
            SecureStore.setItemAsync('key', payload);
        }
    }

    async function login(promise: Promise<NDKSigner | null>) {
        promise
            .then((signer) => {
                ndk.current.signer = signer ?? undefined;

                if (signer) {
                    signer.user().then(setCurrentUser);
                } else {
                    setCurrentUser(null);
                }
            })
            .catch((e) => {
                console.log('error in login, removing signer', ndk.current.signer, e);
                ndk.current.signer = undefined;
            });
    }

    async function logout() {
        ndk.current.signer = undefined;

        setCurrentUser(null);

        SecureStore.deleteItemAsync('key');
    }

    return (
        <NDKContext.Provider
            value={{
                ndk: ndk.current,
                login,
                loginWithPayload,
                logout,
                currentUser,
                unpublishedEvents,
                cacheInitialized,
            }}>
            {children}
        </NDKContext.Provider>
    );
};

export { NDKProvider };
