import NDK, { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import { describe, expect, it, beforeEach } from "vitest";
import NDKCacheAdapterMemory from "../index";

describe("setEventDup", () => {
    let adapter: NDKCacheAdapterMemory;
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK();
        adapter = new NDKCacheAdapterMemory();
    });

    it("should handle duplicate events without error", () => {
        // Create a valid event
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        event.pubkey = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test event";
        event.tags = [];
        event.sig =
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

        // Create mock relays
        const relay1 = { url: "wss://relay1.example.com" } as any;
        const relay2 = { url: "wss://relay2.example.com" } as any;

        // Store event first
        adapter.setEvent(event, [], relay1);

        // Call setEventDup (memory adapter just ensures event exists)
        expect(() => adapter.setEventDup(event, relay2)).not.toThrow();

        // Verify event is still in cache by querying
        const subscription = new NDKSubscription(ndk, [
            {
                ids: [event.id],
            },
        ]);
        const events = adapter.query(subscription);
        expect(events).toHaveLength(1);
        expect(events[0].id).toBe(event.id);
    });

    it("should add event if not already cached", () => {
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        event.pubkey = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test";
        event.tags = [];
        event.sig =
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

        const relay = { url: "wss://relay.example.com" } as any;

        // Call setEventDup without setEvent first
        adapter.setEventDup(event, relay);

        // Should add the event to cache - verify by querying
        const subscription = new NDKSubscription(ndk, [
            {
                ids: [event.id],
            },
        ]);
        const events = adapter.query(subscription);
        expect(events).toHaveLength(1);
        expect(events[0].id).toBe(event.id);
    });

    it("should handle multiple duplicate calls", () => {
        const event = new NDKEvent(ndk);
        event.id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        event.pubkey = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Test";
        event.tags = [];
        event.sig =
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

        const relay1 = { url: "wss://relay1.example.com" } as any;
        const relay2 = { url: "wss://relay2.example.com" } as any;
        const relay3 = { url: "wss://relay3.example.com" } as any;

        // Multiple calls shouldn't cause issues
        adapter.setEventDup(event, relay1);
        adapter.setEventDup(event, relay2);
        adapter.setEventDup(event, relay3);
        adapter.setEventDup(event, relay1); // Duplicate

        // Verify event is in cache
        const subscription = new NDKSubscription(ndk, [
            {
                ids: [event.id],
            },
        ]);
        const events = adapter.query(subscription);
        expect(events).toHaveLength(1);
        expect(events[0].id).toBe(event.id);
    });
});
