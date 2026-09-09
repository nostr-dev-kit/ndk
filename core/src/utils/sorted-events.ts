import type { NDKEvent } from "../events/index.js";

function eventTimestamp(event: NDKEvent): number {
    if (event.created_at === undefined) {
        throw new Error("Cannot insert an event without created_at");
    }

    return event.created_at;
}

function insertEventIntoSortedList<T extends NDKEvent>(
    sortedEvents: T[],
    event: T,
    descending: boolean,
): T[] {
    if (sortedEvents.some((existingEvent) => existingEvent.id === event.id)) return sortedEvents;

    const timestamp = eventTimestamp(event);
    let low = 0;
    let high = sortedEvents.length;

    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        const middleTimestamp = eventTimestamp(sortedEvents[middle]);
        const insertBefore = descending ? middleTimestamp < timestamp : middleTimestamp > timestamp;

        if (insertBefore) {
            high = middle;
        } else {
            low = middle + 1;
        }
    }

    return [...sortedEvents.slice(0, low), event, ...sortedEvents.slice(low)];
}

/**
 * Inserts an event into a list sorted by descending `created_at` without mutating the input list.
 * Events with the same timestamp keep their existing order. Duplicate event IDs are ignored.
 */
export function insertEventIntoDescendingList<T extends NDKEvent>(
    sortedEvents: T[],
    event: T,
): T[] {
    return insertEventIntoSortedList(sortedEvents, event, true);
}

/**
 * Inserts an event into a list sorted by ascending `created_at` without mutating the input list.
 * Events with the same timestamp keep their existing order. Duplicate event IDs are ignored.
 */
export function insertEventIntoAscendingList<T extends NDKEvent>(sortedEvents: T[], event: T): T[] {
    return insertEventIntoSortedList(sortedEvents, event, false);
}
