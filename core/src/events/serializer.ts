import type { NDKEvent, NostrEvent } from ".";

export type NDKEventSerialized = string;

/**
 * Safely gets event details for error messages, avoiding circular reference issues.
 */
function getEventDetails(event: NDKEvent | NostrEvent): string {
    // If it's an NDKEvent with the inspect getter, use it
    if ("inspect" in event && typeof event.inspect === "string") {
        return event.inspect;
    }
    // Fallback for NostrEvent
    return JSON.stringify(event);
}

/**
 * Validates event properties before serialization and throws a detailed error if invalid.
 * Optimized for the happy path - fails fast with minimal overhead for valid events.
 * @param event - The event to validate
 * @throws Error with details about which properties are invalid
 */
function validateForSerialization(event: NDKEvent | NostrEvent): void {
    // Fast path checks with immediate throws - no allocations on happy path
    if (typeof event.kind !== "number") {
        throw new Error(
            `Can't serialize event with invalid properties: kind (must be number, got ${typeof event.kind}). Event: ${getEventDetails(event)}`,
        );
    }
    if (typeof event.content !== "string") {
        throw new Error(
            `Can't serialize event with invalid properties: content (must be string, got ${typeof event.content}). Event: ${getEventDetails(event)}`,
        );
    }
    if (typeof event.created_at !== "number") {
        throw new Error(
            `Can't serialize event with invalid properties: created_at (must be number, got ${typeof event.created_at}). Event: ${getEventDetails(event)}`,
        );
    }
    if (typeof event.pubkey !== "string") {
        throw new Error(
            `Can't serialize event with invalid properties: pubkey (must be string, got ${typeof event.pubkey}). Event: ${getEventDetails(event)}`,
        );
    }
    if (!Array.isArray(event.tags)) {
        throw new Error(
            `Can't serialize event with invalid properties: tags (must be array, got ${typeof event.tags}). Event: ${getEventDetails(event)}`,
        );
    }
    // Validate tag structure
    for (let i = 0; i < event.tags.length; i++) {
        const tag = event.tags[i];
        if (!Array.isArray(tag)) {
            throw new Error(
                `Can't serialize event with invalid properties: tags[${i}] (must be array, got ${typeof tag}). Event: ${getEventDetails(event)}`,
            );
        }
        for (let j = 0; j < tag.length; j++) {
            if (typeof tag[j] !== "string") {
                throw new Error(
                    `Can't serialize event with invalid properties: tags[${i}][${j}] (must be string, got ${typeof tag[j]}). Event: ${getEventDetails(event)}`,
                );
            }
        }
    }
}

/**
 * Serializes an event object into a string representation.
 *
 * @param this - The event object to serialize.
 * @returns A string representation of the serialized event.
 */
export function serialize(this: NDKEvent | NostrEvent, includeSig = false, includeId = false): NDKEventSerialized {
    validateForSerialization(this);

    const payload = [0, this.pubkey, this.created_at, this.kind, this.tags, this.content];
    if (includeSig) payload.push(this.sig);
    if (includeId) payload.push(this.id);
    return JSON.stringify(payload);
}

/**
 * Deserialize a nostr event from a string
 * @param serializedEvent string
 * @returns NostrEvent
 */
export function deserialize(serializedEvent: NDKEventSerialized): NostrEvent {
    const eventArray = JSON.parse(serializedEvent);
    const ret: NostrEvent = {
        pubkey: eventArray[1],
        created_at: eventArray[2],
        kind: eventArray[3],
        tags: eventArray[4],
        content: eventArray[5],
    };

    if (eventArray.length >= 7) {
        const first = eventArray[6];
        const second = eventArray[7];

        if (first && first.length === 128) {
            // it's a signature
            ret.sig = first;
            if (second && second.length === 64) {
                // it's an id
                ret.id = second;
            }
        } else if (first && first.length === 64) {
            // it's an id
            ret.id = first;
            if (second && second.length === 128) {
                // it's a signature
                ret.sig = second;
            }
        }
    }

    return ret;
}
