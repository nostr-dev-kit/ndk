import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NDK } from "../ndk";
import { NDKRelayConnectivity } from "./connectivity";
import { type NDKRelay, NDKRelayStatus } from "./index";

// Mock WebSocket
class MockWebSocket {
    readyState: number;
    url: string;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((error: Error) => void) | null = null;

    constructor(url: string) {
        this.url = url;
        this.readyState = WebSocket.CONNECTING;
    }

    send(data: string) {}
    close() {
        this.readyState = WebSocket.CLOSED;
        if (this.onclose) this.onclose();
    }
}

// @ts-expect-error
global.WebSocket = MockWebSocket as any;
global.WebSocket.CONNECTING = 0;
global.WebSocket.OPEN = 1;
global.WebSocket.CLOSING = 2;
global.WebSocket.CLOSED = 3;

describe("NDKRelayConnectivity", () => {
    let mockRelay: NDKRelay;
    let mockNDK: NDK;
    let connectivity: NDKRelayConnectivity;

    beforeEach(() => {
        vi.useFakeTimers();

        mockRelay = {
            url: "wss://test.relay",
            debug: {
                extend: vi.fn(() => vi.fn()),
            },
            emit: vi.fn(),
        } as any;

        mockNDK = {
            debug: {
                extend: vi.fn(() => vi.fn()),
            },
        } as any;

        connectivity = new NDKRelayConnectivity(mockRelay, mockNDK);
    });

    afterEach(() => {
        connectivity.disconnect();
        vi.clearAllTimers();
        vi.restoreAllMocks();
    });

    describe("Sleep/Wake Detection", () => {
        it("should detect system sleep through time gaps", () => {
            const handleStaleConnectionSpy = vi.spyOn(connectivity as any, "handleStaleConnection");
            const handlePossibleWakeSpy = vi.spyOn(connectivity as any, "handlePossibleWake");

            // Start monitoring
            connectivity["setupMonitoring"]();

            // Normal 10s interval - no wake detection
            vi.advanceTimersByTime(10000);
            expect(handlePossibleWakeSpy).not.toHaveBeenCalled();

            // Simulate sleep by jumping time forward more than 15s
            connectivity["lastSleepCheck"] = Date.now() - 20000; // 20s ago
            vi.advanceTimersByTime(10000);

            expect(handlePossibleWakeSpy).toHaveBeenCalledTimes(1);
        });

        it("should reset backoff when wake is detected", () => {
            connectivity["setupMonitoring"]();

            // Set up a connected state
            connectivity["_status"] = NDKRelayStatus.CONNECTED;
            connectivity["ws"] = { readyState: WebSocket.CLOSED } as any;

            // Simulate wake detection
            connectivity["lastSleepCheck"] = Date.now() - 20000;
            vi.advanceTimersByTime(10000);

            // Should have set wasIdle flag
            expect(connectivity["wasIdle"]).toBe(true);
        });
    });

    describe("WebSocket State Monitoring", () => {
        it("should detect silently dead WebSocket connections", () => {
            const handleStaleConnectionSpy = vi.spyOn(connectivity as any, "handleStaleConnection");

            connectivity["setupMonitoring"]();
            connectivity["_status"] = NDKRelayStatus.CONNECTED;
            connectivity["ws"] = { readyState: WebSocket.CLOSED } as any;

            // Advance to trigger WebSocket state check (5s interval)
            vi.advanceTimersByTime(5000);

            expect(handleStaleConnectionSpy).toHaveBeenCalledTimes(1);
        });

        it("should not trigger for healthy connections", () => {
            const handleStaleConnectionSpy = vi.spyOn(connectivity as any, "handleStaleConnection");

            connectivity["setupMonitoring"]();
            connectivity["_status"] = NDKRelayStatus.CONNECTED;
            connectivity["ws"] = { readyState: WebSocket.OPEN } as any;

            vi.advanceTimersByTime(5000);

            expect(handleStaleConnectionSpy).not.toHaveBeenCalled();
        });

        it("should clean up monitoring on disconnect", () => {
            connectivity["setupMonitoring"]();

            const wsMonitor = connectivity["wsStateMonitor"];
            const sleepDetector = connectivity["sleepDetector"];

            expect(wsMonitor).toBeDefined();
            expect(sleepDetector).toBeDefined();

            connectivity.disconnect();

            expect(connectivity["wsStateMonitor"]).toBeUndefined();
            expect(connectivity["sleepDetector"]).toBeUndefined();
        });
    });

    describe("Idle-aware Reconnection", () => {
        it("should use aggressive backoff after idle period", () => {
            // Simulate idle period
            connectivity["lastMessageSent"] = Date.now() - 150000; // 2.5 minutes ago
            connectivity["wasIdle"] = false;

            // Trigger send to detect idle
            connectivity["_status"] = NDKRelayStatus.DISCONNECTED;
            connectivity.send("test");

            expect(connectivity["wasIdle"]).toBe(true);
        });

        it("should use different backoff delays for idle vs normal disconnections", () => {
            const handleReconnectionSpy = vi.spyOn(connectivity as any, "handleReconnection");

            // Test normal backoff
            connectivity["wasIdle"] = false;
            connectivity["handleReconnection"](0);

            // Check that standard exponential backoff is used
            // First attempt should be 1000ms (Math.min(1000 * Math.pow(2, 0), 30000))
            expect(connectivity["_connectionStats"].nextReconnectAt).toBeGreaterThan(Date.now());

            vi.clearAllTimers();

            // Test idle backoff
            connectivity["wasIdle"] = true;
            connectivity["reconnectTimeout"] = undefined;
            connectivity["handleReconnection"](0);

            // First attempt after idle should be 0ms
            const aggressiveDelays = [0, 1000, 2000, 5000, 10000, 30000];
            expect(connectivity["_connectionStats"].nextReconnectAt).toBeLessThanOrEqual(
                Date.now() + aggressiveDelays[0],
            );
        });

        it("should reset idle flag after successful connection", () => {
            connectivity["wasIdle"] = true;

            // Simulate successful connection
            connectivity["onConnect"]();

            expect(connectivity["wasIdle"]).toBe(false);
        });
    });

    describe("Stale Connection Handling", () => {
        it("should mark connection as stale and trigger reconnection", () => {
            const onDisconnectSpy = vi.spyOn(connectivity as any, "onDisconnect");

            connectivity["_status"] = NDKRelayStatus.CONNECTED;
            connectivity["handleStaleConnection"]();

            expect(connectivity["_status"]).toBe(NDKRelayStatus.DISCONNECTED);
            expect(connectivity["wasIdle"]).toBe(true);
            expect(onDisconnectSpy).toHaveBeenCalled();
        });

        it("should detect stale connection in send method", () => {
            const handleStaleConnectionSpy = vi.spyOn(connectivity as any, "handleStaleConnection");

            connectivity["_status"] = NDKRelayStatus.CONNECTED;
            connectivity["ws"] = { readyState: WebSocket.CLOSED } as any;

            connectivity.send("test message");

            expect(handleStaleConnectionSpy).toHaveBeenCalled();
        });
    });

    describe("Exponential Backoff", () => {
        it("should use correct exponential backoff capped at 30s", () => {
            connectivity["wasIdle"] = false;

            const expectedDelays = [
                1000, // 2^0 * 1000
                2000, // 2^1 * 1000
                4000, // 2^2 * 1000
                8000, // 2^3 * 1000
                16000, // 2^4 * 1000
                30000, // capped at 30000
                30000, // remains capped
            ];

            for (let attempt = 0; attempt < expectedDelays.length; attempt++) {
                connectivity["reconnectTimeout"] = undefined;
                connectivity["handleReconnection"](attempt);

                const actualDelay = connectivity["_connectionStats"].nextReconnectAt! - Date.now();
                expect(Math.abs(actualDelay - expectedDelays[attempt])).toBeLessThan(100);

                vi.clearAllTimers();
            }
        });

        it("should use aggressive delays after wake/idle", () => {
            connectivity["wasIdle"] = true;

            const aggressiveDelays = [0, 1000, 2000, 5000, 10000, 30000];

            for (let attempt = 0; attempt < aggressiveDelays.length; attempt++) {
                connectivity["reconnectTimeout"] = undefined;
                connectivity["handleReconnection"](attempt);

                const actualDelay = connectivity["_connectionStats"].nextReconnectAt! - Date.now();
                expect(Math.abs(actualDelay - aggressiveDelays[attempt])).toBeLessThan(100);

                vi.clearAllTimers();
            }
        });
    });

    describe("Keepalive Integration", () => {
        it("should start keepalive on connection", () => {
            const keepaliveStartSpy = vi.spyOn(connectivity["keepalive"]!, "start");

            connectivity["onConnect"]();

            expect(keepaliveStartSpy).toHaveBeenCalled();
        });

        it("should stop keepalive on disconnection", () => {
            connectivity["onConnect"](); // Start keepalive
            const keepaliveStopSpy = vi.spyOn(connectivity["keepalive"]!, "stop");

            connectivity["onDisconnect"]();

            expect(keepaliveStopSpy).toHaveBeenCalled();
        });

        it("should record activity on message receive", () => {
            connectivity["onConnect"](); // Initialize keepalive
            const recordActivitySpy = vi.spyOn(connectivity["keepalive"]!, "recordActivity");

            const mockEvent = new MessageEvent("message", {
                data: '["NOTICE", "test"]',
            });

            connectivity["onMessage"](mockEvent);

            expect(recordActivitySpy).toHaveBeenCalled();
        });
    });

    describe("resetReconnectionState", () => {
        it("should reset state for system-wide events", () => {
            connectivity["wasIdle"] = false;
            connectivity["reconnectTimeout"] = setTimeout(() => {}, 1000) as any;

            connectivity.resetReconnectionState();

            expect(connectivity["wasIdle"]).toBe(true);
            expect(connectivity["reconnectTimeout"]).toBeUndefined();
        });
    });
});
