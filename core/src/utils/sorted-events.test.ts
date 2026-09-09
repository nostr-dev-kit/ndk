import { describe, expect, it } from "vitest";

import { NDKEvent } from "../events/index.js";
import { insertEventIntoAscendingList, insertEventIntoDescendingList } from "./sorted-events.js";

function event(id: string, createdAt?: number): NDKEvent {
    return new NDKEvent(undefined, { id, created_at: createdAt });
}

describe("sorted event insertion", () => {
    it("inserts into descending lists without mutating the input", () => {
        const original = [event("newest", 30), event("middle", 20), event("oldest", 10)];
        const inserted = insertEventIntoDescendingList(original, event("between", 25));

        expect(inserted.map(({ id }) => id)).toEqual(["newest", "between", "middle", "oldest"]);
        expect(original.map(({ id }) => id)).toEqual(["newest", "middle", "oldest"]);
        expect(
            insertEventIntoDescendingList(inserted, event("first", 40)).map(({ id }) => id),
        ).toEqual(["first", "newest", "between", "middle", "oldest"]);
        expect(
            insertEventIntoDescendingList(inserted, event("last", 5)).map(({ id }) => id),
        ).toEqual(["newest", "between", "middle", "oldest", "last"]);
    });

    it("inserts into ascending lists", () => {
        const original = [event("oldest", 10), event("middle", 20), event("newest", 30)];
        const inserted = insertEventIntoAscendingList(original, event("between", 25));

        expect(inserted.map(({ id }) => id)).toEqual(["oldest", "middle", "between", "newest"]);
        expect(
            insertEventIntoAscendingList(inserted, event("first", 5)).map(({ id }) => id),
        ).toEqual(["first", "oldest", "middle", "between", "newest"]);
        expect(
            insertEventIntoAscendingList(inserted, event("last", 40)).map(({ id }) => id),
        ).toEqual(["oldest", "middle", "between", "newest", "last"]);
    });

    it("keeps equal timestamps stable and ignores duplicate event IDs", () => {
        const list = [event("a", 20), event("b", 20), event("c", 10)];
        const withEqualTimestamp = insertEventIntoDescendingList(list, event("d", 20));

        expect(withEqualTimestamp.map(({ id }) => id)).toEqual(["a", "b", "d", "c"]);

        const duplicate = insertEventIntoDescendingList(list, event("a", 30));
        expect(duplicate).toBe(list);
    });

    it("rejects events without a timestamp", () => {
        expect(() => insertEventIntoDescendingList([], event("missing"))).toThrow(
            "Cannot insert an event without created_at",
        );
    });
});
