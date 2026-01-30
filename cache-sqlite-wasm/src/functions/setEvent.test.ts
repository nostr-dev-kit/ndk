import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import NDKCacheSqliteWasm from "../index";

describe("setEvent", () => {
    let cache: NDKCacheSqliteWasm;

    beforeEach(async () => {
        cache = new NDKCacheSqliteWasm({
            dbName: "test-cache-setEvent",
        });
        await cache.initializeAsync();
    });

    it("should store and retrieve an event", async () => {
        const event = new NDKEvent();
        event.id = "test-event-1";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Hello world";
        event.tags = [["p", "alice"], ["e", "event123"]];
        event.sig = "test-sig";

        await cache.setEvent(event, []);

        // Retrieve via getEvent
        const retrieved = await cache.getEvent(event.id);
        expect(retrieved).not.toBeNull();
        expect(retrieved?.id).toBe(event.id);
        expect(retrieved?.content).toBe("Hello world");
    });

    it("should store and retrieve kind:0 profile events", async () => {
        const profileData = { name: "Alice", about: "Test user" };
        const event = new NDKEvent();
        event.id = "profile-event-1";
        event.pubkey = "alice-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = NDKKind.Metadata;
        event.content = JSON.stringify(profileData);
        event.tags = [];
        event.sig = "test-sig";

        await cache.setEvent(event, []);

        // Profile should be extractable via fetchProfile
        const profile = await cache.fetchProfile("alice-pubkey");
        expect(profile).not.toBeNull();
        expect(profile?.name).toBe("Alice");
    });
});
