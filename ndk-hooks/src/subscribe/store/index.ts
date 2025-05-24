import type { NDKEvent, NDKSubscription, NDKFilter } from "@nostr-dev-kit/ndk";
import { matchFilter } from "@nostr-dev-kit/ndk";
import { createStore } from "zustand/vanilla";

/**
 * Store interface for managing subscription state
 * @interface SubscribeStore
 * @property {T[]} events - Array of received events
 * @property {Map<string, T>} eventMap - Map of events by ID
 * @property {boolean} eose - End of stored events flag
 */
export interface MuteCriteria {
    mutedPubkeys: Set<string>;
    mutedEventIds: Set<string>;
    mutedHashtags: Set<string>; // Lowercase
    mutedWords: Set<string>;
}

export interface SubscribeStore<T extends NDKEvent> {
    events: T[];
    eventMap: Map<string, T>;
    eose: boolean;
    subscriptionRef: NDKSubscription | undefined;
    addEvent: (event: T) => void;
    addEvents: (events: T[]) => void;
    removeEventId: (id: string) => void;
    filterMutedEvents: (muteFilter: (event: NDKEvent) => boolean) => void;
    filterExistingEvents: (filters: NDKFilter[]) => void;
    setEose: () => void;
    reset: () => void;
}

/**
 * Creates a store to manage subscription state with optional event buffering
 * @param bufferMs - Buffer time in milliseconds, false to disable buffering
 */
export const createSubscribeStore = <T extends NDKEvent>(bufferMs: number | false = 30) => {
    const store = createStore<SubscribeStore<T>>((set, get) => {
        const buffer = new Map<string, T>();
        let timeout: number | NodeJS.Timeout | null = null;

        const flushBuffer = () => {
            const state = get();
            const newEventMap = new Map(state.eventMap);
            let hasChanges = false;

            for (const [id, event] of buffer.entries()) {
                const existingEvent = newEventMap.get(id);

                if (
                    !existingEvent ||
                    (existingEvent.created_at !== undefined &&
                        event.created_at !== undefined &&
                        event.created_at > existingEvent.created_at)
                ) {
                    newEventMap.set(id, event);
                    hasChanges = true;
                }
            }

            buffer.clear();

            if (hasChanges) {
                const newEvents = Array.from(newEventMap.values());

                set({ eventMap: newEventMap, events: newEvents });
            }

            timeout = null;
        };

        return {
            events: [],
            eventMap: new Map<string, T>(),
            eose: false,
            subscriptionRef: undefined,

            addEvent: (event) => {
                const id = event.tagId();

                if (bufferMs !== false) {
                    // Buffering is enabled
                    const existingInBuffer = buffer.get(id);
                    const existingInStore = get().eventMap.get(id);

                    if (
                        existingInBuffer &&
                        existingInBuffer.created_at !== undefined &&
                        event.created_at !== undefined &&
                        existingInBuffer.created_at >= event.created_at
                    ) {
                        return;
                    }

                    if (
                        existingInStore &&
                        existingInStore.created_at !== undefined &&
                        event.created_at !== undefined &&
                        existingInStore.created_at >= event.created_at
                    ) {
                        return;
                    }

                    buffer.set(id, event);

                    if (!timeout) {
                        timeout = setTimeout(flushBuffer, bufferMs);
                    }
                } else {
                    const state = get();
                    const newEventMap = new Map(state.eventMap);
                    const existingEvent = newEventMap.get(id);

                    if (
                        existingEvent &&
                        existingEvent.created_at !== undefined &&
                        event.created_at !== undefined &&
                        existingEvent.created_at >= event.created_at
                    ) {
                        return;
                    }

                    newEventMap.set(id, event);

                    const newEvents = Array.from(newEventMap.values());

                    set({ eventMap: newEventMap, events: newEvents });
                }
            },

            addEvents: (events) => {
                if (!events || events.length === 0) return;

                if (bufferMs !== false) {
                    // Buffering is enabled
                    let needsFlush = false;

                    for (const event of events) {
                        if (!event) continue;

                        const id = event.tagId();
                        const existingInBuffer = buffer.get(id);
                        const existingInStore = get().eventMap.get(id);

                        if (
                            existingInBuffer &&
                            existingInBuffer.created_at !== undefined &&
                            event.created_at !== undefined &&
                            existingInBuffer.created_at >= event.created_at
                        ) {
                            continue;
                        }

                        if (
                            existingInStore &&
                            existingInStore.created_at !== undefined &&
                            event.created_at !== undefined &&
                            existingInStore.created_at >= event.created_at
                        ) {
                            continue;
                        }

                        buffer.set(id, event);
                        needsFlush = true;
                    }

                    if (needsFlush && !timeout) {
                        timeout = setTimeout(flushBuffer, bufferMs);
                    }
                } else {
                    const state = get();
                    const newEventMap = new Map(state.eventMap);

                    let hasUpdates = false;

                    for (const event of events) {
                        if (!event) continue;

                        const id = event.tagId();
                        const existingEvent = newEventMap.get(id);

                        if (
                            existingEvent &&
                            existingEvent.created_at !== undefined &&
                            event.created_at !== undefined &&
                            existingEvent.created_at >= event.created_at
                        ) {
                            continue;
                        }

                        newEventMap.set(id, event);
                        hasUpdates = true;
                    }

                    if (hasUpdates) {
                        const newEvents = Array.from(newEventMap.values());
                        set({ eventMap: newEventMap, events: newEvents });
                    }
                }
            },

            removeEventId: (id) => {
                const state = get();
                const newEventMap = new Map(state.eventMap);
                newEventMap.delete(id);
                const newEvents = Array.from(newEventMap.values());
                set({ eventMap: newEventMap, events: newEvents });
            },

            filterMutedEvents: (muteFilter: (event: NDKEvent) => boolean) => {
                const state = get();
                const currentEventMap = state.eventMap;
                const newEventMap = new Map<string, T>();

                for (const [id, event] of currentEventMap.entries()) {
                    if (!muteFilter(event)) {
                        newEventMap.set(id, event);
                    }
                }

                const newEvents = Array.from(newEventMap.values());
                set({ eventMap: newEventMap, events: newEvents });
            },

            filterExistingEvents: (filters: NDKFilter[]) => {
                const state = get();
                const currentEventMap = state.eventMap;
                const newEventMap = new Map<string, T>();

                for (const [id, event] of currentEventMap.entries()) {
                    // Check if the event matches at least one of the filters
                    const matchesAnyFilter = filters.some((filter) => matchFilter(filter, event.rawEvent()));

                    if (matchesAnyFilter) {
                        newEventMap.set(id, event);
                    }
                }

                const newEvents = Array.from(newEventMap.values());
                set({ eventMap: newEventMap, events: newEvents });
            },

            setEose: () => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                    flushBuffer();
                }

                set({ eose: true });

                if (bufferMs !== false) {
                    bufferMs = 16;
                }
            },

            reset: () => {
                buffer.clear();
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }

                set({
                    events: [],
                    eventMap: new Map<string, T>(),
                    eose: false,
                    subscriptionRef: undefined,
                });
            },
        };
    });

    return store;
};
