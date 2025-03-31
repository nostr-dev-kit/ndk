import {
    EventGenerator,
    RelayPoolMock,
    expectEventToBeValid,
    expectEventsToMatch,
} from "@nostr-dev-kit/ndk-test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import NDK, {
    NDKSubscription,
    type NDKFilter,
    NDKKind,
    type NDKEvent,
    type NDKRelay,
    NDKRelaySet,
} from "./index";

describe("NDKSubscription", () => {
    let ndk: NDK;
    let pool: RelayPoolMock;

    beforeEach(() => {
        pool = new RelayPoolMock();
        ndk = new NDK({ explicitRelayUrls: [] });

        // Set up the EventGenerator with our NDK instance
        EventGenerator.setNDK(ndk);

        // Replace the relay pool with our mock
        // @ts-ignore - We're intentionally replacing the pool for testing
        ndk.pool = pool;

        // Add some mock relays
        pool.addMockRelay("wss://relay1.example.com");
        pool.addMockRelay("wss://relay2.example.com");
        pool.addMockRelay("wss://relay3.example.com");
    });

    afterEach(() => {
        pool.disconnectAll();
        pool.resetAll();
    });

    it("should receive events matching the filter", async () => {
        // Create test events
        const event1 = await EventGenerator.createSignedTextNote("Hello world #1");
        const event2 = await EventGenerator.createSignedTextNote("Hello world #2");
        const event3 = await EventGenerator.createSignedTextNote("Hello world #3");

        // Define filter
        const filter: NDKFilter = { kinds: [NDKKind.Text] };

        // Get the first relay
        const relaysArray = Array.from(pool.relays);
        const mockRelay = relaysArray[0];
        const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
        // Create subscription with explicit subId
        const subId = "test-subscription-1";
        const sub = new NDKSubscription(
            ndk,
            filter,
            {
                subId,
                skipVerification: true, // Skip verification to simplify test
                skipValidation: true, // Skip validation to simplify test
            },
            relaySet
        );

        // Track received events
        const receivedEvents: NDKEvent[] = [];
        let eoseReceived = false;

        sub.on("event", (event: NDKEvent) => {
            receivedEvents.push(event);
        });

        sub.on("eose", () => {
            eoseReceived = true;
        });
        await sub.start();
        mockRelay.simulateEvent(event1, sub.subId!);
        mockRelay.simulateEvent(event2, sub.subId!);
        mockRelay.simulateEvent(event3, sub.subId!);
        mockRelay.simulateEOSE(sub.subId!);
        expect(receivedEvents.length).toEqual(3);
        expect(eoseReceived).toBe(true);
        expectEventToBeValid(expect, receivedEvents[0]);
        expectEventsToMatch(expect, receivedEvents[0], event1);
        expectEventsToMatch(expect, receivedEvents[1], event2);
        expectEventsToMatch(expect, receivedEvents[2], event3);
    });

    it("should close subscription on EOSE when requested", async () => {
        // Create test events
        const event = await EventGenerator.createSignedTextNote("Test event");

        // Define filter
        const filter: NDKFilter = { kinds: [NDKKind.Text] };

        // Get the first relay
        const relaysArray = Array.from(pool.relays);
        const mockRelay = relaysArray[0];

        const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);

        // Create subscription with closeOnEose=true and explicit subId
        const sub = new NDKSubscription(
            ndk,
            filter,
            {
                closeOnEose: true,
                subId: "test-subscription-2",
                skipVerification: true, // Skip verification to simplify test
                skipValidation: true, // Skip validation to simplify test
            },
            relaySet
        );

        // Track events
        let eventReceived = false;
        let eoseReceived = false;
        let closedReceived = false;

        sub.on("event", () => {
            eventReceived = true;
        });

        sub.on("eose", () => {
            eoseReceived = true;
        });

        sub.on("close", () => {
            closedReceived = true;
        });
        await sub.start();
        mockRelay.simulateEvent(event, sub.subId!);

        // Simulate EOSE
        mockRelay.simulateEOSE(sub.subId!);
        expect(eventReceived).toBe(true);
        expect(eoseReceived).toBe(true);
        expect(closedReceived).toBe(true);
    });
});
