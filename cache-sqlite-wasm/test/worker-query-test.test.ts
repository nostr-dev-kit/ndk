import NDK, { NDKEvent, NDKKind, NDKSubscription } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { NDKCacheAdapterSqliteWasm } from "../src/index";

describe("Worker query processing", () => {
    let cache: NDKCacheAdapterSqliteWasm;
    let ndk: NDK;

    beforeEach(async () => {
        cache = new NDKCacheAdapterSqliteWasm({
            dbName: "test-worker-query",
            useWorker: false, // Start with non-worker to avoid WASM issues in test
        });
        ndk = new NDK({ cacheAdapter: cache });
        await cache.initializeAsync(ndk);
    });

    it("should process worker results correctly", async () => {
        // Create and store events
        for (let i = 0; i < 5; i++) {
            const event = new NDKEvent(ndk, {
                kind: NDKKind.CashuToken,
                content: `test token ${i}`,
                created_at: Math.floor(Date.now() / 1000) + i,
                pubkey: `pubkey-${i}`,
                tags: [],
            });
            event.id = `event-id-${i}`;
            event.sig = `sig-${i}`;

            await cache.setEvent(event, [{ kinds: [NDKKind.CashuToken] }]);
        }

        // Get raw worker-style results
        const sub = new NDKSubscription(ndk, [{ kinds: [NDKKind.CashuToken] }]);

        // Simulate what the worker returns by calling querySync directly
        if (cache.db) {
            const { querySync } = await import("../src/functions/query");
            const rawResults = querySync(cache.db, [{ kinds: [NDKKind.CashuToken] }]);

            console.log("Raw results from querySync:", rawResults.length);
            if (rawResults.length > 0) {
                console.log("First raw result:", rawResults[0]);
                console.log("First raw result.raw:", rawResults[0].raw);
                console.log("First raw result.raw type:", typeof rawResults[0].raw);

                // Try to parse it
                try {
                    const parsed = JSON.parse(rawResults[0].raw);
                    console.log("Parsed raw:", parsed);
                } catch (e) {
                    console.error("Failed to parse raw:", e);
                }
            }

            expect(rawResults.length).toBe(5);
        }

        // Now test the full query flow
        const results = await cache.query(sub);
        console.log("Processed results:", results.length);

        expect(results.length).toBe(5);
    });
});
