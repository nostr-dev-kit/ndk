import { describe, expect, it, vi } from "vitest";
import { NDKEvent } from "../events/index.js";
import { NDKSubscription } from "../subscription/index.js";
import { NDK } from "./index.js";

describe("fetchEvents EOSE timeout (issue #306)", () => {
    it("should resolve with collected events when EOSE is never received", async () => {
        vi.useFakeTimers();

        const ndk = new NDK();

        // Mock subscribe to simulate a relay that sends events but never EOSE
        const mockSub = new NDKSubscription(ndk, [{ kinds: [1] }]);
        const subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts) => {
            // Simulate receiving an event before the timeout
            setTimeout(() => {
                const event = new NDKEvent(ndk, {
                    kind: 1,
                    content: "test event",
                    pubkey: "abc123",
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [],
                });
                event.id = "event1";
                opts?.onEvent?.(event);
            }, 100);

            // Never emit EOSE - simulating a stuck relay
            return mockSub;
        });

        const promise = ndk.fetchEvents({ kinds: [1] }, { timeout: 5000 });

        // Advance past the event delivery
        await vi.advanceTimersByTimeAsync(200);

        // Advance past the timeout
        await vi.advanceTimersByTimeAsync(5000);

        const result = await promise;

        // Should have resolved with the one event that was received
        expect(result.size).toBe(1);
        const events = Array.from(result);
        expect(events[0].content).toBe("test event");

        subscribeSpy.mockRestore();
        vi.useRealTimers();
    });

    it("should resolve with empty set when no events received and EOSE never arrives", async () => {
        vi.useFakeTimers();

        const ndk = new NDK();

        // Mock subscribe that never sends events or EOSE
        const mockSub = new NDKSubscription(ndk, [{ kinds: [1] }]);
        const subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation(() => {
            return mockSub;
        });

        const promise = ndk.fetchEvents({ kinds: [1] }, { timeout: 3000 });

        // Advance past the timeout
        await vi.advanceTimersByTimeAsync(3100);

        const result = await promise;

        // Should resolve with empty set
        expect(result.size).toBe(0);

        subscribeSpy.mockRestore();
        vi.useRealTimers();
    });

    it("should resolve immediately on EOSE and clear the timeout", async () => {
        vi.useFakeTimers();

        const ndk = new NDK();

        const mockSub = new NDKSubscription(ndk, [{ kinds: [1] }]);
        const subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts) => {
            // Simulate receiving an event and EOSE quickly
            setTimeout(() => {
                const event = new NDKEvent(ndk, {
                    kind: 1,
                    content: "fast event",
                    pubkey: "abc123",
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [],
                });
                event.id = "event2";
                opts?.onEvent?.(event);
            }, 50);

            // Send EOSE shortly after
            setTimeout(() => {
                opts?.onEose?.(mockSub);
            }, 100);

            return mockSub;
        });

        const promise = ndk.fetchEvents({ kinds: [1] }, { timeout: 5000 });

        // Advance just past the EOSE
        await vi.advanceTimersByTimeAsync(150);

        const result = await promise;

        // Should have resolved with the event
        expect(result.size).toBe(1);
        const events = Array.from(result);
        expect(events[0].content).toBe("fast event");

        subscribeSpy.mockRestore();
        vi.useRealTimers();
    });

    it("should use default 10s timeout when no timeout option is specified", async () => {
        vi.useFakeTimers();

        const ndk = new NDK();

        const mockSub = new NDKSubscription(ndk, [{ kinds: [1] }]);
        const stopSpy = vi.spyOn(mockSub, "stop");
        const subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation(() => {
            return mockSub;
        });

        const promise = ndk.fetchEvents({ kinds: [1] });

        // At 9 seconds, should still be pending (not yet resolved)
        await vi.advanceTimersByTimeAsync(9000);

        // The subscription should not have been stopped yet
        expect(stopSpy).not.toHaveBeenCalled();

        // Advance past the 10s default timeout
        await vi.advanceTimersByTimeAsync(1100);

        const result = await promise;
        expect(result.size).toBe(0);
        expect(stopSpy).toHaveBeenCalled();

        subscribeSpy.mockRestore();
        vi.useRealTimers();
    });

    it("should stop the subscription when timeout fires", async () => {
        vi.useFakeTimers();

        const ndk = new NDK();

        const mockSub = new NDKSubscription(ndk, [{ kinds: [1] }]);
        const stopSpy = vi.spyOn(mockSub, "stop");
        const subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation(() => {
            return mockSub;
        });

        const promise = ndk.fetchEvents({ kinds: [1] }, { timeout: 2000 });

        await vi.advanceTimersByTimeAsync(2100);

        await promise;

        // The subscription should have been stopped by the timeout
        expect(stopSpy).toHaveBeenCalled();

        subscribeSpy.mockRestore();
        vi.useRealTimers();
    });
});
