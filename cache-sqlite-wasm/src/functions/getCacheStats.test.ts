import { describe, it, expect, beforeEach } from "vitest";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import NDKCacheSqliteWasm from "../index";

describe("getCacheStats", () => {
    let cache: NDKCacheSqliteWasm;

    beforeEach(async () => {
        cache = new NDKCacheSqliteWasm({
            dbName: "test-cache-stats",
            useWorker: false,
            wasmUrl: new URL("../../example/sql-wasm.wasm", import.meta.url).href,
        });
        await cache.initializeAsync();
    });

    it("should return zero stats for empty cache", async () => {
        const stats = await cache.getCacheStats();

        expect(stats.totalEvents).toBe(0);
        expect(stats.totalProfiles).toBe(0);
        expect(stats.totalEventTags).toBe(0);
        expect(Object.keys(stats.eventsByKind)).toHaveLength(0);
    });

    it("should count events by kind", async () => {
        const events = [
            createTestEvent("e1", 1),
            createTestEvent("e2", 1),
            createTestEvent("e3", 30023),
            createTestEvent("e4", 30023),
            createTestEvent("e5", 30023),
        ];

        for (const event of events) {
            await cache.setEvent(event, []);
        }

        const stats = await cache.getCacheStats();

        expect(stats.totalEvents).toBe(5);
        expect(stats.eventsByKind[1]).toBe(2);
        expect(stats.eventsByKind[30023]).toBe(3);
    });

    it("should count event tags", async () => {
        const event = new NDKEvent();
        event.id = "tagged-event";
        event.pubkey = "test-pubkey";
        event.created_at = Math.floor(Date.now() / 1000);
        event.kind = 1;
        event.content = "Tagged";
        event.tags = [
            ["p", "alice"],
            ["p", "bob"],
            ["e", "event1"],
        ];
        event.sig = "test-sig";

        await cache.setEvent(event, []);

        const stats = await cache.getCacheStats();

        expect(stats.totalEventTags).toBe(3);
    });

    it("should count profiles", async () => {
        const profileEvents = [
            createProfileEvent("alice", { name: "Alice" }),
            createProfileEvent("bob", { name: "Bob" }),
        ];

        for (const event of profileEvents) {
            await cache.setEvent(event, []);
        }

        const stats = await cache.getCacheStats();

        expect(stats.totalProfiles).toBe(2);
    });

    it("should count cashu mint data", async () => {
        const mintUrl = "https://mint.example.com";
        const mintInfo = { name: "Test Mint", version: "1.0" };
        const mintKeys = [{ id: "key1", amount: 1, pubkey: "pk1" }];

        await cache.saveCashuMintInfo(mintUrl, mintInfo as any);
        await cache.saveCashuMintKeys(mintUrl, mintKeys as any);

        const stats = await cache.getCacheStats();

        expect(stats.cashuMintInfo).toBe(1);
        expect(stats.cashuMintKeys).toBe(1);
    });
});

function createTestEvent(id: string, kind: number): NDKEvent {
    const event = new NDKEvent();
    event.id = id;
    event.pubkey = "test-pubkey";
    event.created_at = Math.floor(Date.now() / 1000);
    event.kind = kind;
    event.content = "Test content";
    event.tags = [];
    event.sig = `sig-${id}`;
    return event;
}

function createProfileEvent(pubkey: string, profile: any): NDKEvent {
    const event = new NDKEvent();
    event.id = `profile-${pubkey}`;
    event.pubkey = pubkey;
    event.created_at = Math.floor(Date.now() / 1000);
    event.kind = NDKKind.Metadata;
    event.content = JSON.stringify(profile);
    event.tags = [];
    event.sig = `sig-${pubkey}`;
    return event;
}
