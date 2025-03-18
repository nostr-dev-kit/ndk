import NDK, { NDKEvent, NDKPrivateKeySigner, NDKSubscription } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "./index";
import { db } from "./db";

// Initialize NDK with cache adapter
const ndk = new NDK();
ndk.signer = NDKPrivateKeySigner.generate();
ndk.cacheAdapter = new NDKCacheAdapterDexie();

async function runTest() {
    try {
        // Create a large number of events to trigger the performance issue
        const startTime = Math.floor(Date.now() / 1000);
        const eventCount = 5000;
        const targetKind = 1;

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

        // Track received events
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

        if (queryDuration < 1000) {
            console.log("✅ PASS: Query completed in less than 1000ms");
        } else {
            console.log("❌ FAIL: Query took too long (> 1000ms)");
        }

        if (receivedEvents > 0 && receivedEvents <= 500) {
            console.log("✅ PASS: Received an appropriate number of events (≤ 500)");
        } else {
            console.log("❌ FAIL: Received too many events or none at all");
        }

        // Clean up the database to avoid affecting other tests
        await db.delete();
    } catch (error) {
        console.error("Test failed with error:", error);
    }
}

// Run the test
runTest().catch(console.error);
