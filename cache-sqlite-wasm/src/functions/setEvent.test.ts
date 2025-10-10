import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import NDKCacheSqliteWasm from "../index";

describe("setEvent", () => {
    let cache: NDKCacheSqliteWasm;

    beforeEach(async () => {
        cache = new NDKCacheSqliteWasm({
            dbName: "test-cache-setEvent",
            useWorker: false,
            wasmUrl: new URL("../../example/sql-wasm.wasm", import.meta.url).href,
        });
        await cache.initializeAsync();
    });

    it("should store a basic event", async () => {
        const event = new NDKEvent();
        event.id = "test-event-1";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Hello, world!";
        event.tags = [];
        event.sig = "test-sig";

        await cache.setEvent(event, []);

        // Verify event was stored
        const result = cache.db!.exec("SELECT * FROM events WHERE id = ?", [event.id]);
        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(1);
        expect(result[0].values[0][0]).toBe(event.id);
    });

    it("should index single-letter tags", async () => {
        const event = new NDKEvent();
        event.id = "test-event-2";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Tagged event";
        event.tags = [
            ["p", "pubkey1"],
            ["e", "event1"],
            ["custom", "value"], // Should NOT be indexed
        ];
        event.sig = "test-sig";

        await cache.setEvent(event, []);

        // Check that single-letter tags were indexed
        const result = cache.db!.exec("SELECT * FROM event_tags WHERE event_id = ?", [event.id]);
        expect(result[0].values).toHaveLength(2); // Only p and e tags

        const tags = result[0].values.map((row) => row[1]);
        expect(tags).toContain("p");
        expect(tags).toContain("e");
        expect(tags).not.toContain("custom");
    });

    it("should save profile from kind:0 events", async () => {
        const profile = {
            name: "Test User",
            about: "Test bio",
            picture: "https://example.com/pic.jpg",
        };

        const event = new NDKEvent();
        event.id = "test-profile-event";
        event.pubkey = "profile-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = NDKKind.Metadata;
        event.content = JSON.stringify(profile);
        event.tags = [];
        event.sig = "test-sig";

        await cache.setEvent(event, []);

        // Check that profile was saved
        const result = cache.db!.exec("SELECT * FROM profiles WHERE pubkey = ?", [event.pubkey]);
        expect(result[0].values).toHaveLength(1);

        const savedProfile = JSON.parse(result[0].values[0][1] as string);
        expect(savedProfile.name).toBe(profile.name);
        expect(savedProfile.about).toBe(profile.about);
    });

    it("should store relay provenance", async () => {
        const event = new NDKEvent();
        event.id = "test-event-3";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Event with relay";
        event.tags = [];
        event.sig = "test-sig";

        const relay = { url: "wss://relay.example.com" };

        await cache.setEvent(event, [], relay as any);

        // Check relay was saved
        const result = cache.db!.exec("SELECT * FROM event_relays WHERE event_id = ?", [event.id]);
        expect(result[0].values).toHaveLength(1);
        expect(result[0].values[0][1]).toBe(relay.url);
    });
});
