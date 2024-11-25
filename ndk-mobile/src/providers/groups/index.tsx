import React from 'react';
import { NDKEventWithFrom, useNDKSessionEventKind } from '../../hooks';
import { useNDK } from '../../hooks/ndk';
import { NDKFilter, NDKKind, NDKList, NDKSubscription } from '@nostr-dev-kit/ndk';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { createGroupStore, GroupStore } from './store';
import NDKGroupsContext from '../../context/groups';
import { StoreApi, useStore } from 'zustand';

interface NDKGroupsProviderProps {
}

const NDKGroupsProvider = ({ children }: PropsWithChildren<NDKGroupsProviderProps>) => {
    const { ndk, currentUser } = useNDK();
    const groupList = useNDKSessionEventKind<NDKList>(NDKList, NDKKind.SimpleGroupList, { create: true });
    const store = useRef<StoreApi<GroupStore>>(createGroupStore());

    let filters: NDKFilter[] = [];
    let sub: NDKSubscription | undefined;

    useEffect(() => {
        console.log('groupList', groupList.rawEvent());
        
        if (!ndk || !groupList || groupList.items.length === 0 || !currentUser) return;
        if (sub) {
            sub.stop();
        }

        filters.push({ kinds: [], authors: [currentUser.pubkey] });

        if (filters[0].kinds!.length > 0) {
            sub = ndk.subscribe(filters, { closeOnEose: false }, undefined, false);
            // sub.on('event', handleEvent);
            sub.start();
        }
    }, [ndk, groupList.items ]);

    return (
        <NDKGroupsContext.Provider
            value={{
                store: store.current
            }}>
            {children}
        </NDKGroupsContext.Provider>
    );
};

export { NDKGroupsProvider };