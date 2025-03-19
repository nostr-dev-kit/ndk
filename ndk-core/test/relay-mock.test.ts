import { describe, it, expect, beforeEach } from "vitest";
import { RelayMock, EventGenerator } from "@nostr-dev-kit/ndk-test-utils";
import { NDK, NDKEvent } from "../src";

describe("RelayMock from ndk-test-utils", () => {
    let relayMock: RelayMock;
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK();
        EventGenerator.setNDK(ndk);
        relayMock = new RelayMock("wss://test.relay");
    });

    it("should initialize with the correct URL", () => {
        expect(relayMock.url).toBe("wss://test.relay");
    });

    it("should connect successfully", async () => {
        await relayMock.connect();
        expect(relayMock.status).toBe(2); // CONNECTED
    });

    it("should disconnect successfully", async () => {
        await relayMock.connect();
        await relayMock.disconnect();
        expect(relayMock.status).toBe(0); // DISCONNECTED
    });

    it("should handle event simulation", async () => {
        // Create a test event using EventGenerator
        const event = EventGenerator.createEvent(1, "test content");

        // Set up a subscription
        const subscriptionId = "sub1";
        const callbackFn = vitest.fn();

        // Create a simple subscription object
        const subscription = {
            subId: subscriptionId,
            eventReceived: callbackFn,
            eoseReceived: vitest.fn(),
        };

        // Add the subscription to the mock relay
        relayMock.subscribe(subscription as any, [{ kinds: [1] }]);

        // Simulate receiving an event
        await relayMock.simulateEvent(event, subscriptionId);

        // Verify that the callback was called with the event
        expect(callbackFn).toHaveBeenCalledWith(event, expect.anything());
    });
});
