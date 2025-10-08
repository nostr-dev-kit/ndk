import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NDKRelayKeepalive, probeRelayConnection } from "./keepalive";

describe("NDKRelayKeepalive", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    describe("silence detection", () => {
        it("should trigger callback after timeout period of silence", () => {
            const onSilenceDetected = vi.fn();
            const keepalive = new NDKRelayKeepalive(30000, onSilenceDetected);

            keepalive.start();

            // No callback before timeout
            vi.advanceTimersByTime(29999);
            expect(onSilenceDetected).not.toHaveBeenCalled();

            // Callback triggered at timeout
            vi.advanceTimersByTime(1);
            expect(onSilenceDetected).toHaveBeenCalledTimes(1);
        });

        it("should reset timer when activity is recorded", () => {
            const onSilenceDetected = vi.fn();
            const keepalive = new NDKRelayKeepalive(30000, onSilenceDetected);

            keepalive.start();

            // Advance halfway
            vi.advanceTimersByTime(15000);

            // Record activity
            keepalive.recordActivity();

            // Advance to what would have been timeout
            vi.advanceTimersByTime(15000);
            expect(onSilenceDetected).not.toHaveBeenCalled();

            // Should trigger 30s after the activity
            vi.advanceTimersByTime(15000);
            expect(onSilenceDetected).toHaveBeenCalledTimes(1);
        });

        it("should not trigger when stopped", () => {
            const onSilenceDetected = vi.fn();
            const keepalive = new NDKRelayKeepalive(30000, onSilenceDetected);

            keepalive.start();
            vi.advanceTimersByTime(15000);

            keepalive.stop();

            vi.advanceTimersByTime(30000);
            expect(onSilenceDetected).not.toHaveBeenCalled();
        });

        it("should handle multiple start/stop cycles", () => {
            const onSilenceDetected = vi.fn();
            const keepalive = new NDKRelayKeepalive(5000, onSilenceDetected);

            // First cycle
            keepalive.start();
            vi.advanceTimersByTime(5000);
            expect(onSilenceDetected).toHaveBeenCalledTimes(1);

            keepalive.stop();

            // Second cycle
            keepalive.start();
            vi.advanceTimersByTime(5000);
            expect(onSilenceDetected).toHaveBeenCalledTimes(2);
        });

        it("should handle rapid activity correctly", () => {
            const onSilenceDetected = vi.fn();
            const keepalive = new NDKRelayKeepalive(10000, onSilenceDetected);

            keepalive.start();

            // Simulate rapid activity
            for (let i = 0; i < 5; i++) {
                vi.advanceTimersByTime(2000);
                keepalive.recordActivity();
            }

            // Total 10 seconds elapsed, but activity kept resetting
            expect(onSilenceDetected).not.toHaveBeenCalled();

            // Now let it timeout
            vi.advanceTimersByTime(10000);
            expect(onSilenceDetected).toHaveBeenCalledTimes(1);
        });
    });
});

describe("probeRelayConnection", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("should resolve true when relay responds with EOSE", async () => {
        const mockRelay = {
            send: vi.fn(),
            once: vi.fn((event, handler) => {
                // Simulate immediate EOSE response
                setTimeout(() => handler(), 100);
            }),
        };

        const promise = probeRelayConnection(mockRelay);
        vi.advanceTimersByTime(100);

        const result = await promise;
        expect(result).toBe(true);
        expect(mockRelay.send).toHaveBeenCalledTimes(2); // REQ and CLOSE
        expect(mockRelay.send.mock.calls[0][0][0]).toBe("REQ");
        expect(mockRelay.send.mock.calls[1][0][0]).toBe("CLOSE");
    });

    it("should resolve false when relay doesn't respond within timeout", async () => {
        const mockRelay = {
            send: vi.fn(),
            once: vi.fn(), // Never calls the handler
        };

        const promise = probeRelayConnection(mockRelay);
        vi.advanceTimersByTime(5000);

        const result = await promise;
        expect(result).toBe(false);
        expect(mockRelay.send).toHaveBeenCalledTimes(2); // REQ and CLOSE
    });

    it("should send minimal REQ with non-existent kind", async () => {
        const mockRelay = {
            send: vi.fn(),
            once: vi.fn(),
        };

        probeRelayConnection(mockRelay);

        const reqCall = mockRelay.send.mock.calls[0][0];
        expect(reqCall[0]).toBe("REQ");
        expect(reqCall[1]).toMatch(/^probe-/);
        expect(reqCall[2]).toEqual({ kinds: [99999], limit: 0 });
    });

    it("should handle multiple concurrent probes", async () => {
        const mockRelay = {
            send: vi.fn(),
            once: vi.fn((event, handler) => {
                setTimeout(() => handler(), 100);
            }),
        };

        const promises = [
            probeRelayConnection(mockRelay),
            probeRelayConnection(mockRelay),
            probeRelayConnection(mockRelay),
        ];

        vi.advanceTimersByTime(100);

        const results = await Promise.all(promises);
        expect(results).toEqual([true, true, true]);
        expect(mockRelay.send).toHaveBeenCalledTimes(6); // 3 REQs + 3 CLOSEs
    });

    it("should cleanup properly on timeout", async () => {
        const mockRelay = {
            send: vi.fn(),
            once: vi.fn(),
        };

        const promise = probeRelayConnection(mockRelay);
        vi.advanceTimersByTime(5000);

        await promise;

        // Should have sent CLOSE even on timeout
        const closeCall = mockRelay.send.mock.calls[1][0];
        expect(closeCall[0]).toBe("CLOSE");
    });
});
