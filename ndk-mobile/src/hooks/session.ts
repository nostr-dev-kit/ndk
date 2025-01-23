import NDK, { NDKEvent, NDKKind, NDKUser } from '@nostr-dev-kit/ndk';
import { useNDK } from './ndk.js';
import { NDKEventWithFrom } from './subscribe.js';
import { useNDKSession } from '../stores/session/index.js';
import { useNDKWallet } from './wallet.js';
import { walletFromLoadingString } from '@nostr-dev-kit/ndk-wallet';
import { SessionInitOpts, SessionInitCallbacks } from '../stores/session/types.js';
import { SettingsStore } from '../types.js';

const useNDKSessionInit = () => {
    const init = useNDKSession(s => s.init);

    const { setActiveWallet } = useNDKWallet();

    const wrappedInit = (ndk: NDK, user: NDKUser, settingsStore: SettingsStore, opts: SessionInitOpts, on: SessionInitCallbacks) => {
        init(ndk, user, settingsStore, opts, on);

        const walletString = settingsStore?.getSync('wallet');
        if (walletString) {
            walletFromLoadingString(ndk, walletString).then((wallet) => {
                if (wallet) setActiveWallet(wallet);
            }).catch((e) => {
                console.error('error setting active wallet', e);
            });
        }
    }

    return wrappedInit;
}

const useFollows = () => useNDKSession(s => s.follows);
const useMuteList = () => {
    const muteList = useNDKSession(s => s.muteList);
    const mutePubkey = useNDKSession(s => s.mutePubkey);
    return { muteList, mutePubkey };
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
    kind: NDKKind,
    { create }: { create: boolean } = { create: false }
): T | undefined => {
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
};
