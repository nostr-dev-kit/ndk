import type { NDKEvent, NDKEventId, NDKTag } from "../events";

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

const hasMarkers = (event: NDKEvent, tagType: string): boolean => {
    return event.getMatchingTags(tagType).some((tag) => tag[3] && tag[3] !== "");
};

/**
 * Checks if an event is a reply to an original post or to a thread.
 * @param op The original event
 * @param event The event to check
 * @param threadIds An optional map of all events in the thread
 * @param tagType The tag type to search for (default: "e" for non-replaceable events and "a" for replaceable events)
 * @returns True if the event is a reply, false otherwise
 */
export function eventIsReply(
    op: NDKEvent,
    event: NDKEvent,
    threadIds: Set<NDKEventId> = new Set<NDKEventId>(),
    tagType?: string
): boolean {
    tagType ??= op.tagType();

    // Get all tags that we should evaluate
    const tags = event.getMatchingTags(tagType);

    // Make sure we always have the original event in the threadIds
    threadIds.add(op.tagId());

    // We never want to consider an event in the thread as a reply
    if (threadIds.has(event.tagId())) return false;

    const heedExplicitReplyMarker = (): boolean | undefined => {
        // We never want to consider an event that is not tagging the original event
        // or if it's tagging something else as an explicit reply
        let eventIsTagged: "root" | boolean = false;
        for (const tag of tags) {
            // If we find an explicit reply marker, we can return if we find the ID of an event in the thread
            if (tag[3] === "reply") return threadIds.has(tag[1]);

            // If we find the original event tagged without a marker, we can flag it
            // if it's marked as something other than "reply" we don't consider this
            // a reply unless it's a root marker and no other event has a reply marker
            const markerIsEmpty = tag[3] === "" || tag[3] === undefined;
            const markerIsRoot = tag[3] === "root";
            if (tag[1] === op.tagId() && (markerIsEmpty || markerIsRoot)) {
                eventIsTagged = markerIsRoot ? "root" : true;
            }
        }

        // If the event is not tagged, it's not a reply
        if (!eventIsTagged) return false;

        // If the event was marked as root and nothing else has a reply marker, mark it as a reply
        if (eventIsTagged === "root") return true;
    };

    const explicitReplyMarker = heedExplicitReplyMarker();
    if (explicitReplyMarker !== undefined) return explicitReplyMarker;

    // check if the event has valid markers, if it does and we don't have an explicit reply, this was
    // probably a reply to a reply or a mention
    if (hasMarkers(event, tagType)) return false;

    // if we don't have markers, check if there are tags for other events that the main event
    // does not have
    const expectedTags = op.getMatchingTags("e").map((tag) => tag[1]);
    expectedTags.push(op.id);

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
    // TODO This is a hack, we should first filter according to tagging, not by created_at
    return threadEvents.sort((a, b) => a.created_at! - b.created_at!);
}

export function getEventReplyIds(event: NDKEvent): NDKEventId[] {
    if (hasMarkers(event, event.tagType())) {
        let rootTag: NDKTag | undefined;
        const replyTags: NDKTag[] = [];

        event.getMatchingTags(event.tagType()).forEach((tag) => {
            if (tag[3] === "root") rootTag = tag;
            if (tag[3] === "reply") replyTags.push(tag);
        });

        if (replyTags.length === 0) {
            if (rootTag) {
                replyTags.push(rootTag);
            }
        }

        return replyTags.map((tag) => tag[1]);
    } else {
        return event.getMatchingTags("e").map((tag) => tag[1]);
    }
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
 * @param event The event to get the root event ID from
 * @param searchTag The tags to search for the root event ID @default "a" or "e"
 * @returns The root event ID or undefined if the event does not have a root event ID
 */
export function getRootEventId(event: NDKEvent, searchTag?: string): NDKEventId | null | undefined {
    searchTag ??= event.tagType();
    const rootEventTag = getRootTag(event, searchTag);
    if (rootEventTag) return rootEventTag[1];

    const replyTag = getReplyTag(event, searchTag);

    return replyTag?.[1];
}

/**
 * Returns the root tag of an event.
 * @param event The event to get the root tag from
 * @param searchTags The tags to search for the root tag (default: ["a", "e"])
 * @returns The root tag or undefined if the event does not have a root tag
 */
export function getRootTag(event: NDKEvent, searchTag?: string): NDKTag | undefined {
    searchTag ??= event.tagType();
    const rootEventTag = event.tags.find((tag) => tag[3] === "root");

    if (!rootEventTag) {
        // If we don't have an explicit root marer, this event has no other e-tag markers
        // and we have a single e-tag, return that value
        if (eventHasETagMarkers(event)) return;

        const matchingTags = event.getMatchingTags(searchTag);
        if (matchingTags.length < 3) return matchingTags[0];
    }

    return rootEventTag;
}

export function getReplyTag(event: NDKEvent, searchTag?: string): NDKTag | undefined {
    searchTag ??= event.tagType();

    let replyTag = event.tags.find((tag) => tag[3] === "reply");

    if (replyTag) return replyTag;

    // Check with root tag
    if (!replyTag) replyTag = event.tags.find((tag) => tag[3] === "root");

    // If we don't have anything
    if (!replyTag) {
        // if we do have etag markers and no reply tag, then return undefined
        if (eventHasETagMarkers(event)) return;

        // If we only have one tag of the requested type
        const matchingTags = event.getMatchingTags(searchTag);
        if (matchingTags.length === 1) return matchingTags[0];
        if (matchingTags.length === 2) return matchingTags[1];
    }
}
