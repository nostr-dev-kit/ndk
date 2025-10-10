import { describe, it, expect, beforeEach } from "vitest";
import { NDKCacheAdapterSqliteWasm } from "../src/index";
import NDK, { NDKEvent, NDKKind, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

describe("Query with deleted events", () => {
    let cache: NDKCacheAdapterSqliteWasm;
    let ndk: NDK;

    beforeEach(async () => {
        cache = new NDKCacheAdapterSqliteWasm({
            dbName: `test-deleted-${Date.now()}`,
            useWorker: false,
        });
        ndk = new NDK({ cacheAdapter: cache });
        await cache.initializeAsync(ndk);
    });

    it("should exclude deleted events from queries", async () => {
        // Create and store an event
        const event = new NDKEvent(ndk, {
            kind: NDKKind.CashuToken,
            content: "test token",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "test-pubkey",
            tags: [],
        });
        event.id = "test-event-id";
        event.sig = "test-sig";

        // Store the event
        await cache.setEvent(event, [{ kinds: [NDKKind.CashuToken] }]);

        // Verify it's stored and queryable
        const events1 = await ndk.fetchEvents([{ kinds: [NDKKind.CashuToken] }], {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
        });
        expect(events1.size).toBe(1);

        // Check stats
        const stats1 = await cache.getCacheStats();
        expect(stats1.eventsByKind[NDKKind.CashuToken]).toBe(1);

        // Manually mark event as deleted in DB
        if (cache.db) {
            cache.db.run("UPDATE events SET deleted = 1 WHERE id = ?", ["test-event-id"]);
        }

        // Query should now return 0 events (because deleted = 1)
        const events2 = await ndk.fetchEvents([{ kinds: [NDKKind.CashuToken] }], {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
        });
        expect(events2.size).toBe(0);

        // Stats should also show 0 events
        const stats2 = await cache.getCacheStats();
        expect(stats2.eventsByKind[NDKKind.CashuToken]).toBeUndefined();
    });
});
