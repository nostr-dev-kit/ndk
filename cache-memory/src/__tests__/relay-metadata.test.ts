import { describe, expect, it } from "vitest";
import NDKMemoryCacheAdapter from "../index";

describe("Relay Metadata Caching", () => {
    it("should merge metadata on update", async () => {
        const cache = new NDKMemoryCacheAdapter();

        // Initial update with sync metadata
        cache.updateRelayStatus("wss://relay.example.com", {
            metadata: {
                sync: {
                    supportsNegentropy: false,
                    lastChecked: Date.now(),
                },
            },
        });

        // Second update with different package metadata
        cache.updateRelayStatus("wss://relay.example.com", {
            metadata: {
                wallet: {
                    lastZapAttempt: Date.now(),
                },
            },
        });

        // Should have both metadata
        const status = cache.getRelayStatus("wss://relay.example.com");
        expect(status?.metadata?.sync).toBeDefined();
        expect(status?.metadata?.wallet).toBeDefined();
    });

    it("should merge nested metadata within same namespace", async () => {
        const cache = new NDKMemoryCacheAdapter();

        cache.updateRelayStatus("wss://relay.example.com", {
            metadata: {
                sync: {
                    supportsNegentropy: false,
                    lastChecked: 1000,
                },
            },
        });

        cache.updateRelayStatus("wss://relay.example.com", {
            metadata: {
                sync: {
                    lastError: "Some error",
                },
            },
        });

        const status = cache.getRelayStatus("wss://relay.example.com");
        expect(status?.metadata?.sync).toEqual({
            lastError: "Some error",
        });
    });

    it("should store and retrieve NIP-11 data", async () => {
        const cache = new NDKMemoryCacheAdapter();

        const nip11Data = {
            name: "Test Relay",
            description: "A test relay",
            supported_nips: [1, 2, 77],
        };

        cache.updateRelayStatus("wss://relay.example.com", {
            nip11: {
                data: nip11Data,
                fetchedAt: Date.now(),
            },
        });

        const status = cache.getRelayStatus("wss://relay.example.com");
        expect(status?.nip11?.data).toEqual(nip11Data);
        expect(status?.nip11?.fetchedAt).toBeDefined();
    });

    it("should store connection tracking fields", async () => {
        const cache = new NDKMemoryCacheAdapter();

        const now = Date.now();
        cache.updateRelayStatus("wss://relay.example.com", {
            lastConnectedAt: now,
            consecutiveFailures: 3,
            lastFailureAt: now - 1000,
            dontConnectBefore: now + 5000,
        });

        const status = cache.getRelayStatus("wss://relay.example.com");
        expect(status?.lastConnectedAt).toBe(now);
        expect(status?.consecutiveFailures).toBe(3);
        expect(status?.lastFailureAt).toBe(now - 1000);
        expect(status?.dontConnectBefore).toBe(now + 5000);
    });

    it("should update existing fields while preserving metadata", async () => {
        const cache = new NDKMemoryCacheAdapter();

        // Initial state
        cache.updateRelayStatus("wss://relay.example.com", {
            lastConnectedAt: 1000,
            metadata: {
                sync: {
                    supportsNegentropy: false,
                },
            },
        });

        // Update connection time
        cache.updateRelayStatus("wss://relay.example.com", {
            lastConnectedAt: 2000,
        });

        const status = cache.getRelayStatus("wss://relay.example.com");
        expect(status?.lastConnectedAt).toBe(2000);
        expect(status?.metadata?.sync).toBeDefined();
    });
});
