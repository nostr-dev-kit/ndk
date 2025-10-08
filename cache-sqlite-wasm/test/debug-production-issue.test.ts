import { describe, it, expect, beforeEach } from "vitest";
import { NDKCacheAdapterSqliteWasm } from "../src/index";
import NDK, { NDKEvent, NDKKind, NDKSubscriptionCacheUsage, NDKSubscription } from "@nostr-dev-kit/ndk";

describe("Debug production issue", () => {
    let cache: NDKCacheAdapterSqliteWasm;
    let ndk: NDK;

    beforeEach(async () => {
        cache = new NDKCacheAdapterSqliteWasm({
            dbName: "test-debug-prod",
            useWorker: false,
        });
        ndk = new NDK({ cacheAdapter: cache });
        await cache.initializeAsync(ndk);
    });

    it("should debug the exact issue", async () => {
        // Create and store multiple events
        for (let i = 0; i < 5; i++) {
            const event = new NDKEvent(ndk, {
                kind: NDKKind.CashuToken,
                content: `test token ${i}`,
                created_at: Math.floor(Date.now() / 1000) + i,
                pubkey: `test-pubkey-${i}`,
                tags: [],
            });
            event.id = `test-event-id-${i}`;
            event.sig = `test-sig-${i}`;
            
            await cache.setEvent(event, [{ kinds: [NDKKind.CashuToken] }]);
        }

        // Check stats
        const stats = await cache.getCacheStats();
        console.log("Stats:", stats);
        expect(stats.eventsByKind[NDKKind.CashuToken]).toBe(5);

        // Try direct query
        const sub = new NDKSubscription(ndk, [{ kinds: [NDKKind.CashuToken] }]);
        const directResults = await cache.query(sub);
        console.log("Direct cache.query results:", directResults.length);
        expect(directResults.length).toBe(5);

        // Now try fetchEvents
        console.log("About to call fetchEvents...");
        const events1 = await ndk.fetchEvents([{ kinds: [NDKKind.CashuToken] }], {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
        });
        
        console.log("fetchEvents returned, size:", events1.size);
        console.log("fetchEvents events:", Array.from(events1).map(e => e.id));
        
        expect(events1.size).toBe(5);
    });
});
