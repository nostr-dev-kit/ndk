import NDK, { NDKEvent, NDKKind, NDKUser } from '@nostr-dev-kit/ndk';
import { useState, useEffect } from 'react';
import { useNDK } from './ndk.js';
import { NDKEventWithFrom, NDKEventWithAsyncFrom } from './subscribe.js';
import { useNDKSession } from '../stores/session/index.js';
import { useNDKWallet } from './wallet.js';
import { walletFromLoadingString } from '@nostr-dev-kit/ndk-wallet';
import { SessionInitOpts, SessionInitCallbacks } from '../stores/session/types.js';
import { SettingsStore } from '../types.js';

const useNDKSessionInit = () => {
    return useNDKSession(s => s.init);
}

const useNDKSessionInitWallet = () => {
    const { setActiveWallet } = useNDKWallet();

    const initWallet = (ndk: NDK, settingsStore: SettingsStore) => {
        const walletString = settingsStore?.getSync('wallet');
        if (walletString) {
            walletFromLoadingString(ndk, walletString).then((wallet) => {
                if (wallet) setActiveWallet(wallet);
            });
        }
    }

    return initWallet;
}

const useFollows = () => useNDKSession(s => s.follows);
const useMuteList = () => {
    const muteListEvent = useNDKSession(s => s.muteListEvent);
    const mutedPubkeys = useNDKSession(s => s.mutedPubkeys);
    const mutedHashtags = useNDKSession(s => s.mutedHashtags);
    const mutedWords = useNDKSession(s => s.mutedWords);
    const mutedEventIds = useNDKSession(s => s.mutedEventIds);
    const mute = useNDKSession(s => s.mute);

    return { mutedPubkeys, mutedHashtags, mutedWords, mutedEventIds, mute, muteListEvent };
}
const useSessionEvents = () => useNDKSession(s => s.events);
const useWOT = () => useNDKSession(s => s.wot);

/**
 * This hook allows you to get a specific kind, wrapped in the event class you provide.
 * @param EventClass 
 * @param kind 
 * @param opts.create - If true, and the event kind is not found, an unpublished event will be provided.
 * @returns 
 */
const useNDKSessionEventKind = <T extends NDKEvent>(
    EventClass: NDKEventWithFrom<any>,
    kind?: NDKKind,
    { create }: { create: boolean } = { create: false }
): T | undefined => {
    kind ??= EventClass.kind;
    const { ndk } = useNDK();
    const events = useNDKSession(s => s.events);
    const kindEvents = events.get(kind) || [];
    const firstEvent = kindEvents[0];

    if (create && !firstEvent) {
        const event = new EventClass(ndk, { kind });
        event.kind = kind;
        events.set(kind, [event]);
        return event;
    }

    return firstEvent ? EventClass.from(firstEvent) : undefined;
};

const useNDKSessionEventKindAsync = <T>(
    EventClass: NDKEventWithAsyncFrom<any>,
    kind?: NDKKind,
    { create }: { create: boolean } = { create: false }
): T | undefined => {
    kind ??= EventClass.kind;
    const events = useNDKSession(s => s.events);
    const kindEvents = events.get(kind) || [];
    const firstEvent = kindEvents[0];
    const [res, setRes] = useState<T | undefined>(undefined);

    useEffect(() => {
        if (!firstEvent) return;
        EventClass.from(firstEvent).then((event) => {
            setRes(event);
        });
    }, [firstEvent]);

    return res;
};

const useNDKSessionEvents = <T extends NDKEvent>(
    kinds: NDKKind[],
    eventClass?: NDKEventWithFrom<any>,
): T[] => {
    const events = useNDKSession(s => s.events);
    let allEvents = kinds.flatMap((kind) => events.get(kind) || []);

    if (kinds.length > 1) allEvents = allEvents.sort((a, b) => a.created_at - b.created_at);

    // remove deleted events if replaceable
    allEvents = allEvents.filter((e) => !e.isReplaceable() || !e.hasTag('deleted'));

    return allEvents.map((e) => eventClass ? eventClass.from(e) : e as T);
};

export {
    useFollows,
    useMuteList,
    useSessionEvents,
    useWOT,
    useNDKSessionEventKind,
    useNDKSessionEvents,
    useNDKSessionInit,
    useNDKSessionInitWallet,
    useNDKSessionEventKindAsync,
};
