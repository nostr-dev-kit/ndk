import type { NDKEvent, NDKEventId } from "../events/index.js";

export function eventsBySameAuthor(op: NDKEvent, events: NDKEvent[]) {
    const eventsByAuthor = new Map<NDKEventId, NDKEvent>();
    eventsByAuthor.set(op.id, op);
    events.forEach((event) => {
        if (event.pubkey === op.pubkey) {
            eventsByAuthor.set(event.id, event);
        }
    });
    return eventsByAuthor;
}

/**
 * Checks if an event is a reply to an original post or to a thread.
 * @param op The original event
 * @param event The event to check
 * @param threadIds An optional map of all events in the thread
 * @returns True if the event is a reply, false otherwise
 */
export function eventIsReply(op: NDKEvent, event: NDKEvent, threadIds: Set<NDKEventId>): boolean {
    if (!threadIds) threadIds = new Set<NDKEventId>();

    // Make sure we always have the original event in the threadIds
    threadIds.add(op.id);

    // We never want to consider an event in the thread as a reply
    if (threadIds.has(event.id)) return false;

    // The happy path: check if the event has a reply marker tagging an event in the thread
    const replyMarker = event.tags.find((tag) => {
        return threadIds.has(tag[1]) && tag[3] === "reply";
    });

    return !!replyMarker;

    // Let's only be compatible with well-behaved clients and shun clients that don't tag their replies

    if (replyMarker) return true;

    // check if the event has valid markers, if it does and we don't have an explicit reply, this was
    // probably a reply to a reply or a mention
    const hasMarker = !!event.tags.find((tag) => ["reply", "mention"].includes(tag[3]));
    if (hasMarker) return false;

    // if we don't have markers, check if there are tags for other events that the main event
    // does not have
    const expectedTags = event.getMatchingTags("e").map((tag) => tag[1]);
    expectedTags.push(event.id);

    // return true if there are no unexpected e tags
    return event.getMatchingTags("e").every((tag) => expectedTags.includes(tag[1]));
}

/**
 * Filters the returned events so that the result is the events that are
 * part of a thread.
 *
 * Threads are defined as a sequence of events that are related to each other
 * and authored by the same user.
 * @param op The original event
 * @param events All candidate events (e.g. events tagging the OP)
 * @returns The events that are part of the thread sorted by creation time
 */
export function eventThreads(op: NDKEvent, events: NDKEvent[]) {
    // Get all events that are tagged by the original author
    const eventsByAuthor = eventsBySameAuthor(op, events);

    // Get all events that are part of the thread
    const threadEvents = events.filter((event) => eventIsPartOfThread(op, event, eventsByAuthor));

    // Sort the events by their created_at
    return threadEvents.sort((a, b) => a.created_at! - b.created_at!);
}

export function getEventReplyIds(event: NDKEvent): NDKEventId[] {
    return event
        .getMatchingTags("e")
        .filter((tag) => tag[3] === "reply")
        .map((tag) => tag[1]);
}

export function isEventOriginalPost(event: NDKEvent): boolean {
    return getEventReplyIds(event).length === 0;
}

export function eventThreadIds(op: NDKEvent, events: NDKEvent[]): Map<NDKEventId, NDKEvent> {
    const threadIds = new Map<string, NDKEvent>();
    const threadEvents = eventThreads(op, events);
    threadEvents.forEach((event) => threadIds.set(event.id, event));
    return threadIds;
}

export function eventReplies(op: NDKEvent, events: NDKEvent[], threadEventIds: Set<NDKEventId>) {
    // Get all events that are replies to the original post or to a thread
    threadEventIds ??= new Set(eventThreadIds(op, events).keys());

    return events.filter((event) => eventIsReply(op, event, threadEventIds));
}

/**
 * Checks if an event is part of a thread.
 * @param op The original event
 * @param event The event to check
 * @param eventsByAuthor A map of all candidate events by the original author
 * @returns True if the event is part of the thread, false otherwise
 */
export function eventIsPartOfThread(
    op: NDKEvent,
    event: NDKEvent,
    eventsByAuthor: Map<NDKEventId, NDKEvent>
): boolean {
    // must be same author
    if (op.pubkey !== event.pubkey) return false;

    // Check if all tagged events are by the original author
    const taggedEventIds = event.getMatchingTags("e").map((tag) => tag[1]);
    const allTaggedEventsAreByOriginalAuthor = taggedEventIds.every((id) => eventsByAuthor.has(id));

    return allTaggedEventsAreByOriginalAuthor;
}

/**
 * Checks if an event has ETag markers.
 */
export function eventHasETagMarkers(event: NDKEvent): boolean {
    return event.getMatchingTags("e").some((tag) => tag[3]);
}

/**
 * Returns the root event ID of an event.
 */
export function getRootEventId(event: NDKEvent): NDKEventId | null {
    const rootEventTag = event.tags.find((tag) => tag[0] === "e" && tag[3] === "root");

    if (!rootEventTag) {
        // If we don't have an explicit root marer, this event has no other e-tag markers
        // and we have a single e-tag, return that value
        if (eventHasETagMarkers(event)) return null;

        if (event.getMatchingTags("e").length === 1) {
            return event.getMatchingTags("e")[0][1];
        }
    }

    return rootEventTag ? rootEventTag[1] : null;
}
