import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NDKEvent } from "../../events/index";
import { NDK } from "../../ndk/index";
import { NDKPrivateKeySigner } from "../../signers/private-key/index";
import { NDKRelay } from "../index";
import { NDKRelaySet } from "./index";

// Mock WebSocket globally to avoid actual network connections
vi.mock("ws", () => {
    return {
        default: class MockWebSocket {
            addEventListener() {
                /* empty */
            }
            send() {
                /* empty */
            }
            close() {
                /* empty */
            }
        },
    };
});

describe("NDKRelaySet publish", () => {
    let ndk: NDK;
    let relay1: NDKRelay;
    let relay2: NDKRelay;
    let relay3: NDKRelay;
    let relaySet: NDKRelaySet;
    let event: NDKEvent;
    let mockPublish1: any;
    let mockPublish2: any;
    let mockPublish3: any;

    beforeEach(async () => {
        ndk = new NDK();

        relay1 = new NDKRelay("wss://relay1.example.com", undefined, ndk);
        relay2 = new NDKRelay("wss://relay2.example.com", undefined, ndk);
        relay3 = new NDKRelay("wss://relay3.example.com", undefined, ndk);

        // Create a test event
        event = new NDKEvent(ndk);
        event.content = "test content";
        event.kind = 1;

        // Generate a key to sign the event
        const signer = NDKPrivateKeySigner.generate();
        await event.sign(signer);

        // Create the relay set
        relaySet = new NDKRelaySet(new Set([relay1, relay2, relay3]), ndk);

        // Mock the publish methods
        mockPublish1 = vi.spyOn(relay1, "publish").mockImplementation(() => Promise.resolve(true));
        mockPublish2 = vi.spyOn(relay2, "publish").mockImplementation(() => Promise.resolve(true));
        mockPublish3 = vi.spyOn(relay3, "publish").mockImplementation(() => Promise.resolve(true));
    });

    it("should track successful publishes", async () => {
        // Setup mocks to simulate successful publish
        mockPublish1.mockResolvedValue(true);
        mockPublish2.mockResolvedValue(true);
        mockPublish3.mockResolvedValue(true);

        const result = await relaySet.publish(event);

        expect(result.size).toBe(3);
        expect(result.has(relay1)).toBe(true);
        expect(result.has(relay2)).toBe(true);
        expect(result.has(relay3)).toBe(true);
        expect(event.publishStatus).toBe("success");
    });

    it("should handle partial failures", async () => {
        // Setup mocks to simulate mixed success/failure
        mockPublish1.mockResolvedValue(true);
        mockPublish2.mockRejectedValue(new Error("Failed to publish"));
        mockPublish3.mockResolvedValue(true);

        const result = await relaySet.publish(event);

        expect(result.size).toBe(2);
        expect(result.has(relay1)).toBe(true);
        expect(result.has(relay2)).toBe(false);
        expect(result.has(relay3)).toBe(true);
        expect(event.publishStatus).toBe("success");
    });

    it("should handle all failures when requiredRelayCount is not met", async () => {
        // Setup mocks to simulate all failures
        mockPublish1.mockRejectedValue(new Error("Failed to publish"));
        mockPublish2.mockRejectedValue(new Error("Failed to publish"));
        mockPublish3.mockRejectedValue(new Error("Failed to publish"));

        // Set a required count of 2 relays
        await expect(relaySet.publish(event, 1000, 2)).rejects.toThrow();
        expect(event.publishStatus).toBe("error");
    });

    it("should handle delayed responses correctly", async () => {
        // Use fake timers
        vi.useFakeTimers();

        const promiseResolvers: Array<(value: boolean) => void> = [];

        // Setup mocks to simulate varying delay times
        mockPublish1.mockImplementation(() => {
            return new Promise((resolve) => {
                promiseResolvers.push(() => resolve(true));
            });
        });

        mockPublish2.mockImplementation(() => {
            return new Promise((resolve) => {
                promiseResolvers.push(() => resolve(true));
            });
        });

        mockPublish3.mockImplementation(() => {
            return new Promise((resolve) => {
                promiseResolvers.push(() => resolve(true));
            });
        });

        // Start the publish operation
        const publishPromise = relaySet.publish(event);

        // Resolve each promise manually
        promiseResolvers.forEach((resolver) => resolver(true));

        // Wait for the publish to complete
        const result = await publishPromise;

        expect(result.size).toBe(3);
        expect(result.has(relay1)).toBe(true);
        expect(result.has(relay2)).toBe(true);
        expect(result.has(relay3)).toBe(true);

        // Restore real timers
        vi.useRealTimers();
    });

    it("should handle timeouts correctly", async () => {
        // Use fake timers
        vi.useFakeTimers();

        // Setup first two relays to respond quickly
        mockPublish1.mockResolvedValue(true);
        mockPublish2.mockResolvedValue(true);

        // Set up third relay to timeout
        mockPublish3.mockImplementation(() => {
            return new Promise((resolve) => {
                // This will never resolve within the timeout
                setTimeout(() => resolve(true), 200);
            });
        });

        // Start the publish operation with a short timeout
        const publishPromise = relaySet.publish(event, 100);

        // Advance time past the timeout
        vi.advanceTimersByTime(150);

        // Wait for the publish to complete
        const result = await publishPromise;

        // Should have 2 successful relays as the third one timed out
        expect(result.size).toBe(2);
        expect(result.has(relay1)).toBe(true);
        expect(result.has(relay2)).toBe(true);
        expect(result.has(relay3)).toBe(false);

        // Restore real timers
        vi.useRealTimers();
    });

    it("should handle race conditions with resolve/reject", async () => {
        // Create a special mock for relay1 that emits events before resolving
        mockPublish1.mockImplementation(() => {
            relay1.emit("published", event);
            event.emit("relay:published", relay1);
            return Promise.resolve(true);
        });

        // Test that publishers failing after emitting events are still counted
        mockPublish2.mockImplementation(() => {
            // Emit the event handlers first
            relay2.emit("published", event);
            event.emit("relay:published", relay2);

            // Then fail the promise
            return Promise.reject(new Error("Connection closed"));
        });

        mockPublish3.mockResolvedValue(true);

        const result = await relaySet.publish(event);

        // Should include relay2 even though its promise was rejected
        // because the event was emitted correctly
        expect(result.size).toBeGreaterThanOrEqual(2);
        expect(result.has(relay1)).toBe(true);
        // Check if relay2 is counted due to the event emission
        expect(result.has(relay2)).toBe(true);
        expect(result.has(relay3)).toBe(true);
    });

    it("should emit and track correct events", async () => {
        // Setup mocks
        mockPublish1.mockResolvedValue(true);
        mockPublish2.mockResolvedValue(true);
        mockPublish3.mockResolvedValue(true);

        // Track emitted events
        let emittedEvent = false;
        let emittedRelays: Set<NDKRelay> | undefined;

        event.on("published", (data: { relaySet: NDKRelaySet; publishedToRelays: Set<NDKRelay> }) => {
            emittedEvent = true;
            emittedRelays = data.publishedToRelays;
        });

        await relaySet.publish(event);

        expect(emittedEvent).toBe(true);
        expect(emittedRelays?.size).toBe(3);
    });
});
