import { describe, it, expect, beforeEach } from "vitest";
import { NDKCacheAdapterSqliteWasm } from "../src/index";
import NDK, { NDKEvent, NDKKind, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

describe("Debug subscription flow", () => {
    let cache: NDKCacheAdapterSqliteWasm;
    let ndk: NDK;

    beforeEach(async () => {
        cache = new NDKCacheAdapterSqliteWasm({
            dbName: "test-debug-sub",
            useWorker: false,
        });
        ndk = new NDK({ cacheAdapter: cache });
        await cache.initializeAsync(ndk);
    });

    it("should debug subscription flow", async () => {
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

        // Subscribe with explicit logging
        let eventCount = 0;
        const sub = ndk.subscribe(
            [{ kinds: [NDKKind.CashuToken] }],
            {
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
                closeOnEose: true,
            },
            {
                onEvent: (e) => {
                    console.log("Got event:", e.id);
                    eventCount++;
                },
                onEose: () => {
                    console.log("Got EOSE, event count:", eventCount);
                },
            }
        );

        // Wait a bit for events to arrive
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log("Final event count:", eventCount);
        expect(eventCount).toBe(1);
    });
});
