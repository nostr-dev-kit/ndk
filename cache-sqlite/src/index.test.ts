import NDK, { NDKEvent, type NDKFilter, NDKSubscription } from "@nostr-dev-kit/ndk";
import * as fs from "fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NDKCacheAdapterSqlite } from "./index";

describe("NDKCacheAdapterSqlite", () => {
    let adapter: NDKCacheAdapterSqlite;
    let ndk: NDK;
    const testDbPath = "./test-cache.db";

    beforeEach(async () => {
        // Clean up any existing test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }

        ndk = new NDK();
        adapter = new NDKCacheAdapterSqlite({
            dbPath: testDbPath,
            dbName: "test-cache",
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

    it("should initialize successfully", () => {
        expect(adapter).toBeDefined();
        expect(adapter.db).toBeDefined();
        expect(adapter.locking).toBe(false);
    });

    it("should create database file", () => {
        expect(fs.existsSync(testDbPath)).toBe(true);
    });

    it("should have all required methods", () => {
        expect(typeof adapter.setEvent).toBe("function");
        expect(typeof adapter.getEvent).toBe("function");
        expect(typeof adapter.fetchProfile).toBe("function");
        expect(typeof adapter.saveProfile).toBe("function");
        expect(typeof adapter.query).toBe("function");
        expect(typeof adapter.getProfiles).toBe("function");
        expect(typeof adapter.updateRelayStatus).toBe("function");
        expect(typeof adapter.getRelayStatus).toBe("function");
        expect(typeof adapter.getDecryptedEvent).toBe("function");
        expect(typeof adapter.addDecryptedEvent).toBe("function");
        expect(typeof adapter.addUnpublishedEvent).toBe("function");
        expect(typeof adapter.getUnpublishedEvents).toBe("function");
        expect(typeof adapter.discardUnpublishedEvent).toBe("function");
    });

    describe("Event Operations", () => {
        it("should store and retrieve events", async () => {
            const event = new NDKEvent();
            event.id = "test-event-id";
            event.pubkey = "test-pubkey";
            event.created_at = Math.floor(Date.now() / 1000);
            event.kind = 1;
            event.content = "Test content";
            event.tags = [["t", "test"]];
            event.sig = "test-signature";

            // Store the event
            await adapter.setEvent(event, []);

            // Retrieve the event
            const retrievedEvent = await adapter.getEvent("test-event-id");
            expect(retrievedEvent).toBeDefined();
            expect(retrievedEvent?.id).toBe("test-event-id");
            expect(retrievedEvent?.content).toBe("Test content");
        });

        it("should query events by filter", async () => {
            const event = new NDKEvent();
            event.id = "query-test-event";
            event.pubkey = "alice";
            event.created_at = Math.floor(Date.now() / 1000);
            event.kind = 1;
            event.content = "Query test content";
            event.tags = [];
            event.sig = "test-signature";

            // Store the event first
            await adapter.setEvent(event, []);

            // Verify the event was stored by trying to retrieve it directly
            const storedEvent = await adapter.getEvent("query-test-event");
            expect(storedEvent).toBeDefined();
            expect(storedEvent?.pubkey).toBe("alice");

            // Create a subscription with filters
            const filter: NDKFilter = { authors: ["alice"], kinds: [1] };
            const subscription = new NDKSubscription(ndk, [filter]);

            // Query events
            const results = adapter.query(subscription);
            expect(results).toBeDefined();
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].pubkey).toBe("alice");
        });
    });

    describe("Profile Operations", () => {
        it("should save and fetch profiles", async () => {
            const profile = {
                name: "Alice",
                about: "Test user",
                picture: "https://example.com/alice.jpg",
            };

            // Save profile
            await adapter.saveProfile("alice-pubkey", profile);

            // Fetch profile
            const retrievedProfile = await adapter.fetchProfile("alice-pubkey");
            expect(retrievedProfile).toBeDefined();
            expect(retrievedProfile?.name).toBe("Alice");
            expect(retrievedProfile?.about).toBe("Test user");
        });

        it("should get profiles with filter", async () => {
            const profile1 = { name: "Alice", about: "User 1" };
            const profile2 = { name: "Bob", about: "User 2" };

            await adapter.saveProfile("alice", profile1);
            await adapter.saveProfile("bob", profile2);

            // Get profiles with filter
            const profiles = await adapter.getProfiles((pubkey, profile) => profile.name === "Alice");
            expect(profiles).toBeDefined();
            expect(profiles?.size).toBe(1);
            expect(profiles?.get("alice")?.name).toBe("Alice");
        });
    });

    describe("Decrypted Events", () => {
        it("should store and retrieve decrypted events", () => {
            const event = new NDKEvent();
            event.id = "decrypted-event-id";
            event.pubkey = "test-pubkey";
            event.created_at = Math.floor(Date.now() / 1000);
            event.kind = 4;
            event.content = "Decrypted content";
            event.tags = [];
            event.sig = "test-signature";

            // Add decrypted event
            adapter.addDecryptedEvent(event);

            // Retrieve decrypted event
            const retrieved = adapter.getDecryptedEvent("decrypted-event-id");
            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe("decrypted-event-id");
            expect(retrieved?.content).toBe("Decrypted content");
        });
    });

    describe("Unpublished Events", () => {
        it("should manage unpublished events", async () => {
            const event = new NDKEvent();
            event.id = "unpublished-event-id";
            event.pubkey = "test-pubkey";
            event.created_at = Math.floor(Date.now() / 1000);
            event.kind = 1;
            event.content = "Unpublished content";
            event.tags = [];
            event.sig = "test-signature";

            const relayUrls = ["wss://relay1.com", "wss://relay2.com"];

            // Add unpublished event
            adapter.addUnpublishedEvent(event, relayUrls);

            // Get unpublished events
            const unpublished = await adapter.getUnpublishedEvents();
            expect(unpublished).toBeDefined();
            expect(unpublished.length).toBe(1);
            expect(unpublished[0].event.id).toBe("unpublished-event-id");
            expect(unpublished[0].relays).toEqual(relayUrls);

            // Discard unpublished event
            adapter.discardUnpublishedEvent("unpublished-event-id");

            // Verify it's removed
            const afterDiscard = await adapter.getUnpublishedEvents();
            expect(afterDiscard.length).toBe(0);
        });
    });

    describe("Relay Status", () => {
        it("should update and get relay status", async () => {
            const relayUrl = "wss://test-relay.com";
            const status = {
                lastConnectedAt: Math.floor(Date.now() / 1000),
                dontConnectBefore: Math.floor(Date.now() / 1000) + 3600,
            };

            // Update relay status
            await adapter.updateRelayStatus(relayUrl, status);

            // Get relay status
            const retrieved = await adapter.getRelayStatus(relayUrl);
            expect(retrieved).toBeDefined();
            expect(retrieved?.lastConnectedAt).toBe(status.lastConnectedAt);
            expect(retrieved?.dontConnectBefore).toBe(status.dontConnectBefore);
        });
    });
});
