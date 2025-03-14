import { expect } from "vitest";
import { NDKEvent } from "../../ndk/src";

export function expectEventToBeValid(event: NDKEvent): void {
    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.sig).toBeDefined();
    expect(event.created_at).toBeGreaterThan(0);
    expect(event.kind).toBeDefined();
    expect(event.pubkey).toBeDefined();
}

export function expectEventsToMatch(
    actual: NDKEvent,
    expected: NDKEvent,
    ignoreFields: string[] = []
): void {
    const actualRaw = actual.rawEvent() as Record<string, unknown>;
    const expectedRaw = expected.rawEvent() as Record<string, unknown>;

    // Don't check these fields unless explicitly requested
    const defaultIgnore = ["id", "sig", "created_at"];
    const fieldsToIgnore = [...new Set([...defaultIgnore, ...ignoreFields])];

    for (const field of fieldsToIgnore) {
        delete actualRaw[field];
        delete expectedRaw[field];
    }

    expect(actualRaw).toEqual(expectedRaw);
}

export function expectEventsToBeSorted(events: NDKEvent[], ascending: boolean = true): void {
    if (events.length <= 1) return;

    for (let i = 1; i < events.length; i++) {
        const prev = events[i - 1].created_at ?? 0;
        const curr = events[i].created_at ?? 0;

        if (ascending) {
            expect(prev).toBeLessThanOrEqual(curr);
        } else {
            expect(prev).toBeGreaterThanOrEqual(curr);
        }
    }
}
