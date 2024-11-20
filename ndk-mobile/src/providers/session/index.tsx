import React from 'react';
import NDKSessionContext from '../../context/session';
import { NDKEventWithFrom } from '../../hooks';
import { useNDK } from '../../hooks/ndk';
import { NDKEvent, NDKEventId, NDKFilter, NDKKind, NDKSubscription } from '@nostr-dev-kit/ndk';
import { PropsWithChildren, useEffect, useState } from 'react';

interface NDKSessionProviderProps {
    follows?: boolean;
    kinds?: Map<NDKKind, { wrapper?: NDKEventWithFrom<any> }>;
}

const NDKSessionProvider = ({ children, ...opts }: PropsWithChildren<NDKSessionProviderProps>) => {
    const { ndk, currentUser } = useNDK();
    const [follows, setFollows] = useState<string[] | undefined>(undefined);
    const [events, setEvents] = useState<Map<NDKKind, NDKEvent[]>>(new Map());
    let filters: NDKFilter[] = [];
    let sub: NDKSubscription | undefined;
    let knownEventIds = new Set<NDKEventId>();

    let followEvent: NDKEvent | undefined;
    const processFollowEvent = (event: NDKEvent) => {
        if (followEvent && followEvent.created_at! > event.created_at!) return;

        const pubkeys = new Set(event.tags.filter((tag) => tag[0] === 'p' && !!tag[1]).map((tag) => tag[1]));

        setFollows(Array.from(pubkeys));
        followEvent = event;
    };

    const handleEvent = (event: NDKEvent) => {
        if (knownEventIds.has(event.id)) return;
        knownEventIds.add(event.id);
        const kind = event.kind!;

        switch (kind) {
            case 3:
                return processFollowEvent(event);
            default:
                const entry = opts.kinds!.get(kind);
                if (entry?.wrapper) {
                    event = entry.wrapper.from(event);
                }

                events.set(kind, [...(events.get(kind) || []), event]);
                setEvents(events);
        }
    };

    useEffect(() => {
        if (!ndk || !currentUser) return;
        if (sub) {
            sub.stop();
        }

        filters.push({ kinds: [], authors: [currentUser.pubkey] });

        if (opts.follows) filters[0].kinds!.push(3);
        if (opts.kinds) filters[0].kinds!.push(...opts.kinds.keys());

        if (filters[0].kinds!.length > 0) {
            sub = ndk.subscribe(filters, { closeOnEose: false }, undefined, false);
            sub.on('event', handleEvent);
            sub.start();
        }
    }, [ndk, opts.follows, currentUser]);

    return (
        <NDKSessionContext.Provider
            value={{
                follows,
                events,
            }}>
            {children}
        </NDKSessionContext.Provider>
    );
};

export { NDKSessionProvider };
