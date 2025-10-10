import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NDKEvent, NostrEvent } from "../events";
import { NDK } from "../ndk";
import { NDKRelay } from "../relay";
import { NDKSubscription } from "./index";

describe("Event Deduplication and onRelays tracking", () => {
    let ndk: NDK;
    let subscription: NDKSubscription;
    let relay1: NDKRelay;
    let relay2: NDKRelay;
    let relay3: NDKRelay;

    beforeEach(() => {
        ndk = new NDK();
        // Need to ensure subManager exists for onRelays tracking
        if (!ndk.subManager) {
            (ndk as any).subManager = {
                seenEvents: new Map(),
                seenEvent: function (eventId: string, relay: NDKRelay) {
                    if (!this.seenEvents.has(eventId)) {
                        this.seenEvents.set(eventId, []);
                    }
                    const relays = this.seenEvents.get(eventId)!;
                    if (!relays.includes(relay)) {
                        relays.push(relay);
                    }
                },
            };
        }
        relay1 = new NDKRelay("wss://relay1.example.com", undefined, ndk);
        relay2 = new NDKRelay("wss://relay2.example.com", undefined, ndk);
        relay3 = new NDKRelay("wss://relay3.example.com", undefined, ndk);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("onRelays accumulation", () => {
        it("should accumulate relays in onRelays as duplicates arrive", () => {
            subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                skipValidation: true,
                skipVerification: true,
            });

            // Create a test event
            const rawEvent: NostrEvent = {
                id: "test-event-id",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event content",
                sig: "test-signature",
            };

            // Track events emitted
            const emittedEvents: { type: string; event: NDKEvent; relay?: NDKRelay }[] = [];
            let capturedNDKEvent: NDKEvent | undefined;

            subscription.on("event", (event: NDKEvent) => {
                emittedEvents.push({ type: "event", event });
                capturedNDKEvent = event;
            });

            subscription.on("event:dup", (event: NDKEvent, relay?: NDKRelay) => {
                emittedEvents.push({ type: "event:dup", event, relay });
            });

            // First event from relay1
            subscription.eventReceived(rawEvent, relay1, false);

            // Manually track the relay since eventReceived doesn't do it automatically
            if (capturedNDKEvent && relay1) {
                ndk.subManager.seenEvent(capturedNDKEvent.id, relay1);
            }

            // Check that event was emitted once
            expect(emittedEvents).toHaveLength(1);
            expect(emittedEvents[0].type).toBe("event");

            // Check onRelays contains only relay1
            const ndkEvent = emittedEvents[0].event;
            expect(ndkEvent).toBeDefined();
            expect(Array.from(ndkEvent.onRelays)).toHaveLength(1);
            expect(Array.from(ndkEvent.onRelays)[0]).toBe(relay1);

            // Same event from relay2
            subscription.eventReceived(rawEvent, relay2, false);

            // Track relay2
            if (relay2) {
                ndk.subManager.seenEvent(rawEvent.id, relay2);
            }

            // Check that event:dup was emitted
            expect(emittedEvents).toHaveLength(2);
            expect(emittedEvents[1].type).toBe("event:dup");
            expect(emittedEvents[1].relay).toBe(relay2);

            // Check onRelays now contains both relays
            expect(Array.from(ndkEvent.onRelays)).toHaveLength(2);
            expect(Array.from(ndkEvent.onRelays)).toContain(relay1);
            expect(Array.from(ndkEvent.onRelays)).toContain(relay2);

            // Same event from relay3
            subscription.eventReceived(rawEvent, relay3, false);

            // Track relay3
            if (relay3) {
                ndk.subManager.seenEvent(rawEvent.id, relay3);
            }

            // Check that another event:dup was emitted
            expect(emittedEvents).toHaveLength(3);
            expect(emittedEvents[2].type).toBe("event:dup");
            expect(emittedEvents[2].relay).toBe(relay3);

            // Check onRelays now contains all three relays
            expect(Array.from(ndkEvent.onRelays)).toHaveLength(3);
            expect(Array.from(ndkEvent.onRelays)).toContain(relay1);
            expect(Array.from(ndkEvent.onRelays)).toContain(relay2);
            expect(Array.from(ndkEvent.onRelays)).toContain(relay3);

            // Verify that all events have the same ID (they're duplicates of the same event)
            expect(emittedEvents[0].event.id).toBe("test-event-id");
            expect(emittedEvents[1].event.id).toBe("test-event-id");
            expect(emittedEvents[2].event.id).toBe("test-event-id");
        });

        it("should not add the same relay twice to onRelays", () => {
            subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "test-event-id-2",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event content",
                sig: "test-signature",
            };

            let ndkEvent: NDKEvent | undefined;
            subscription.on("event", (event: NDKEvent) => {
                ndkEvent = event;
            });

            // First event from relay1
            subscription.eventReceived(rawEvent, relay1, false);

            // Track the relay
            if (ndkEvent && relay1) {
                ndk.subManager.seenEvent(ndkEvent.id, relay1);
            }

            expect(Array.from(ndkEvent!.onRelays)).toHaveLength(1);

            // Same event from relay1 again (shouldn't add duplicate)
            subscription.eventReceived(rawEvent, relay1, false);
            expect(Array.from(ndkEvent!.onRelays)).toHaveLength(1);
            expect(Array.from(ndkEvent!.onRelays)[0]).toBe(relay1);
        });

        it("should handle events arriving without relay information", () => {
            subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "test-event-id-3",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event content",
                sig: "test-signature",
            };

            let ndkEvent: NDKEvent | undefined;
            subscription.on("event", (event: NDKEvent) => {
                ndkEvent = event;
            });

            // Event without relay
            subscription.eventReceived(rawEvent, undefined, false);
            expect(ndkEvent).toBeDefined();
            expect(Array.from(ndkEvent!.onRelays)).toHaveLength(0);

            // Same event from relay1
            subscription.eventReceived(rawEvent, relay1, false);

            // Track the relay
            if (ndkEvent && relay1) {
                ndk.subManager.seenEvent(ndkEvent.id, relay1);
            }

            expect(Array.from(ndkEvent!.onRelays)).toHaveLength(1);
            expect(Array.from(ndkEvent!.onRelays)[0]).toBe(relay1);
        });
    });

    describe("event:dup emission", () => {
        it("should emit event:dup with correct parameters", (done) => {
            subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "test-event-dup-params",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event content",
                sig: "test-signature",
            };

            let firstEventTime: number;

            subscription.on("event", () => {
                firstEventTime = Date.now();
            });

            subscription.on("event:dup", (event: NDKEvent, relay?: NDKRelay, timeSinceFirstSeen?: number) => {
                // Verify event is the correct one
                expect(event.id).toBe("test-event-dup-params");

                // Verify relay is passed correctly
                expect(relay).toBe(relay2);

                // Verify timeSinceFirstSeen is reasonable (should be small but > 0)
                expect(timeSinceFirstSeen).toBeDefined();
                expect(timeSinceFirstSeen).toBeGreaterThanOrEqual(0);
                expect(timeSinceFirstSeen).toBeLessThan(100); // Should be very quick in test

                done();
            });

            // First event from relay1
            subscription.eventReceived(rawEvent, relay1, false);

            // Small delay to ensure measurable time difference
            setTimeout(() => {
                // Same event from relay2
                subscription.eventReceived(rawEvent, relay2, false);
            }, 10);
        });

        it("should emit 'event' for first occurrence and 'event:dup' for subsequent ones", () => {
            subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "test-event-sequence",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event content",
                sig: "test-signature",
            };

            const emissions: string[] = [];

            subscription.on("event", () => {
                emissions.push("event");
            });

            subscription.on("event:dup", () => {
                emissions.push("event:dup");
            });

            // First occurrence - should emit "event"
            subscription.eventReceived(rawEvent, relay1, false);
            expect(emissions).toEqual(["event"]);

            // Second occurrence - should emit "event:dup"
            subscription.eventReceived(rawEvent, relay2, false);
            expect(emissions).toEqual(["event", "event:dup"]);

            // Third occurrence - should emit "event:dup" again
            subscription.eventReceived(rawEvent, relay3, false);
            expect(emissions).toEqual(["event", "event:dup", "event:dup"]);
        });

        it("should correctly identify which relay sent the duplicate", () => {
            subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "test-relay-identification",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event content",
                sig: "test-signature",
            };

            const duplicateRelays: (NDKRelay | undefined)[] = [];

            subscription.on("event:dup", (_event: NDKEvent, relay?: NDKRelay) => {
                duplicateRelays.push(relay);
            });

            // First event from relay1 (no dup emission)
            subscription.eventReceived(rawEvent, relay1, false);
            expect(duplicateRelays).toHaveLength(0);

            // Duplicate from relay2
            subscription.eventReceived(rawEvent, relay2, false);
            expect(duplicateRelays).toHaveLength(1);
            expect(duplicateRelays[0]).toBe(relay2);

            // Duplicate from relay3
            subscription.eventReceived(rawEvent, relay3, false);
            expect(duplicateRelays).toHaveLength(2);
            expect(duplicateRelays[1]).toBe(relay3);

            // Duplicate from relay1 again (should still emit dup)
            subscription.eventReceived(rawEvent, relay1, false);
            expect(duplicateRelays).toHaveLength(3);
            expect(duplicateRelays[2]).toBe(relay1);
        });
    });

    describe("edge cases", () => {
        it("should handle rapid duplicate arrivals", () => {
            subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "test-rapid-duplicates",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event content",
                sig: "test-signature",
            };

            let eventCount = 0;
            let dupCount = 0;
            let ndkEvent: NDKEvent | undefined;

            subscription.on("event", (event: NDKEvent) => {
                eventCount++;
                ndkEvent = event;
            });

            subscription.on("event:dup", () => {
                dupCount++;
            });

            // Simulate rapid arrivals from multiple relays
            subscription.eventReceived(rawEvent, relay1, false);
            if (ndkEvent && relay1) ndk.subManager.seenEvent(ndkEvent.id, relay1);

            subscription.eventReceived(rawEvent, relay2, false);
            if (ndkEvent && relay2) ndk.subManager.seenEvent(ndkEvent.id, relay2);

            subscription.eventReceived(rawEvent, relay3, false);
            if (ndkEvent && relay3) ndk.subManager.seenEvent(ndkEvent.id, relay3);

            subscription.eventReceived(rawEvent, relay1, false); // Duplicate from same relay
            subscription.eventReceived(rawEvent, relay2, false); // Duplicate from same relay

            expect(eventCount).toBe(1); // Only one "event" emission
            expect(dupCount).toBe(4); // Four duplicate emissions
            expect(Array.from(ndkEvent!.onRelays)).toHaveLength(3); // Three unique relays
        });

        it("should maintain separate onRelays for different events", () => {
            subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                skipValidation: true,
                skipVerification: true,
            });

            const event1: NostrEvent = {
                id: "event-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Event 1",
                sig: "sig-1",
            };

            const event2: NostrEvent = {
                id: "event-2",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Event 2",
                sig: "sig-2",
            };

            const events = new Map<string, NDKEvent>();

            subscription.on("event", (event: NDKEvent) => {
                events.set(event.id, event);
            });

            // Event 1 from relay1 and relay2
            subscription.eventReceived(event1, relay1, false);
            if (relay1) ndk.subManager.seenEvent(event1.id, relay1);

            subscription.eventReceived(event1, relay2, false);
            if (relay2) ndk.subManager.seenEvent(event1.id, relay2);

            // Event 2 from relay2 and relay3
            subscription.eventReceived(event2, relay2, false);
            if (relay2) ndk.subManager.seenEvent(event2.id, relay2);

            subscription.eventReceived(event2, relay3, false);
            if (relay3) ndk.subManager.seenEvent(event2.id, relay3);

            const ndkEvent1 = events.get("event-1");
            const ndkEvent2 = events.get("event-2");

            // Verify each event has its own onRelays set
            expect(Array.from(ndkEvent1!.onRelays)).toHaveLength(2);
            expect(Array.from(ndkEvent1!.onRelays)).toContain(relay1);
            expect(Array.from(ndkEvent1!.onRelays)).toContain(relay2);

            expect(Array.from(ndkEvent2!.onRelays)).toHaveLength(2);
            expect(Array.from(ndkEvent2!.onRelays)).toContain(relay2);
            expect(Array.from(ndkEvent2!.onRelays)).toContain(relay3);
        });
    });
});
