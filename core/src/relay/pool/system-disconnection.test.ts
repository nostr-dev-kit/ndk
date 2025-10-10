import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NDK } from "../../ndk";
import { type NDKRelay, NDKRelayStatus } from "../index";
import { NDKPool } from "./index";

describe("NDKPool System-wide Disconnection Detection", () => {
    let pool: NDKPool;
    let mockNDK: NDK;
    let mockRelays: NDKRelay[];

    beforeEach(() => {
        vi.useFakeTimers();

        const mockDebugFn = vi.fn();
        mockNDK = {
            debug: {
                extend: vi.fn(() => mockDebugFn),
            },
            pools: [],
            blacklistRelayUrls: new Set(),
            subManager: {},
            netDebug: undefined,
        } as any;

        // Create pool with multiple relay URLs
        const relayUrls = [
            "wss://relay1.test",
            "wss://relay2.test",
            "wss://relay3.test",
            "wss://relay4.test",
            "wss://relay5.test",
        ];

        pool = new NDKPool(relayUrls, mockNDK);

        // Get references to the created relays
        mockRelays = Array.from(pool.relays.values());

        // Mock relay properties and methods
        mockRelays.forEach((relay) => {
            // Mock the status getter
            Object.defineProperty(relay, "status", {
                get: vi.fn(() => NDKRelayStatus.CONNECTED),
                configurable: true,
            });
            relay.connectivity = {
                resetReconnectionState: vi.fn(),
                connect: vi.fn().mockResolvedValue(undefined),
            } as any;
            relay.connect = vi.fn().mockResolvedValue(undefined);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("recordDisconnection", () => {
        it("should record disconnection time for a relay", () => {
            const relay = mockRelays[0];
            const now = Date.now();

            pool["recordDisconnection"](relay);

            const disconnectionTime = pool["disconnectionTimes"].get(relay.url);
            expect(disconnectionTime).toBeDefined();
            expect(disconnectionTime).toBeGreaterThanOrEqual(now);
        });

        it("should clean up old disconnection times", () => {
            const relay1 = mockRelays[0];
            const relay2 = mockRelays[1];

            // Record old disconnection
            pool["disconnectionTimes"].set(relay1.url, Date.now() - 15000); // 15s ago

            // Record new disconnection
            pool["recordDisconnection"](relay2);

            // Old disconnection should be removed
            expect(pool["disconnectionTimes"].has(relay1.url)).toBe(false);
            expect(pool["disconnectionTimes"].has(relay2.url)).toBe(true);
        });

        it("should trigger system-wide check after recording", () => {
            const checkSpy = vi.spyOn(pool as any, "checkForSystemWideDisconnection");

            pool["recordDisconnection"](mockRelays[0]);

            expect(checkSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("checkForSystemWideDisconnection", () => {
        it("should detect when >50% of relays disconnect within 5 seconds", () => {
            const handleSystemWideReconnectionSpy = vi.spyOn(pool as any, "handleSystemWideReconnection");

            // Simulate 3 out of 5 relays disconnecting rapidly
            const now = Date.now();
            pool["disconnectionTimes"].set(mockRelays[0].url, now - 1000);
            pool["disconnectionTimes"].set(mockRelays[1].url, now - 2000);
            pool["disconnectionTimes"].set(mockRelays[2].url, now - 3000);

            pool["checkForSystemWideDisconnection"]();

            expect(handleSystemWideReconnectionSpy).toHaveBeenCalledTimes(1);
        });

        it("should not trigger for fewer disconnections", () => {
            const handleSystemWideReconnectionSpy = vi.spyOn(pool as any, "handleSystemWideReconnection");

            // Only 2 out of 5 relays (40%)
            const now = Date.now();
            pool["disconnectionTimes"].set(mockRelays[0].url, now - 1000);
            pool["disconnectionTimes"].set(mockRelays[1].url, now - 2000);

            pool["checkForSystemWideDisconnection"]();

            expect(handleSystemWideReconnectionSpy).not.toHaveBeenCalled();
        });

        it("should not trigger for disconnections spread over time", () => {
            const handleSystemWideReconnectionSpy = vi.spyOn(pool as any, "handleSystemWideReconnection");

            // 3 relays, but disconnected over 10 seconds
            const now = Date.now();
            pool["disconnectionTimes"].set(mockRelays[0].url, now - 1000);
            pool["disconnectionTimes"].set(mockRelays[1].url, now - 6000); // Outside 5s window
            pool["disconnectionTimes"].set(mockRelays[2].url, now - 8000); // Outside 5s window

            pool["checkForSystemWideDisconnection"]();

            expect(handleSystemWideReconnectionSpy).not.toHaveBeenCalled();
        });

        it("should require at least 2 relays in pool", () => {
            const handleSystemWideReconnectionSpy = vi.spyOn(pool as any, "handleSystemWideReconnection");

            // Create a pool with only 1 relay
            const singlePool = new NDKPool(["wss://single.relay"], mockNDK);
            singlePool["disconnectionTimes"].set("wss://single.relay", Date.now());

            singlePool["checkForSystemWideDisconnection"]();

            expect(handleSystemWideReconnectionSpy).not.toHaveBeenCalled();
        });
    });

    describe("handleSystemWideReconnection", () => {
        it("should reset reconnection state for all relays", () => {
            pool["handleSystemWideReconnection"]();

            mockRelays.forEach((relay) => {
                expect(relay.connectivity.resetReconnectionState).toHaveBeenCalledTimes(1);
            });
        });

        it("should reconnect disconnected relays", () => {
            // Set some relays as disconnected using Object.defineProperty
            Object.defineProperty(mockRelays[0], "status", {
                get: vi.fn(() => NDKRelayStatus.DISCONNECTED),
                configurable: true,
            });
            Object.defineProperty(mockRelays[1], "status", {
                get: vi.fn(() => NDKRelayStatus.DISCONNECTED),
                configurable: true,
            });
            Object.defineProperty(mockRelays[2], "status", {
                get: vi.fn(() => NDKRelayStatus.CONNECTED),
                configurable: true,
            });
            Object.defineProperty(mockRelays[3], "status", {
                get: vi.fn(() => NDKRelayStatus.CONNECTING),
                configurable: true,
            });
            Object.defineProperty(mockRelays[4], "status", {
                get: vi.fn(() => NDKRelayStatus.DISCONNECTED),
                configurable: true,
            });

            pool["handleSystemWideReconnection"]();

            // Should reconnect the 3 disconnected relays
            expect(mockRelays[0].connect).toHaveBeenCalledTimes(1);
            expect(mockRelays[1].connect).toHaveBeenCalledTimes(1);
            expect(mockRelays[2].connect).not.toHaveBeenCalled(); // Already connected
            expect(mockRelays[3].connect).not.toHaveBeenCalled(); // Already connecting
            expect(mockRelays[4].connect).toHaveBeenCalledTimes(1);
        });

        it("should clear disconnection times after handling", () => {
            // Add some disconnection times
            pool["disconnectionTimes"].set(mockRelays[0].url, Date.now());
            pool["disconnectionTimes"].set(mockRelays[1].url, Date.now());

            pool["handleSystemWideReconnection"]();

            expect(pool["disconnectionTimes"].size).toBe(0);
        });

        it("should prevent rapid re-triggering with debounce", () => {
            pool["handleSystemWideReconnection"]();

            // Should set systemEventDetector timeout
            expect(pool["systemEventDetector"]).toBeDefined();

            // Try to trigger again immediately
            pool["handleSystemWideReconnection"]();

            // Should still only have called reset once per relay
            mockRelays.forEach((relay) => {
                expect(relay.connectivity.resetReconnectionState).toHaveBeenCalledTimes(1);
            });

            // After timeout expires, should allow re-triggering
            vi.advanceTimersByTime(10000);
            expect(pool["systemEventDetector"]).toBeUndefined();
        });

        it("should handle relays without connectivity gracefully", () => {
            // Remove connectivity from one relay
            mockRelays[0].connectivity = undefined as any;

            expect(() => {
                pool["handleSystemWideReconnection"]();
            }).not.toThrow();

            // Should still reset others
            expect(mockRelays[1].connectivity.resetReconnectionState).toHaveBeenCalled();
            expect(mockRelays[2].connectivity.resetReconnectionState).toHaveBeenCalled();
        });
    });

    describe("Integration", () => {
        it("should handle complete system-wide disconnection flow", () => {
            const emit = vi.spyOn(pool, "emit");

            // Simulate rapid disconnections of multiple relays
            mockRelays.slice(0, 3).forEach((relay) => {
                Object.defineProperty(relay, "status", {
                    get: vi.fn(() => NDKRelayStatus.DISCONNECTED),
                    configurable: true,
                });
                // Trigger disconnect handler
                pool["recordDisconnection"](relay);
                pool.emit("relay:disconnect", relay);
            });

            // Should have triggered system-wide reconnection
            mockRelays.forEach((relay) => {
                if (relay.connectivity) {
                    expect(relay.connectivity.resetReconnectionState).toHaveBeenCalled();
                }
            });

            // Disconnected relays should be reconnecting
            expect(mockRelays[0].connect).toHaveBeenCalled();
            expect(mockRelays[1].connect).toHaveBeenCalled();
            expect(mockRelays[2].connect).toHaveBeenCalled();
        });

        it("should distinguish system events from individual relay issues", () => {
            const handleSystemWideReconnectionSpy = vi.spyOn(pool as any, "handleSystemWideReconnection");

            // Simulate gradual disconnections (not system-wide)
            pool["recordDisconnection"](mockRelays[0]);

            vi.advanceTimersByTime(6000); // Wait 6 seconds

            pool["recordDisconnection"](mockRelays[1]);

            vi.advanceTimersByTime(6000); // Wait another 6 seconds

            pool["recordDisconnection"](mockRelays[2]);

            // Should not trigger system-wide reconnection (disconnections too spread out)
            expect(handleSystemWideReconnectionSpy).not.toHaveBeenCalled();
        });
    });
});
