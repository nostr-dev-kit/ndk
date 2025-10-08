import { describe, it, expect } from "vitest";

describe("Worker postMessage serialization", () => {
    it("should check how data is serialized across worker boundary", () => {
        // Simulate what the worker returns
        const dbRow = {
            id: "event-id",
            pubkey: "pubkey",
            created_at: 1759871760,
            kind: 7375,
            tags: "[]",
            content: "test token",
            sig: "sig",
            raw: "[\"event-id\",\"pubkey\",1759871760,7375,[],\"test token\",\"sig\"]",
            deleted: 0,
        };

        console.log("Original dbRow.raw:", dbRow.raw);
        console.log("Original dbRow.raw type:", typeof dbRow.raw);

        // Simulate postMessage serialization
        const serialized = JSON.stringify(dbRow);
        const deserialized = JSON.parse(serialized);

        console.log("After serialization dbRow.raw:", deserialized.raw);
        console.log("After serialization dbRow.raw type:", typeof deserialized.raw);

        // Check if it's still parseable
        const parsed = JSON.parse(deserialized.raw);
        console.log("Parsed:", parsed);

        expect(parsed[0]).toBe("event-id");
    });
});
