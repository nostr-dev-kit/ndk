import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk';
import { createStore } from 'zustand/vanilla';

const setHasAnyIntersection = (set1: Set<string>, set2: Set<string>): boolean => {
    if (set1.size === 0 || set2.size === 0) return false;
    for (const item of set1) {
        if (set2.has(item)) return true;
    }
    return false;
};

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
    mutedWordsRegex: RegExp | null;
}

export interface SubscribeStore<T extends NDKEvent> {
    events: T[];
    eventMap: Map<string, T>;
    eose: boolean;
    subscriptionRef: NDKSubscription | undefined;
    addEvent: (event: T) => void;
    addEvents: (events: T[]) => void;
    removeEventId: (id: string) => void;
    filterMutedEvents: (criteria: MuteCriteria) => void;
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
        let timeout: NodeJS.Timeout | null = null;

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

            /**
             * Filters the *existing* events in the store based on comprehensive mute criteria.
             * @param criteria - An object containing sets of muted pubkeys, event IDs, hashtags (lowercase), and a regex for muted words.
             */
            filterMutedEvents: (criteria: MuteCriteria) => {
                const { mutedPubkeys, mutedEventIds, mutedHashtags, mutedWordsRegex } = criteria;

                if (
                    mutedPubkeys.size === 0 &&
                    mutedEventIds.size === 0 &&
                    mutedHashtags.size === 0 &&
                    !mutedWordsRegex
                ) {
                    return;
                }

                const state = get();
                const currentEventMap = state.eventMap;
                const newEventMap = new Map<string, T>();
                let changed = false;

                for (const [id, event] of currentEventMap.entries()) {
                    const tags = new Set(event.getMatchingTags('t').map((tag) => tag[1].toLowerCase()));
                    const taggedEvents = new Set(event.getMatchingTags('e').map((tag) => tag[1]));
                    taggedEvents.add(event.id);

                    const isMuted =
                        mutedPubkeys.has(event.pubkey) ||
                        setHasAnyIntersection(mutedEventIds, taggedEvents) ||
                        setHasAnyIntersection(mutedHashtags, tags) ||
                        (mutedWordsRegex && event.content && event.content.match(mutedWordsRegex));

                    if (!isMuted) {
                        newEventMap.set(id, event);
                    } else {
                        changed = true;
                    }
                }

                if (changed) {
                    const newEvents = Array.from(newEventMap.values());
                    set({ eventMap: newEventMap, events: newEvents });
                }
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
