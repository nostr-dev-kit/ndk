import type { NostrEvent, NDKEvent } from "./index.js";

/**
 * Serializes an event object into a string representation.
 *
 * @param this - The event object to serialize.
 * @returns A string representation of the serialized event.
 */
export function serialize(this: NDKEvent | NostrEvent): string {
    return JSON.stringify([0, this.pubkey, this.created_at, this.kind, this.tags, this.content]);
}

/**
 * Deserialize a nostr event from a string
 * @param serializedEvent string
 * @returns NostrEvent
 */
export function deserialize(serializedEvent: string): NostrEvent {
    const eventArray = JSON.parse(serializedEvent);
    return {
        pubkey: eventArray[1],
        created_at: eventArray[2],
        kind: eventArray[3],
        tags: eventArray[4],
        content: eventArray[5],
    };
}
