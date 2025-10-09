import NDK, { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import NDKCacheAdapterDexie from "./index";
import { db } from "./db";

describe("setEventDup", () => {
    let adapter: NDKCacheAdapterDexie;
    let ndk: NDK;

    beforeEach(async () => {
        ndk = new NDK();
        adapter = new NDKCacheAdapterDexie({
            dbName: "test-setEventDup-" + Math.random().toString(36)
        });
        // Wait for the cache to warm up
        await new Promise<void>(resolve => {
            if (adapter.ready) {
                resolve();
            } else {
                adapter.onReady(() => resolve());
            }
        });
    });

    afterEach(async () => {
        if (db) {
            await db.delete();
        }
    });

    it("should add relay to existing event", async () => {
        // Create a valid event
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

        // Store event first with relay1
        await adapter.setEvent(event, [], relay1);

        // Add more relays using setEventDup
        adapter.setEventDup(event, relay2);
        adapter.setEventDup(event, relay3);

        // Wait for async operations to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Query the eventRelays table to verify all relays are stored
        const relays = await db.eventRelays.where({ eventId: event.id }).toArray();
        expect(relays).toHaveLength(3);
        const relayUrls = relays.map(r => r.relayUrl);
        expect(relayUrls).toContain("wss://relay1.example.com");
        expect(relayUrls).toContain("wss://relay2.example.com");
        expect(relayUrls).toContain("wss://relay3.example.com");
    });

    it("should handle duplicate relay associations", async () => {
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
        await adapter.setEvent(event, [], relay);

        // Add same relay multiple times
        adapter.setEventDup(event, relay);
        adapter.setEventDup(event, relay);

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Should still only have the relay once (Dexie's put with primary key handles this)
        const relays = await db.eventRelays.where({ eventId: event.id, relayUrl: "wss://relay.example.com" }).toArray();
        expect(relays).toHaveLength(1);
    });

    it("should handle event not in database", async () => {
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        const relay = { url: "wss://relay.example.com" } as any;

        // Call setEventDup without storing event first
        // Should not throw, and should create relay association anyway
        expect(() => adapter.setEventDup(event, relay)).not.toThrow();

        // Wait a bit for the async db.eventRelays.put to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Relay association should be created even if event doesn't exist
        const relays = await db.eventRelays.where({ eventId: event.id }).toArray();
        expect(relays).toHaveLength(1);
        expect(relays[0].relayUrl).toBe("wss://relay.example.com");
    });

    it("should store relay information in database", async () => {
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        event.pubkey = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test relay preservation";
        event.tags = [];
        event.sig = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

        const relay1 = { url: "wss://relay1.example.com/" } as any;
        const relay2 = { url: "wss://relay2.example.com/" } as any;
        const relay3 = { url: "wss://relay3.example.com/" } as any;

        // Store event and add relays
        await adapter.setEvent(event, [], relay1);
        adapter.setEventDup(event, relay2);
        adapter.setEventDup(event, relay3);

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify all relays are in database
        const relays = await db.eventRelays.where({ eventId: event.id }).toArray();
        expect(relays).toHaveLength(3);
        const relayUrls = relays.map(r => r.relayUrl);
        expect(relayUrls).toContain("wss://relay1.example.com/");
        expect(relayUrls).toContain("wss://relay2.example.com/");
        expect(relayUrls).toContain("wss://relay3.example.com/");
    });
});