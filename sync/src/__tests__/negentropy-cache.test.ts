/**
 * Test that sync package respects cached negentropy status
 * and doesn't retry relays known not to support it
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDKSync } from "../ndk-sync-class.js";

// Define inline to avoid import issues in tests
interface NDKCacheRelayInfo {
    lastConnectedAt?: number;
    dontConnectBefore?: number;
    consecutiveFailures?: number;
    lastFailureAt?: number;
    nip11?: {
        data: any;
        fetchedAt: number;
    };
    metadata?: Record<string, Record<string, unknown>>;
}

describe("Negentropy Cache Behavior", () => {
    let sync: NDKSync;
    let mockCache: {
        getRelayStatus: ReturnType<typeof vi.fn>;
        updateRelayStatus: ReturnType<typeof vi.fn>;
    };
    let relayStatusStore: Map<string, NDKCacheRelayInfo>;

    beforeEach(() => {
        relayStatusStore = new Map();

        mockCache = {
            getRelayStatus: vi.fn((url: string) => {
                return Promise.resolve(relayStatusStore.get(url));
            }),
            updateRelayStatus: vi.fn((url: string, info: NDKCacheRelayInfo) => {
                const existing = relayStatusStore.get(url);
                const merged: NDKCacheRelayInfo = {
                    ...existing,
                    ...info,
                    metadata: {
                        ...existing?.metadata,
                        ...info.metadata,
                    },
                };
                // Remove undefined namespace keys
                if (merged.metadata) {
                    for (const [key, value] of Object.entries(merged.metadata)) {
                        if (value === undefined) {
                            delete merged.metadata[key];
                        }
                    }
                }
                relayStatusStore.set(url, merged);
                return Promise.resolve();
            }),
        };

        const mockNdk = {
            cacheAdapter: mockCache,
        } as any;

        sync = new NDKSync(mockNdk);
    });

    it("should return false from cache when relay doesn't support negentropy", async () => {
        const relayUrl = "wss://relay.example.com";
        const mockRelay = { url: relayUrl } as any;

        // Pre-cache that this relay doesn't support negentropy
        await mockCache.updateRelayStatus(relayUrl, {
            metadata: {
                sync: {
                    supportsNegentropy: false,
                    lastChecked: Date.now(),
                    lastError: "bad msg",
                },
            },
        });

        // Should return false immediately from cache without probing
        const supports = await sync.checkRelaySupport(mockRelay);
        expect(supports).toBe(false);

        // Verify getRelayStatus was called to check cache
        expect(mockCache.getRelayStatus).toHaveBeenCalledWith(relayUrl);
    });

    it("should return true from cache when relay supports negentropy", async () => {
        const relayUrl = "wss://relay.example2.com";
        const mockRelay = { url: relayUrl } as any;

        // Pre-cache that this relay DOES support negentropy
        await mockCache.updateRelayStatus(relayUrl, {
            metadata: {
                sync: {
                    supportsNegentropy: true,
                    lastChecked: Date.now(),
                },
            },
        });

        // Should return true from cache
        const supports = await sync.checkRelaySupport(mockRelay);
        expect(supports).toBe(true);
    });

    it("should respect cache within TTL window", async () => {
        const relayUrl = "wss://relay.example3.com";
        const mockRelay = { url: relayUrl } as any;

        // Cache recent data (within 1 hour)
        const recentTime = Date.now() - 1000; // 1 second ago
        await mockCache.updateRelayStatus(relayUrl, {
            metadata: {
                sync: {
                    supportsNegentropy: false,
                    lastChecked: recentTime,
                },
            },
        });

        // Clear call counts
        mockCache.getRelayStatus.mockClear();
        mockCache.updateRelayStatus.mockClear();

        // Should use cache
        const supports = await sync.checkRelaySupport(mockRelay);
        expect(supports).toBe(false);

        // Should have read from cache
        expect(mockCache.getRelayStatus).toHaveBeenCalled();

        // Should NOT have updated cache (used existing value)
        expect(mockCache.updateRelayStatus).not.toHaveBeenCalled();
    });

    it("should persist 'no support' status across multiple checks", async () => {
        const relayUrl = "wss://relay.example4.com";
        const mockRelay = { url: relayUrl } as any;

        // Cache that relay doesn't support negentropy
        await mockCache.updateRelayStatus(relayUrl, {
            metadata: {
                sync: {
                    supportsNegentropy: false,
                    lastChecked: Date.now(),
                },
            },
        });

        // Multiple checks should all return false from cache
        const check1 = await sync.checkRelaySupport(mockRelay);
        const check2 = await sync.checkRelaySupport(mockRelay);
        const check3 = await sync.checkRelaySupport(mockRelay);

        expect(check1).toBe(false);
        expect(check2).toBe(false);
        expect(check3).toBe(false);
    });

    it("should get relay capability from persistent cache", async () => {
        const relayUrl = "wss://relay.example5.com";

        // Cache capability
        await mockCache.updateRelayStatus(relayUrl, {
            metadata: {
                sync: {
                    supportsNegentropy: false,
                    lastChecked: Date.now(),
                    lastError: "connection failed",
                },
            },
        });

        // Get capability
        const capability = await sync.getRelayCapability(relayUrl);

        expect(capability).toBeDefined();
        expect(capability?.supportsNegentropy).toBe(false);
        expect(capability?.lastError).toBe("connection failed");
    });

    it("should clear cache for specific relay", async () => {
        const relayUrl = "wss://relay.example6.com";

        // Cache that relay doesn't support negentropy, plus add other metadata
        await mockCache.updateRelayStatus(relayUrl, {
            metadata: {
                sync: {
                    supportsNegentropy: false,
                    lastChecked: Date.now(),
                },
                auth: {
                    token: "test-token",
                },
            },
        });

        // Verify it's cached
        let status = await mockCache.getRelayStatus(relayUrl);
        expect(status?.metadata?.sync).toBeDefined();
        expect(status?.metadata?.auth).toBeDefined();

        // Clear the sync cache for this relay
        await sync.clearCapabilityCache(relayUrl);

        // Verify sync metadata is gone but auth remains
        status = await mockCache.getRelayStatus(relayUrl);
        expect(status?.metadata?.sync).toBeUndefined();
        expect(status?.metadata?.auth).toBeDefined();
    });
});
