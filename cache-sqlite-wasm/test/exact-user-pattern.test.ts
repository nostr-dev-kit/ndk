import { describe, it, expect, beforeEach } from "vitest";
import { NDKCacheAdapterSqliteWasm } from "../src/index";
import NDK, { NDKEvent, NDKKind, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

describe("Exact user pattern", () => {
    let cache: NDKCacheAdapterSqliteWasm;
    let ndk: NDK;

    beforeEach(async () => {
        cache = new NDKCacheAdapterSqliteWasm({
            dbName: "test-user-pattern",
            useWorker: false,
        });
        ndk = new NDK({ cacheAdapter: cache });
        await cache.initializeAsync(ndk);
    });

    it("should return events with exact user pattern", async () => {
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

        // Check stats
        const stats = await cache.getCacheStats();
        console.log("Stats:", stats);

        // Use exact user pattern
        const events1 = await ndk.fetchEvents([{ kinds: [NDKKind.CashuToken] }], {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
        });
        
        console.log("events1.size:", events1.size);
        console.log("events1:", Array.from(events1));
        
        expect(events1.size).toBe(1);
    });
});
