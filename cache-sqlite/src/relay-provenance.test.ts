import NDK, { NDKEvent, NDKRelay, NDKRelayStatus, NDKSubscription } from "@nostr-dev-kit/ndk";
import * as fs from "fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NDKCacheAdapterSqlite } from "./index";

describe("Relay Provenance", () => {
    let adapter: NDKCacheAdapterSqlite;
    let ndk: NDK;
    const testDbPath = "./test-relay-provenance.db";

    beforeEach(async () => {
        // Clean up any existing test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }

        ndk = new NDK({
            explicitRelayUrls: ["wss://relay1.example.com", "wss://relay2.example.com", "wss://relay3.example.com"],
        });

        adapter = new NDKCacheAdapterSqlite({
            dbPath: testDbPath,
            dbName: "test-relay-provenance",
        });

        await adapter.initializeAsync(ndk);
    });

    afterEach(() => {
        if (adapter) {
            adapter.close();
        }

        // Clean up test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    it("should store and restore single relay provenance", async () => {
        const event = new NDKEvent(ndk);
        event.id = "test-event-with-relay";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test event with relay";
        event.tags = [];
        event.sig = "test-signature";

        // Create a mock relay
        const relay = ndk.pool.getRelay("wss://relay1.example.com", true, true);
        relay.status = NDKRelayStatus.CONNECTED;

        // Store event with relay
        await adapter.setEvent(event, [], relay);

        // Create subscription to query the event
        const subscription = new NDKSubscription(ndk, [{ ids: ["test-event-with-relay"] }]);

        // Query from cache
        const events = adapter.query.call(adapter, subscription);

        expect(events).toHaveLength(1);
        expect(events[0].id).toBe("test-event-with-relay");
        expect(events[0].relay).toBeDefined();
        expect(events[0].relay?.url).toBe("wss://relay1.example.com");
    });

    it("should track multiple relays for same event", async () => {
        const event = new NDKEvent(ndk);
        event.id = "test-event-multi-relay";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test event from multiple relays";
        event.tags = [];
        event.sig = "test-signature";

        // Create mock relays
        const relay1 = ndk.pool.getRelay("wss://relay1.example.com", true, true);
        const relay2 = ndk.pool.getRelay("wss://relay2.example.com", true, true);
        const relay3 = ndk.pool.getRelay("wss://relay3.example.com", true, true);

        relay1.status = NDKRelayStatus.CONNECTED;
        relay2.status = NDKRelayStatus.CONNECTED;
        relay3.status = NDKRelayStatus.CONNECTED;

        // Store event from relay1 (first seen)
        await adapter.setEvent(event, [], relay1);

        // Simulate receiving same event from relay2
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to ensure different timestamp
        await adapter.setEvent(event, [], relay2);

        // Simulate receiving same event from relay3
        await new Promise(resolve => setTimeout(resolve, 10));
        await adapter.setEvent(event, [], relay3);

        // Create subscription to query the event
        const subscription = new NDKSubscription(ndk, [{ ids: ["test-event-multi-relay"] }]);

        // Query from cache
        const events = adapter.query.call(adapter, subscription);

        expect(events).toHaveLength(1);
        const cachedEvent = events[0];

        // Primary relay should be the first one seen
        expect(cachedEvent.relay?.url).toBe("wss://relay1.example.com");

        // onRelays getter should include all relays
        const seenRelays = cachedEvent.onRelays;
        expect(seenRelays).toHaveLength(3);
        expect(seenRelays.map(r => r.url)).toContain("wss://relay1.example.com");
        expect(seenRelays.map(r => r.url)).toContain("wss://relay2.example.com");
        expect(seenRelays.map(r => r.url)).toContain("wss://relay3.example.com");
    });

    it("should preserve first-seen timestamp", async () => {
        const event = new NDKEvent(ndk);
        event.id = "test-event-timestamp";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test timestamp preservation";
        event.tags = [];
        event.sig = "test-signature";

        const relay1 = ndk.pool.getRelay("wss://relay1.example.com", true, true);
        const relay2 = ndk.pool.getRelay("wss://relay2.example.com", true, true);

        relay1.status = NDKRelayStatus.CONNECTED;
        relay2.status = NDKRelayStatus.CONNECTED;

        const firstSeenTime = Date.now();
        await adapter.setEvent(event, [], relay1);

        // Wait and try to store from same relay again
        await new Promise(resolve => setTimeout(resolve, 100));
        const secondSeenTime = Date.now();
        await adapter.setEvent(event, [], relay1);

        // Verify we have two timestamps stored
        const db = adapter.db!.getDatabase();
        const relays = db
            .prepare("SELECT relay_url, seen_at FROM event_relays WHERE event_id = ? ORDER BY seen_at")
            .all("test-event-timestamp") as Array<{ relay_url: string; seen_at: number }>;

        expect(relays).toHaveLength(1); // Should only have one entry due to INSERT OR IGNORE
        expect(relays[0].relay_url).toBe("wss://relay1.example.com");
        // First seen timestamp should be preserved (closer to firstSeenTime)
        expect(Math.abs(relays[0].seen_at - firstSeenTime)).toBeLessThan(50);
        expect(Math.abs(relays[0].seen_at - secondSeenTime)).toBeGreaterThan(50);
    });

    it("should work without relay (cache-only scenario)", async () => {
        const event = new NDKEvent(ndk);
        event.id = "test-event-no-relay";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test event without relay";
        event.tags = [];
        event.sig = "test-signature";

        // Store event without relay
        await adapter.setEvent(event, []);

        // Create subscription to query the event
        const subscription = new NDKSubscription(ndk, [{ ids: ["test-event-no-relay"] }]);

        // Query from cache
        const events = adapter.query.call(adapter, subscription);

        expect(events).toHaveLength(1);
        expect(events[0].id).toBe("test-event-no-relay");
        expect(events[0].relay).toBeUndefined();
    });
});
