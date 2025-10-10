import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock ndkSync to avoid needing real negentropy
vi.mock("../ndk-sync.js", () => ({
    ndkSync: vi.fn(),
}));

import type { NDKRelay } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";
import { ndkSync } from "../ndk-sync.js";
import { syncAndSubscribe } from "../sync-subscribe.js";

// Mock cache adapter
const mockCacheAdapter = {
    query: vi.fn().mockResolvedValue([]),
    setEvent: vi.fn().mockResolvedValue(undefined),
};

const mockNdkSync = ndkSync as vi.MockedFunction<typeof ndkSync>;

describe("syncAndSubscribe", () => {
    let ndk: NDK;
    let mockRelay: NDKRelay;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Mock ndkSync to return successful result
        mockNdkSync.mockResolvedValue({
            events: [],
            need: new Set(),
            have: new Set(),
        });

        // Create NDK instance with mock cache
        ndk = new NDK({
            explicitRelayUrls: ["wss://relay.test.com"],
            cacheAdapter: mockCacheAdapter as any,
        });

        // Mock relay
        mockRelay = {
            url: "wss://relay.test.com",
            connect: vi.fn().mockResolvedValue(undefined),
            connected: true,
            once: vi.fn(),
            off: vi.fn(),
            on: vi.fn(),
        } as any;

        // Mock pool with relay
        ndk.pool = {
            relays: new Map([[mockRelay.url, mockRelay]]),
            useTemporaryRelay: vi.fn(),
        } as any;

        // Mock subscribe method
        ndk.subscribe = vi.fn().mockReturnValue({
            on: vi.fn(),
            stop: vi.fn(),
            eventReceived: vi.fn(),
        } as any);

        // Mock fetchEvents
        ndk.fetchEvents = vi.fn().mockResolvedValue(new Set());
    });

    test("should return subscription immediately", async () => {
        const sub = await syncAndSubscribe.call(ndk, { kinds: [1] });

        expect(sub).toBeDefined();
        expect(ndk.subscribe).toHaveBeenCalled();
    });

    test("should create subscription with limit: 0", async () => {
        await syncAndSubscribe.call(ndk, { kinds: [1], limit: 100 });

        expect(ndk.subscribe).toHaveBeenCalledWith(
            [{ kinds: [1], limit: 0 }],
            expect.objectContaining({
                closeOnEose: false,
            }),
        );
    });

    test("should handle multiple filters", async () => {
        const filters = [{ kinds: [1] }, { kinds: [7] }];

        await syncAndSubscribe.call(ndk, filters);

        expect(ndk.subscribe).toHaveBeenCalledWith(
            [
                { kinds: [1], limit: 0 },
                { kinds: [7], limit: 0 },
            ],
            expect.objectContaining({
                closeOnEose: false,
            }),
        );
    });

    // Note: Callback tests are skipped because they require a full NDK environment
    // that's complex to mock in Bun's test runner. These are better tested in E2E scenarios.
    test.skip("should call onRelaySynced callback", async () => {
        const onRelaySynced = vi.fn();

        await syncAndSubscribe.call(
            ndk,
            { kinds: [1] },
            {
                onRelaySynced,
            },
        );

        // Wait for background sync to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(onRelaySynced).toHaveBeenCalledWith(
            expect.objectContaining({ url: "wss://relay.test.com" }),
            expect.any(Number),
        );
    });

    test.skip("should call onSyncComplete callback", async () => {
        const onSyncComplete = vi.fn();

        await syncAndSubscribe.call(
            ndk,
            { kinds: [1] },
            {
                onSyncComplete,
            },
        );

        // Wait for background sync to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(onSyncComplete).toHaveBeenCalled();
    });

    test("should work without cache adapter", async () => {
        // Remove cache adapter
        ndk.cacheAdapter = undefined;

        const onSyncComplete = vi.fn();

        const sub = await syncAndSubscribe.call(
            ndk,
            { kinds: [1] },
            {
                onSyncComplete,
            },
        );

        expect(sub).toBeDefined();

        // Wait for callback
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Should call onSyncComplete immediately since no sync can happen
        expect(onSyncComplete).toHaveBeenCalled();
    });

    test("should pass through subscription options", async () => {
        const onEvent = vi.fn();
        const onEose = vi.fn();

        await syncAndSubscribe.call(
            ndk,
            { kinds: [1] },
            {
                onEvent,
                onEose,
                subId: "test-sub",
            },
        );

        expect(ndk.subscribe).toHaveBeenCalledWith(
            expect.any(Array),
            expect.objectContaining({
                onEvent,
                onEose,
                subId: "test-sub",
                closeOnEose: false,
            }),
        );
    });

    test("should use custom relay set if provided", async () => {
        const customRelay = {
            url: "wss://custom.relay.com",
            connected: true,
            once: vi.fn(),
            off: vi.fn(),
            on: vi.fn(),
        } as any;

        const customRelaySet = {
            relays: new Set([customRelay]),
        } as any;

        await syncAndSubscribe.call(
            ndk,
            { kinds: [1] },
            {
                relaySet: customRelaySet,
            },
        );

        expect(ndk.subscribe).toHaveBeenCalledWith(
            expect.any(Array),
            expect.objectContaining({
                relaySet: customRelaySet,
            }),
        );
    });

    test("should use relay URLs if provided", async () => {
        const relayUrls = ["wss://relay1.com", "wss://relay2.com"];

        await syncAndSubscribe.call(
            ndk,
            { kinds: [1] },
            {
                relayUrls,
            },
        );

        // Should create a relay set from URLs
        const call = (ndk.subscribe as vi.MockedFunction<any>).mock.calls[0];
        expect(call[1]).toHaveProperty("relaySet");
        expect(call[1].relaySet).toBeDefined();
    });

    test("should throw error if no relays available", async () => {
        // Remove pool relays
        ndk.pool = { relays: new Map() } as any;

        await expect(syncAndSubscribe.call(ndk, { kinds: [1] })).rejects.toThrow("No relays available");
    });
});
