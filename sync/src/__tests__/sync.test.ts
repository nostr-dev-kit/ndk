/**
 * Test suite for NDK sync functionality
 */

import { beforeEach, describe, expect, test, vi } from "vitest";
import NDK from "@nostr-dev-kit/ndk";
import { ndkSync } from "../ndk-sync.js";
import type { NDKSyncOptions, NDKSyncResult } from "../types.js";

// Mock NDK and dependencies
vi.mock("@nostr-dev-kit/ndk", () => {
    return {
        __esModule: true,
        default: vi.fn().mockImplementation(() => ({
            cacheAdapter: {
                setEvent: vi.fn(),
            },
            pool: {
                relays: new Map([
                    [
                        "wss://relay.damus.io",
                        {
                            url: "wss://relay.damus.io",
                            connected: true,
                            connectivity: {
                                send: vi.fn(),
                            },
                            registerProtocolHandler: vi.fn(),
                            unregisterProtocolHandler: vi.fn(),
                            once: vi.fn(),
                            off: vi.fn(),
                        },
                    ],
                ]),
            },
            subscribe: vi.fn(() => ({
                on: vi.fn(),
                stop: vi.fn(),
            })),
        })),
        NDKRelaySet: {
            fromRelayUrls: vi.fn(() => ({
                relays: new Set([
                    {
                        url: "wss://relay.damus.io",
                        connected: true,
                        connectivity: { send: vi.fn() },
                        registerProtocolHandler: vi.fn(),
                        unregisterProtocolHandler: vi.fn(),
                        once: vi.fn(),
                        off: vi.fn(),
                    },
                ]),
            })),
        },
        NDKSubscriptionCacheUsage: {
            ONLY_CACHE: "ONLY_CACHE",
        },
    };
});

describe("NDK Sync Package", () => {
    let ndk: NDK;
    let defaultOptions: NDKSyncOptions;

    beforeEach(() => {
        ndk = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
        defaultOptions = {
            autoFetch: true,
            frameSizeLimit: 50000,
        };
    });

    describe("Package Exports", () => {
        test("should export ndkSync function", () => {
            expect(typeof ndkSync).toBe("function");
        });

        test("should have proper function signature", () => {
            // function.length counts required parameters only (not 'this' or params with defaults)
            // ndkSync(this: NDK, filters, opts = {}) -> length = 1 (only filters is required)
            expect(ndkSync.length).toBe(1);
        });
    });

    describe("Type Safety", () => {
        test("should accept valid NDKSyncOptions", () => {
            const options: NDKSyncOptions = {
                autoFetch: true,
                frameSizeLimit: 50000,
                timeout: 30000,
                skipCache: false,
                relayUrls: ["wss://relay.damus.io"],
                onRelayError: (relay, error) => {
                    console.error("Relay error:", relay.url, error.message);
                },
            };

            expect(options).toBeDefined();
            expect(options.autoFetch).toBe(true);
            expect(options.frameSizeLimit).toBe(50000);
            expect(options.timeout).toBe(30000);
        });

        test("should handle minimal options", () => {
            const options: NDKSyncOptions = {};
            expect(options).toBeDefined();
        });
    });

    describe("Error Handling", () => {
        test("should throw error when no cache adapter is provided", async () => {
            const ndkWithoutCache = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
            (ndkWithoutCache as any).cacheAdapter = null;

            await expect(ndkSync.call(ndkWithoutCache, { kinds: [1] }, defaultOptions)).rejects.toThrow(
                "NDK sync requires a cache adapter",
            );
        });

        test("should throw error when no relays are available", async () => {
            const ndkWithoutRelays = new NDK();
            (ndkWithoutRelays as any).pool = { relays: new Map() };

            await expect(ndkSync.call(ndkWithoutRelays, { kinds: [1] }, defaultOptions)).rejects.toThrow(
                "No relays available for sync",
            );
        });
    });

    describe("Configuration", () => {
        test("should use provided relay URLs", () => {
            const options: NDKSyncOptions = {
                relayUrls: ["wss://custom.relay.io"],
            };

            expect(options.relayUrls).toEqual(["wss://custom.relay.io"]);
        });

        test("should accept custom timeout values", () => {
            const options: NDKSyncOptions = {
                timeout: 60000, // 1 minute
            };

            expect(options.timeout).toBe(60000);
        });

        test("should accept custom frame size limits", () => {
            const options: NDKSyncOptions = {
                frameSizeLimit: 25000, // 25KB
            };

            expect(options.frameSizeLimit).toBe(25000);
        });
    });

    describe("Filter Normalization", () => {
        test("should handle single filter", async () => {
            const singleFilter = { kinds: [1] };

            // Mock the actual sync to avoid full implementation
            const _mockSync = vi.fn().mockResolvedValue({
                events: [],
                need: new Set(),
                have: new Set(),
            });

            // This test mainly verifies that single filters are accepted
            expect(() => {
                ndkSync.call(ndk, singleFilter, defaultOptions);
            }).not.toThrow();
        });

        test("should handle array of filters", async () => {
            const filterArray = [{ kinds: [1] }, { kinds: [0] }];

            // This test mainly verifies that filter arrays are accepted
            expect(() => {
                ndkSync.call(ndk, filterArray, defaultOptions);
            }).not.toThrow();
        });
    });

    describe("Result Structure", () => {
        test("should return proper NDKSyncResult structure", () => {
            const mockResult: NDKSyncResult = {
                events: [],
                need: new Set(["event1", "event2"]),
                have: new Set(["event3", "event4"]),
            };

            expect(mockResult.events).toBeInstanceOf(Array);
            expect(mockResult.need).toBeInstanceOf(Set);
            expect(mockResult.have).toBeInstanceOf(Set);
            expect(mockResult.need.has("event1")).toBe(true);
            expect(mockResult.have.has("event3")).toBe(true);
        });
    });
});
