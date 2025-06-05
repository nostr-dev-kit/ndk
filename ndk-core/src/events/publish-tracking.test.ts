import { NDKEvent } from "./index.js";
import { NDK } from "../ndk/index.js";
import { NDKRelay } from "../relay/index.js";
import { NDKRelaySet } from "../relay/sets/index.js";
import { NDKPublishError } from "../relay/sets/index.js";
import { NDKPrivateKeySigner } from "../signers/private-key/index.js";

describe("NDKEvent publish tracking", () => {
    let ndk: NDK;
    let signer: NDKPrivateKeySigner;
    let event: NDKEvent;
    let relay1: NDKRelay;
    let relay2: NDKRelay;
    let relay3: NDKRelay;
    let relaySet: NDKRelaySet;

    beforeEach(() => {
        ndk = new NDK();
        signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        event = new NDKEvent(ndk, {
            kind: 1,
            content: "Test event for publish tracking",
            tags: [],
            created_at: Math.floor(Date.now() / 1000),
        });

        relay1 = new NDKRelay("wss://relay1.test");
        relay2 = new NDKRelay("wss://relay2.test");
        relay3 = new NDKRelay("wss://relay3.test");

        relaySet = new NDKRelaySet(new Set([relay1, relay2, relay3]), ndk);
    });

    it("should track pending status for all relays before publish", async () => {
        // Mock the publish method to simulate the initial state
        jest.spyOn(relaySet, "publish").mockImplementation(async (event) => {
            // The real implementation would set pending status before attempting publish
            expect(event.publishRelayStatus.get("wss://relay1.test")?.status).toBe("pending");
            expect(event.publishRelayStatus.get("wss://relay2.test")?.status).toBe("pending");
            expect(event.publishRelayStatus.get("wss://relay3.test")?.status).toBe("pending");

            // Simulate successful publish to relay1 and relay2
            return new Set([relay1, relay2]);
        });

        await event.publish(relaySet);
    });

    it("should track successful publishes", async () => {
        // Mock successful publish to some relays
        jest.spyOn(relaySet, "publish").mockResolvedValue(new Set([relay1, relay2]));

        await event.publish(relaySet);

        // Check successful relays
        expect(event.publishedToRelays).toContain("wss://relay1.test");
        expect(event.publishedToRelays).toContain("wss://relay2.test");
        expect(event.publishedToRelays).toHaveLength(2);

        // Check individual relay status
        expect(event.wasPublishedTo("wss://relay1.test")).toBe(true);
        expect(event.wasPublishedTo("wss://relay2.test")).toBe(true);
        expect(event.wasPublishedTo("wss://relay3.test")).toBe(false);

        // Check status details
        const relay1Status = event.publishRelayStatus.get("wss://relay1.test");
        expect(relay1Status?.status).toBe("success");
        expect(relay1Status?.timestamp).toBeDefined();
    });

    it("should track failed publishes with errors", async () => {
        const error1 = new Error("Connection timeout");
        const error3 = new Error("Relay rejected event");

        // Mock publish failure
        const publishError = new NDKPublishError(
            "Not enough relays received the event",
            new Map([
                [relay1, error1],
                [relay3, error3],
            ]),
            new Set([relay2]), // Only relay2 succeeded
            relaySet,
        );

        jest.spyOn(relaySet, "publish").mockRejectedValue(publishError);

        try {
            await event.publish(relaySet);
        } catch (e) {
            // Expected to throw
        }

        // Check successful relay
        expect(event.publishedToRelays).toEqual(["wss://relay2.test"]);

        // Check failed relays
        const failures = event.failedPublishesToRelays;
        expect(failures.size).toBe(2);
        expect(failures.get("wss://relay1.test")).toBe(error1);
        expect(failures.get("wss://relay3.test")).toBe(error3);

        // Check individual status
        expect(event.publishRelayStatus.get("wss://relay1.test")?.status).toBe("error");
        expect(event.publishRelayStatus.get("wss://relay1.test")?.error).toBe(error1);
        expect(event.publishRelayStatus.get("wss://relay2.test")?.status).toBe("success");
        expect(event.publishRelayStatus.get("wss://relay3.test")?.status).toBe("error");
        expect(event.publishRelayStatus.get("wss://relay3.test")?.error).toBe(error3);
    });

    it("should clear previous publish status on republish", async () => {
        // First publish
        jest.spyOn(relaySet, "publish").mockResolvedValue(new Set([relay1]));
        await event.publish(relaySet);

        expect(event.publishedToRelays).toEqual(["wss://relay1.test"]);

        // Create a new relay set for second publish
        const newRelaySet = new NDKRelaySet(new Set([relay2, relay3]), ndk);

        // Second publish to different relays
        jest.spyOn(newRelaySet, "publish").mockResolvedValue(new Set([relay2, relay3]));
        await event.publish(newRelaySet);

        // Should only have the new relays
        expect(event.publishedToRelays.sort()).toEqual(["wss://relay2.test", "wss://relay3.test"]);
        expect(event.publishRelayStatus.has("wss://relay1.test")).toBe(false);
    });

    it("should preserve relay status when creating new event instance", () => {
        // Set up some relay status
        event.publishRelayStatus.set("wss://relay1.test", {
            status: "success",
            timestamp: Date.now(),
        });
        event.publishRelayStatus.set("wss://relay2.test", {
            status: "error",
            error: new Error("Failed"),
            timestamp: Date.now(),
        });

        // Create new event from existing event
        const newEvent = new NDKEvent(ndk, event);

        // Should have the same relay status
        expect(newEvent.publishRelayStatus.size).toBe(2);
        expect(newEvent.publishedToRelays).toEqual(["wss://relay1.test"]);
        expect(newEvent.failedPublishesToRelays.size).toBe(1);
        expect(newEvent.wasPublishedTo("wss://relay1.test")).toBe(true);
        expect(newEvent.wasPublishedTo("wss://relay2.test")).toBe(false);
    });

    it("should handle onRelays property for both seen and published events", () => {
        // Mock subManager seenEvents
        ndk.subManager.seenEvents.set(event.id, [relay1, relay2]);

        // onRelays should return relays where event was seen
        expect(event.onRelays).toEqual([relay1, relay2]);

        // This is separate from publishRelayStatus which tracks publish attempts
        event.publishRelayStatus.set("wss://relay3.test", {
            status: "success",
            timestamp: Date.now(),
        });

        // onRelays still returns seen relays, not published relays
        expect(event.onRelays).toEqual([relay1, relay2]);
    });
});
