import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { NDKRelayKeepalive, probeRelayConnection } from "./keepalive";

describe("NDKRelayKeepalive", () => {
    describe("basic functionality", () => {
        it("should create instance with correct timeout", () => {
            const onSilenceDetected = mock(() => {});
            const keepalive = new NDKRelayKeepalive(5000, onSilenceDetected);

            expect(keepalive).toBeDefined();
            expect(keepalive["timeout"]).toBe(5000);
        });

        it("should start and stop without errors", () => {
            const onSilenceDetected = mock(() => {});
            const keepalive = new NDKRelayKeepalive(5000, onSilenceDetected);

            keepalive.start();
            expect(keepalive["isRunning"]).toBe(true);

            keepalive.stop();
            expect(keepalive["isRunning"]).toBe(false);
        });

        it("should record activity", () => {
            const onSilenceDetected = mock(() => {});
            const keepalive = new NDKRelayKeepalive(5000, onSilenceDetected);

            const beforeActivity = keepalive["lastActivity"];
            keepalive.recordActivity();
            const afterActivity = keepalive["lastActivity"];

            expect(afterActivity).toBeGreaterThanOrEqual(beforeActivity);
        });
    });
});

describe("probeRelayConnection", () => {
    it("should send correct REQ format", () => {
        const mockRelay = {
            send: mock(() => {}),
            once: mock(() => {}),
        };

        probeRelayConnection(mockRelay);

        // Check that REQ was sent
        expect(mockRelay.send).toHaveBeenCalled();
        const reqCall = mockRelay.send.mock.calls[0][0];
        expect(reqCall[0]).toBe("REQ");
        expect(reqCall[1]).toMatch(/^probe-/);
        expect(reqCall[2]).toEqual({ kinds: [99999], limit: 0 });
    });

    it("should handle successful response", async () => {
        const mockRelay = {
            send: mock(() => {}),
            once: mock((event, handler) => {
                // Simulate immediate response
                setTimeout(() => handler(), 0);
            }),
        };

        const result = await probeRelayConnection(mockRelay);

        expect(result).toBe(true);
        expect(mockRelay.send).toHaveBeenCalledTimes(2); // REQ and CLOSE
    });

    it("should handle timeout", async () => {
        const mockRelay = {
            send: mock(() => {}),
            once: mock(() => {}), // Never calls handler
        };

        // This will timeout after 5 seconds
        const promise = probeRelayConnection(mockRelay);

        // Wait for timeout
        await new Promise((resolve) => setTimeout(resolve, 5100));

        const result = await promise;
        expect(result).toBe(false);
        expect(mockRelay.send).toHaveBeenCalledTimes(2); // REQ and CLOSE
    }, 10000); // Increase test timeout
});
