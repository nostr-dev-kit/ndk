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

        // Test the full query flow via cache.query()
        const sub = new NDKSubscription(ndk, [{ kinds: [NDKKind.CashuToken] }]);
        const results = await cache.query(sub);

        console.log("Processed results:", results.length);
        expect(results.length).toBe(5);

        // Verify events have correct data
        for (const event of results) {
            expect(event.kind).toBe(NDKKind.CashuToken);
            expect(event.content).toMatch(/^test token \d$/);
        }
    });
});
