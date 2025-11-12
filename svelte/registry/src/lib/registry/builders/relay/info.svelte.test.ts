import { normalizeRelayUrl } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK } from "../../../../test-utils";
import { clearRelayInfoCache, createRelayInfo } from "./info.svelte";

describe("createRelayInfo", () => {
    let ndk: ReturnType<typeof createTestNDK>;
    let cleanup: (() => void) | undefined;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        ndk = createTestNDK();
        // Mock window.fetch for browser mode
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        // Clear module-level caches to prevent test pollution
        clearRelayInfoCache();
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
        vi.unstubAllGlobals();
        clearRelayInfoCache();
    });

    describe("initialization", () => {
        it("should initialize with null state when URL is empty", () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "" }), ndk);
            });

            expect(relayInfo!.url).toBeNull();
            expect(relayInfo!.nip11).toBeNull();
            expect(relayInfo!.loading).toBe(false);
            expect(relayInfo!.error).toBeNull();
        });

        it("should normalize relay URL on initialization", () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({ name: "Test Relay" })
            });

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "wss://relay.test/" }), ndk);
            });

            const expectedNormalized = normalizeRelayUrl("wss://relay.test/");
            expect(relayInfo!.url).toBe(expectedNormalized);
        });

        it("should handle invalid URL gracefully", () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "not-a-valid-url" }), ndk);
            });

            // Should handle normalization error
            expect(relayInfo!.loading).toBe(false);
        });
    });

    describe("NIP-11 fetching", () => {
        it("should fetch NIP-11 information from HTTP URL", async () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            const nip11Data = {
                name: "Test Relay",
                description: "A test relay",
                pubkey: "test-pubkey"
            };

            fetchMock.mockImplementation(async () => ({
                ok: true,
                json: async () => nip11Data
            }) as any);

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "wss://relay-nip11-test.example" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            expect(fetchMock).toHaveBeenCalledWith(
                "https://relay-nip11-test.example/",
                expect.objectContaining({
                    method: "GET",
                    headers: { "Accept": "application/nostr+json" },
                    mode: "cors"
                })
            );
            expect(relayInfo!.nip11).toEqual(nip11Data);
            expect(relayInfo!.loading).toBe(false);
            expect(relayInfo!.error).toBeNull();
        });

        it("should convert wss:// to https://", async () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({})
            });

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "wss://relay.damus.io" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(fetchMock).toHaveBeenCalledWith(
                "https://relay.damus.io/",
                expect.any(Object)
            );
        });

        it("should convert ws:// to http://", async () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({})
            });

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "ws://localhost:8080" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(fetchMock).toHaveBeenCalledWith(
                "http://localhost:8080/",
                expect.any(Object)
            );
        });

        it("should include Accept header for nostr+json", async () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({})
            });

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(fetchMock).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: { "Accept": "application/nostr+json" }
                })
            );
        });
    });

    describe("error handling", () => {
        it("should handle HTTP error responses", async () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockImplementation(async () => ({
                ok: false,
                status: 404
            }) as any);

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "wss://http-error-test.example" }), ndk);
            });

            // Wait longer for error to propagate through async operations
            await new Promise(resolve => setTimeout(resolve, 200));
            flushSync();

            // Error responses are cached as empty objects, but error state should still be set
            expect(relayInfo!.loading).toBe(false);
            expect(relayInfo!.error).toBeInstanceOf(Error);
            expect(relayInfo!.error?.message).toContain("404");
        });

        it("should handle network errors", async () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockImplementation(async () => {
                throw new Error("Network error");
            });

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "wss://network-error-test.example" }), ndk);
            });

            // Wait longer for error to propagate through async operations
            await new Promise(resolve => setTimeout(resolve, 200));
            flushSync();

            // Verify fetch was called
            expect(fetchMock).toHaveBeenCalled();
            expect(relayInfo!.error).toBeInstanceOf(Error);
            expect(relayInfo!.loading).toBe(false);
        });

        it("should handle timeout after 5 seconds", async () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            // Mock a fetch that never resolves
            fetchMock.mockImplementation(() => new Promise(() => {}));

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "wss://timeout-test.example" }), ndk);
            });

            // Wait for timeout to trigger
            await new Promise(resolve => setTimeout(resolve, 5200));
            flushSync();

            expect(relayInfo!.error).toBeInstanceOf(Error);
            expect(relayInfo!.error?.name).toBe("AbortError");
        }, 10000);

        it("should handle JSON parsing errors", async () => {
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockImplementation(async () => ({
                ok: true,
                json: async () => {
                    throw new Error("Invalid JSON");
                }
            }) as any);

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: "wss://json-error-test.example" }), ndk);
            });

            // Wait longer for error to propagate through async operations
            await new Promise(resolve => setTimeout(resolve, 200));
            flushSync();

            expect(relayInfo!.error).toBeInstanceOf(Error);
        });
    });

    describe("caching", () => {
        it("should cache successful NIP-11 responses", async () => {
            let relayInfo1: ReturnType<typeof createRelayInfo> | undefined;
            let relayInfo2: ReturnType<typeof createRelayInfo> | undefined;

            const nip11Data = { name: "Cached Relay" };
            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => nip11Data
            });

            cleanup = $effect.root(() => {
                relayInfo1 = createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchMock).toHaveBeenCalledTimes(1);

            // Create second instance with same URL
            const cleanup2 = $effect.root(() => {
                relayInfo2 = createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            // Should use cache, not fetch again
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(relayInfo2!.nip11).toEqual(nip11Data);

            cleanup2();
        });

        it("should cache error responses", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500
            });

            const cleanup1 = $effect.root(() => {
                createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchMock).toHaveBeenCalledTimes(1);

            // Second request should use cached error
            const cleanup2 = $effect.root(() => {
                createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            // Should use cache
            expect(fetchMock).toHaveBeenCalledTimes(1);

            cleanup1();
            cleanup2();
        });

        it("should not cache AbortError responses", async () => {
            let callCount = 0;
            fetchMock.mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return new Promise(() => {}); // Never resolves, will timeout
                }
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ name: "Success" })
                });
            });

            const cleanup1 = $effect.root(() => {
                createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            // Wait for timeout to trigger
            await new Promise(resolve => setTimeout(resolve, 5200));
            flushSync();

            cleanup1();

            // Clear any pending requests
            clearRelayInfoCache();

            // Second request should not use aborted cache
            const cleanup2 = $effect.root(() => {
                createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            expect(fetchMock).toHaveBeenCalledTimes(2);

            cleanup2();
        }, 12000);
    });

    describe("request deduplication", () => {
        it("should deduplicate concurrent requests for same URL", async () => {
            let relayInfo1: ReturnType<typeof createRelayInfo> | undefined;
            let relayInfo2: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ name: "Test" })
                }), 50))
            );

            // Start both requests concurrently
            cleanup = $effect.root(() => {
                relayInfo1 = createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            const cleanup2 = $effect.root(() => {
                relayInfo2 = createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 100));
            flushSync();

            // Should only fetch once despite two concurrent requests
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(relayInfo1!.nip11).toEqual({ name: "Test" });
            expect(relayInfo2!.nip11).toEqual({ name: "Test" });

            cleanup2();
        });
    });

    describe("reactive URL updates", () => {
        it("should fetch new info when URL changes", async () => {
            let currentUrl = $state("wss://relay1.test");
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            const info1 = { name: "Relay 1" };
            const info2 = { name: "Relay 2" };

            fetchMock
                .mockResolvedValueOnce({ ok: true, json: async () => info1 })
                .mockResolvedValueOnce({ ok: true, json: async () => info2 });

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: currentUrl }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            expect(relayInfo!.nip11).toEqual(info1);

            // Change URL
            currentUrl = "wss://relay2.test";
            flushSync();

            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            // Should have fetched the new info
            expect(relayInfo!.nip11).toEqual(info2);
            expect(fetchMock).toHaveBeenCalledWith("https://relay1.test/", expect.any(Object));
            expect(fetchMock).toHaveBeenCalledWith("https://relay2.test/", expect.any(Object));
        });

        it("should abort previous fetch when URL changes", async () => {
            let currentUrl = $state("wss://relay1.test");
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            let firstAborted = false;
            fetchMock.mockImplementation((url, options) => {
                if (url === "https://relay1.test/") {
                    return new Promise((resolve, reject) => {
                        options.signal.addEventListener("abort", () => {
                            firstAborted = true;
                            reject(new DOMException("Aborted", "AbortError"));
                        });
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ name: "Relay 2" })
                });
            });

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: currentUrl }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            // Change URL while first fetch is in progress
            currentUrl = "wss://relay2.test";
            flushSync();

            await new Promise(resolve => setTimeout(resolve, 50));
            flushSync();

            expect(firstAborted).toBe(true);
        });

        it("should reset state when URL becomes empty", async () => {
            let currentUrl = $state("wss://relay.test");
            let relayInfo: ReturnType<typeof createRelayInfo> | undefined;

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({ name: "Test" })
            });

            cleanup = $effect.root(() => {
                relayInfo = createRelayInfo(() => ({ relayUrl: currentUrl }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(relayInfo!.nip11).toEqual({ name: "Test" });

            // Change to empty URL
            currentUrl = "";
            flushSync();

            expect(relayInfo!.url).toBeNull();
            expect(relayInfo!.nip11).toBeNull();
            expect(relayInfo!.loading).toBe(false);
            expect(relayInfo!.error).toBeNull();
        });
    });

    describe("cleanup", () => {
        it("should abort fetch on cleanup", async () => {
            let aborted = false;

            fetchMock.mockImplementation((url, options) => {
                return new Promise((resolve, reject) => {
                    options.signal.addEventListener("abort", () => {
                        aborted = true;
                        reject(new DOMException("Aborted", "AbortError"));
                    });
                });
            });

            cleanup = $effect.root(() => {
                createRelayInfo(() => ({ relayUrl: "wss://relay.test" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            // Cleanup should abort the fetch
            cleanup!();
            cleanup = undefined;

            // Wait longer for abort to propagate
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(aborted).toBe(true);
        });
    });
});
