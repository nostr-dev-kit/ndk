import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDK } from "../ndk/index.js";
import { NDKRelay } from "./index.js";
import { fetchRelayInformation, type NDKRelayInformation } from "./nip11.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("NIP-11", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("fetchRelayInformation", () => {
        it("converts wss:// to https:// in URL", async () => {
            const mockInfo: NDKRelayInformation = {
                name: "Test Relay",
                description: "A test relay",
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockInfo,
            });

            await fetchRelayInformation("wss://relay.example.com");

            expect(global.fetch).toHaveBeenCalledWith(
                "https://relay.example.com",
                expect.objectContaining({
                    headers: {
                        Accept: "application/nostr+json",
                    },
                }),
            );
        });

        it("converts ws:// to http:// in URL", async () => {
            const mockInfo: NDKRelayInformation = {
                name: "Test Relay",
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockInfo,
            });

            await fetchRelayInformation("ws://relay.example.com");

            expect(global.fetch).toHaveBeenCalledWith(
                "http://relay.example.com",
                expect.objectContaining({
                    headers: {
                        Accept: "application/nostr+json",
                    },
                }),
            );
        });

        it("returns relay information", async () => {
            const mockInfo: NDKRelayInformation = {
                name: "Test Relay",
                description: "A test relay",
                supported_nips: [1, 11, 40],
                software: "test-relay",
                version: "1.0.0",
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockInfo,
            });

            const info = await fetchRelayInformation("wss://relay.example.com");

            expect(info).toEqual(mockInfo);
        });

        it("throws error on failed fetch", async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found",
            });

            await expect(fetchRelayInformation("wss://relay.example.com")).rejects.toThrow(
                "Failed to fetch relay information: 404 Not Found",
            );
        });
    });

    describe("NDKRelay.fetchInfo", () => {
        it("fetches and caches relay information", async () => {
            const ndk = new NDK();
            const relay = new NDKRelay("wss://relay.example.com", undefined, ndk);

            const mockInfo: NDKRelayInformation = {
                name: "Test Relay",
                description: "A test relay",
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockInfo,
            });

            const info = await relay.fetchInfo();

            expect(info).toEqual(mockInfo);
            expect(relay.info).toEqual(mockInfo);
        });

        it("returns cached information on subsequent calls", async () => {
            const ndk = new NDK();
            const relay = new NDKRelay("wss://relay.example.com", undefined, ndk);

            const mockInfo: NDKRelayInformation = {
                name: "Test Relay",
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockInfo,
            });

            // First call
            await relay.fetchInfo();

            // Second call - should use cache
            const info = await relay.fetchInfo();

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(info).toEqual(mockInfo);
        });

        it("bypasses cache when force=true", async () => {
            const ndk = new NDK();
            const relay = new NDKRelay("wss://relay.example.com", undefined, ndk);

            const mockInfo1: NDKRelayInformation = {
                name: "Test Relay 1",
            };

            const mockInfo2: NDKRelayInformation = {
                name: "Test Relay 2",
            };

            (global.fetch as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockInfo1,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockInfo2,
                });

            // First call
            const info1 = await relay.fetchInfo();
            expect(info1.name).toBe("Test Relay 1");

            // Second call with force=true
            const info2 = await relay.fetchInfo(true);
            expect(info2.name).toBe("Test Relay 2");

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe("NDKRelay.info getter", () => {
        it("returns undefined before fetchInfo is called", () => {
            const ndk = new NDK();
            const relay = new NDKRelay("wss://relay.example.com", undefined, ndk);

            expect(relay.info).toBeUndefined();
        });

        it("returns cached info after fetchInfo is called", async () => {
            const ndk = new NDK();
            const relay = new NDKRelay("wss://relay.example.com", undefined, ndk);

            const mockInfo: NDKRelayInformation = {
                name: "Test Relay",
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: async () => mockInfo,
            });

            await relay.fetchInfo();

            expect(relay.info).toEqual(mockInfo);
        });
    });
});
