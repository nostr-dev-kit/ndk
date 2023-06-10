import { nip10 } from "nostr-tools";
import NDKEvent from ".";

/**
 * NDKNestedEvent is a subclass of NDKEvent that contains
 * references to root and reply NDKEvents, and a children
 * getter for accessing nested events. See `nest`.
 */
export class NDKNestedEvent extends NDKEvent {
  readonly root?: NDKEvent;
  readonly reply?: NDKEvent;
  readonly children: NDKNestedEvent[] = [];

  constructor(event: NDKEvent,
    root?: NDKEvent | undefined,
    reply?: NDKEvent | undefined,
    mentions: NDKEvent[] = []) {
    super(event.ndk, event.rawEvent());
    this.root = root ? new NDKNestedEvent(root) : undefined;
    this.reply = reply ? new NDKNestedEvent(reply) : undefined;
  }
}

/**
 * Returns a nested array of NDKNestedEvent by using the "e"
 * tags in the input array.
 * 
 * Typically used to show threaded events in UIs.
 *
 * @param events a flat array of NDKEvent
 * @returns an array of nested NDKNestedEvent
 */
export function nest(events: NDKEvent[]): NDKNestedEvent[] {
  const nestedEvents = events.map(e => {
    const nip10Result = nip10.parse(e);
    const root = events.find(e => e.id === nip10Result.root?.id);
    const reply = events.find(e => e.id === nip10Result.reply?.id);
    return new NDKNestedEvent(e, root, reply);
  });
  return unflatten(nestedEvents);
}

function unflatten(events: NDKNestedEvent[], parent?: string | undefined): NDKNestedEvent[] {
  // Find all events at this level of recursion (filter by parent)
  // NIP-10: For top level replies only the "root" marker should be used
  const result = new Set(events.filter(e => {
    return (e.reply?.id || e.root?.id) === parent;
  }));

  // Remove found events from the original event array
  events = events.filter(e => !result.has(e));

  // For every event at this level, apply the same logic and add to children
  for (let e of result) {
    e.children.push(...unflatten(events, e.id));
  }

  // Return an array of nested events
  return [...result];
}