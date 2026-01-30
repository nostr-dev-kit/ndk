import { NDKEvent, NDKKind, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import NDKCacheSqliteWasm from "../index";

describe("query", () => {
    let cache: NDKCacheSqliteWasm;

    beforeEach(async () => {
        cache = new NDKCacheSqliteWasm({
            dbName: "test-cache-query",
        });
        await cache.initializeAsync();

        // Add some test events
        const events = [
            createEvent("event1", "alice", 1, "Hello from Alice"),
            createEvent("event2", "bob", 1, "Hello from Bob"),
            createEvent("event3", "alice", 30023, "Article by Alice"),
            createEvent("event4", "charlie", 1, "Hello from Charlie", [["p", "alice"]]),
        ];

        for (const event of events) {
            await cache.setEvent(event, []);
        }
    });

    it("should query by author", async () => {
        const mockSub = createMockSubscription([{ authors: ["alice"] }]);
        const results = await cache.query(mockSub);

        expect(results).toHaveLength(2);
        expect(results.every((e) => e.pubkey === "alice")).toBe(true);
    });

    it("should query by kind", async () => {
        const mockSub = createMockSubscription([{ kinds: [1] }]);
        const results = await cache.query(mockSub);

        expect(results).toHaveLength(3);
        expect(results.every((e) => e.kind === 1)).toBe(true);
    });

    it("should query by authors and kinds", async () => {
        const mockSub = createMockSubscription([{ authors: ["alice"], kinds: [1] }]);
        const results = await cache.query(mockSub);

        expect(results).toHaveLength(1);
        expect(results[0].pubkey).toBe("alice");
        expect(results[0].kind).toBe(1);
    });

    it("should query by tag", async () => {
        const mockSub = createMockSubscription([{ "#p": ["alice"] }]);
        const results = await cache.query(mockSub);

        expect(results).toHaveLength(1);
        expect(results[0].id).toBe("event4");
    });

    it("should query by event id", async () => {
        const mockSub = createMockSubscription([{ ids: ["event1", "event2"] }]);
        const results = await cache.query(mockSub);

        expect(results).toHaveLength(2);
        expect(results.map((e) => e.id).sort()).toEqual(["event1", "event2"]);
    });

    it("should respect filter limit", async () => {
        const mockSub = createMockSubscription([{ kinds: [1], limit: 2 }]);
        const results = await cache.query(mockSub);

        expect(results.length).toBeLessThanOrEqual(2);
    });
});

function createEvent(id: string, pubkey: string, kind: number, content: string, tags: string[][] = []): NDKEvent {
    const event = new NDKEvent();
    event.id = id;
    event.pubkey = pubkey;
    event.created_at = Math.floor(Date.now() / 1000);
    event.kind = kind;
    event.content = content;
    event.tags = tags;
    event.sig = `sig-${id}`;
    return event;
}

function createMockSubscription(filters: any[]): NDKSubscription {
    return {
        filters,
        pool: {
            getRelay: () => null,
        },
        ndk: {
            subManager: {
                seenEvent: () => {},
            },
        },
    } as any;
}
