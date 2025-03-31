import NDK, { type NDKEvent, type NDKKind, NDKUser } from "@nostr-dev-kit/ndk";
import { useNDKSession } from "../stores/session/index.js";
import { useNDK } from "./ndk.js";
import type { NDKEventWithFrom } from "./subscribe.js";

const useNDKSessionInit = () => {
    return useNDKSession((s) => s.init);
};

const useFollows = () => useNDKSession((s) => s.follows);
const useMuteList = () => {
    const muteListEvent = useNDKSession((s) => s.muteListEvent);
    const mutedPubkeys = useNDKSession((s) => s.mutedPubkeys);
    const mutedHashtags = useNDKSession((s) => s.mutedHashtags);
    const mutedWords = useNDKSession((s) => s.mutedWords);
    const mutedEventIds = useNDKSession((s) => s.mutedEventIds);
    const mute = useNDKSession((s) => s.mute);

    return { mutedPubkeys, mutedHashtags, mutedWords, mutedEventIds, mute, muteListEvent };
};
const useSessionEvents = () => useNDKSession((s) => s.events);
const useWOT = () => useNDKSession((s) => s.wot);

/**
 * This hook allows you to get a specific kind, wrapped in the event class you provide.
 * Note that the wrapping must be specified when requesting the event from the NDKSession initializer.
 * @param EventClass
 * @param kind
 * @param opts.create - If true, and the event kind is not found, an unpublished event will be provided.
 * @returns
 */
const useNDKSessionEventKind = <T extends NDKEvent>(
    kind: NDKKind,
    { create }: { create: NDKEventWithFrom<any> | false } = { create: false }
): T | undefined => {
    const { ndk } = useNDK();
    const events = useNDKSession((s) => s.events);
    const kindEvents = events.get(kind) || [];
    const firstEvent = kindEvents[0];

    if (create && !firstEvent) {
        const event = new create(ndk, { kind });
        event.kind = kind;
        events.set(kind, [event]);
        return event;
    }

    return firstEvent as T;
};

const useNDKSessionEvents = <T extends NDKEvent>(
    kinds: NDKKind[],
    eventClass?: NDKEventWithFrom<any>
): T[] => {
    const events = useNDKSession((s) => s.events);
    let allEvents = kinds.flatMap((kind) => events.get(kind) || []);

    if (kinds.length > 1) allEvents = allEvents.sort((a, b) => a.created_at - b.created_at);

    // remove deleted events if replaceable
    allEvents = allEvents.filter((e) => !e.isReplaceable() || !e.hasTag("deleted"));

    return allEvents.map((e) => (eventClass ? eventClass.from(e) : (e as T)));
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
