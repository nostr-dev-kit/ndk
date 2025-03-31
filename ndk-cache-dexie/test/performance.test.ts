import NDK, { NDKEvent, NDKPrivateKeySigner, NDKSubscription } from "@nostr-dev-kit/ndk";
import { beforeAll, describe, expect, it } from "vitest";
import NDKCacheAdapterDexie from "../src/index";

// Create an NDK instance with a dexie adapter for testing
const ndk = new NDK();
ndk.signer = NDKPrivateKeySigner.generate();
ndk.cacheAdapter = new NDKCacheAdapterDexie();

describe("Cache performance tests", () => {
    it("should handle large number of events without freezing with byKinds", async () => {
        // Create a large number of events to trigger the performance issue
        const startTime = Math.floor(Date.now() / 1000);
        const eventCount = 5000;
        const targetKind = 1;
        const addStart = performance.now();

        for (let i = 0; i < eventCount; i++) {
            const event = new NDKEvent(ndk);
            event.kind = targetKind;
            event.content = `Test event ${i}`;
            event.created_at = startTime - i;
            await event.sign();
            ndk.cacheAdapter?.setEvent(event, []);
        }

        const _addDuration = performance.now() - addStart;

        // Create a subscription that queries by kind
        const subscription = new NDKSubscription(ndk, [{ kinds: [targetKind] }]);

        // Spy on the eventReceived method
        let receivedEvents = 0;
        const originalEventReceived = subscription.eventReceived;
        subscription.eventReceived = function (...args) {
            receivedEvents++;
            return originalEventReceived.apply(this, args);
        };
        const queryStart = performance.now();
        await ndk.cacheAdapter?.query(subscription);
        const queryDuration = performance.now() - queryStart;

        // The test passes if the query completes in a reasonable time
        // Currently it's failing with 15+ seconds, we want it under 1000ms
        expect(queryDuration).toBeLessThan(1000);

        // Also verify that we're not getting too many events
        // (this would mean our limit filtering is working)
        expect(receivedEvents).toBeGreaterThan(0);
        expect(receivedEvents).toBeLessThanOrEqual(500); // Default limit
    });
});
