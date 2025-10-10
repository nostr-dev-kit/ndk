import NDK, { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import * as fs from "fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NDKCacheAdapterSqlite } from "./index";

describe("setEventDup", () => {
    let adapter: NDKCacheAdapterSqlite;
    let ndk: NDK;
    const testDbPath = "./test-setEventDup.db";

    beforeEach(async () => {
        // Clean up any existing test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }

        ndk = new NDK();

        adapter = new NDKCacheAdapterSqlite({
            dbPath: testDbPath,
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

    it("should store relay associations for duplicate events", async () => {
        // Create a valid event with proper hex ID
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        event.pubkey = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test event";
        event.tags = [];
        event.sig = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

        // Create mock relays
        const relay1 = { url: "wss://relay1.example.com" } as any;
        const relay2 = { url: "wss://relay2.example.com" } as any;
        const relay3 = { url: "wss://relay3.example.com" } as any;

        // First store event with relay1 using setEvent
        await adapter.setEvent(event, [], relay1);

        // Then add duplicate relays using setEventDup
        adapter.setEventDup(event, relay2);
        adapter.setEventDup(event, relay3);

        // Query the database directly to verify
        const db = adapter.db!.getDatabase();
        const relays = db
            .prepare("SELECT relay_url FROM event_relays WHERE event_id = ? ORDER BY relay_url")
            .all(event.id) as Array<{ relay_url: string }>;

        expect(relays).toHaveLength(3);
        expect(relays.map(r => r.relay_url)).toEqual([
            "wss://relay1.example.com",
            "wss://relay2.example.com",
            "wss://relay3.example.com"
        ]);
    });

    it("should handle setEventDup with invalid event ID", () => {
        const event = new NDKEvent(ndk);
        event.id = ""; // Invalid ID
        const relay = { url: "wss://relay.example.com" } as any;

        // Should not throw, but should return early
        expect(() => adapter.setEventDup(event, relay)).not.toThrow();
    });

    it("should handle setEventDup with missing relay URL", () => {
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        const relay = {} as any; // No URL

        // Should not throw, but should return early
        expect(() => adapter.setEventDup(event, relay)).not.toThrow();
    });

    it("should handle duplicate relay associations (INSERT OR IGNORE)", () => {
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        event.pubkey = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test";
        event.tags = [];
        event.sig = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

        const relay = { url: "wss://relay.example.com" } as any;

        // Store event
        adapter.setEvent(event, [], relay);

        // Try to add the same relay again
        adapter.setEventDup(event, relay);
        adapter.setEventDup(event, relay);

        // Should still only have one entry due to INSERT OR IGNORE
        const db = adapter.db!.getDatabase();
        const relays = db
            .prepare("SELECT COUNT(*) as count FROM event_relays WHERE event_id = ? AND relay_url = ?")
            .get(event.id, relay.url) as { count: number };

        expect(relays.count).toBe(1);
    });

    it("should preserve relay information when querying from cache", async () => {
        // Create a valid event
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        event.pubkey = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test event for relay preservation";
        event.tags = [];
        event.sig = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

        // Mock relays - need to be in pool for query to restore them
        const relay1 = ndk.pool.getRelay("wss://relay1.example.com", true, true);
        const relay2 = ndk.pool.getRelay("wss://relay2.example.com", true, true);
        const relay3 = ndk.pool.getRelay("wss://relay3.example.com", true, true);

        // Store event with first relay
        await adapter.setEvent(event, [], relay1);

        // Add duplicate relays
        adapter.setEventDup(event, relay2);
        adapter.setEventDup(event, relay3);

        // Create subscription to query the event
        const subscription = new NDKSubscription(ndk, [{
            ids: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]
        }]);

        // Query from cache
        const events = await adapter.query(subscription);

        expect(events).toHaveLength(1);
        const cachedEvent = events[0];

        // Check that all relays are in onRelays
        const relayUrls = cachedEvent.onRelays.map(r => r.url);
        expect(relayUrls).toContain("wss://relay1.example.com/");
        expect(relayUrls).toContain("wss://relay2.example.com/");
        expect(relayUrls).toContain("wss://relay3.example.com/");
        expect(relayUrls).toHaveLength(3);

        // Primary relay should be the first one
        expect(cachedEvent.relay?.url).toBe("wss://relay1.example.com/");
    });
});