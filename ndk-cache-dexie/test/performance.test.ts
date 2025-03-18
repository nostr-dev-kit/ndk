import { describe, it, expect, beforeAll } from "vitest";
import NDK, { NDKEvent, NDKPrivateKeySigner, NDKSubscription } from "@nostr-dev-kit/ndk";
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

        // Add a large number of events with the same kind
        console.log(`Adding ${eventCount} events to the cache...`);
        const addStart = performance.now();

        for (let i = 0; i < eventCount; i++) {
            const event = new NDKEvent(ndk);
            event.kind = targetKind;
            event.content = `Test event ${i}`;
            event.created_at = startTime - i;
            await event.sign();
            ndk.cacheAdapter!.setEvent(event, []);
        }

        const addDuration = performance.now() - addStart;
        console.log(`Added ${eventCount} events in ${addDuration.toFixed(2)}ms`);

        // Create a subscription that queries by kind
        const subscription = new NDKSubscription(ndk, [{ kinds: [targetKind] }]);

        // Spy on the eventReceived method
        let receivedEvents = 0;
        const originalEventReceived = subscription.eventReceived;
        subscription.eventReceived = function (...args) {
            receivedEvents++;
            return originalEventReceived.apply(this, args);
        };

        // Measure query time
        console.log("Executing query by kinds...");
        const queryStart = performance.now();
        await ndk.cacheAdapter!.query(subscription);
        const queryDuration = performance.now() - queryStart;

        console.log(`Query took ${queryDuration.toFixed(2)}ms, received ${receivedEvents} events`);

        // The test passes if the query completes in a reasonable time
        // Currently it's failing with 15+ seconds, we want it under 1000ms
        expect(queryDuration).toBeLessThan(1000);

        // Also verify that we're not getting too many events
        // (this would mean our limit filtering is working)
        expect(receivedEvents).toBeGreaterThan(0);
        expect(receivedEvents).toBeLessThanOrEqual(500); // Default limit
    });
});
