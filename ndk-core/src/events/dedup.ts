import type { NDKEvent } from "../index.js";

/**
 * Receives two events and returns the "correct" event to use.
 * #nip-33
 */
export default function dedup(event1: NDKEvent, event2: NDKEvent) {
    // return the newest of the two
    if (event1.created_at! > event2.created_at!) {
        return event1;
    }

    return event2;
}
