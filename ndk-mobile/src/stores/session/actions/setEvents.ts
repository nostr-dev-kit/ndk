import { NDKKind, NDKEvent } from "@nostr-dev-kit/ndk";

export const setEvents = (kind: NDKKind, events: NDKEvent[], set) => {
    set((state) => {
        const newEvents = new Map(state.events);
        newEvents.set(kind, events);
        return { events: newEvents };
    });
};
