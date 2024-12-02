import React from 'react';
import NDKSessionContext from '../../context/session';
import { NDKEventWithFrom } from '../../hooks';
import { useNDK } from '../../hooks/ndk';
import { Hexpubkey, NDKEvent, NDKEventId, NDKFilter, NDKKind, NDKRelay, NDKSubscription } from '@nostr-dev-kit/ndk';
import { PropsWithChildren, useEffect } from 'react';
import { useSessionStore } from '../../stores/session';

interface NDKSessionProviderProps {
    follows?: boolean;
    muteList?: boolean;
    wallet?: boolean;
    kinds?: Map<NDKKind, { wrapper?: NDKEventWithFrom<any> }>;
}

const NDKSessionProvider = ({ children, ...opts }: PropsWithChildren<NDKSessionProviderProps>) => {
    const { ndk, currentUser } = useNDK();
    const { setFollows, setMuteList, addEvent, mutePubkey } = useSessionStore();
    let sub: NDKSubscription | undefined;
    let knownEventIds = new Set<NDKEventId>();
    let followEvent: NDKEvent | undefined;

    const processFollowEvent = (event: NDKEvent, relay: NDKRelay) => {
        if (followEvent && followEvent.created_at! > event.created_at!) return;
        console.log('follow event', event.created_at, followEvent?.created_at, relay?.url);

        const pubkeys = new Set(event.tags.filter((tag) => tag[0] === 'p' && !!tag[1]).map((tag) => tag[1]));
        setFollows(Array.from(pubkeys));
        followEvent = event;
    };

    const processMuteListEvent = (event: NDKEvent, relay: NDKRelay) => {
        setMuteList(event);
    };

    const processCashuWalletEvent = (event: NDKEvent) => {
    };

    const handleEvent = (event: NDKEvent, relay: NDKRelay) => {
        if (knownEventIds.has(event.id)) return;
        knownEventIds.add(event.id);
        const kind = event.kind!;

        switch (kind) {
            case 3:
                return processFollowEvent(event, relay);
            case NDKKind.MuteList:
                return processMuteListEvent(event, relay);
            case NDKKind.CashuWallet:
                return processCashuWalletEvent(event);
            default:
                const entry = opts.kinds!.get(kind);
                if (entry?.wrapper) {
                    event = entry.wrapper.from(event);
                }
                addEvent(kind, event);
        }
    };

    useEffect(() => {
        if (!ndk || !currentUser) return;
        if (sub) {
            sub.stop();
        }

        let filters: NDKFilter[] = [];

        filters.push({ kinds: [], authors: [currentUser.pubkey] });

        if (opts.follows) filters[0].kinds!.push(3);
        if (opts.muteList) filters[0].kinds!.push(NDKKind.MuteList);
        if (opts.wallet) filters[0].kinds!.push(NDKKind.CashuWallet);
        if (opts.kinds) filters[0].kinds!.push(...opts.kinds.keys());

        if (filters[0].kinds!.length > 0) {
            sub = ndk.subscribe(filters, { closeOnEose: false }, undefined, false);
            sub.on('event', handleEvent);
            sub.start();
        }
    }, [ndk, opts.follows, opts.muteList, currentUser]);

    return (
        <NDKSessionContext.Provider
            value={{
                follows: useSessionStore((state) => state.follows),
                events: useSessionStore((state) => state.events),
                muteList: useSessionStore((state) => state.muteList),
                mutePubkey: useSessionStore((state) => state.mutePubkey),
            }}>
            {children}
        </NDKSessionContext.Provider>
    );
};

export { NDKSessionProvider };
