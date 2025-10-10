import { describe, it, expect, beforeEach } from "vitest";
import { NDKCacheAdapterSqliteWasm } from "../src/index";
import NDK, { NDKEvent, NDKKind, NDKSubscription } from "@nostr-dev-kit/ndk";

describe("Debug query", () => {
    let cache: NDKCacheAdapterSqliteWasm;
    let ndk: NDK;

    beforeEach(async () => {
        cache = new NDKCacheAdapterSqliteWasm({
            dbName: "test-debug",
            useWorker: false,
        });
        ndk = new NDK({ cacheAdapter: cache });
        await cache.initializeAsync(ndk);
    });

    it("should directly query cache adapter", async () => {
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

        // Check stats to confirm it's stored
        const stats = await cache.getCacheStats();
        console.log("Stats:", stats);

        // Directly query the cache adapter
        const sub = new NDKSubscription(ndk, [{ kinds: [NDKKind.CashuToken] }]);
        const results = await cache.query(sub);
        console.log("Query results:", results);
        console.log("Query results length:", results.length);
        
        expect(results.length).toBe(1);
    });
});
