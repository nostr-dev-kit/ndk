import { useContext } from 'react';
import NDKSessionContext from '../context/session';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { useNDK } from './ndk';
import { NDKEventWithFrom } from './subscribe';

const useNDKSession = (): NDKSessionContext => {
    const context = useContext(NDKSessionContext);
    if (context === undefined) {
        throw new Error('useNDK must be used within an NDKProvider');
    }
    return context;
};

/**
 * This hook allows you to get a specific kind, wrapped in the event class you provide.
 * @param EventClass 
 * @param kind 
 * @param opts.create - If true, and the event kind is not found, an unpublished event will be provided.
 * @returns 
 */
const useNDKSessionEventKind = <T extends NDKEvent>(
    EventClass: NDKEventWithFrom<any>,
    kind: NDKKind,
    { create }: { create: boolean } = { create: false }
): T | undefined => {
    const { ndk } = useNDK();
    const { events } = useNDKSession();
    const kindEvents = events.get(kind) || [];
    const firstEvent = kindEvents[0];

    if (create && !firstEvent) {
        const event = new EventClass(ndk);
        event.kind = kind;
        events.set(kind, [event]);
        return event;
    }
    return firstEvent ? EventClass.from(firstEvent) : undefined;
};

export { useNDKSession, useNDKSessionEventKind };
