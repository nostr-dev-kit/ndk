import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NDKEvent, NostrEvent } from "../events";
import { NDK } from "../ndk";
import { NDKRelay } from "../relay";
import { NDKRelaySet } from "../relay/sets";
import { NDKSubscription } from "./index";

describe("Exclusive Relay Subscriptions", () => {
    let ndk: NDK;
    let relay1: NDKRelay;
    let relay2: NDKRelay;
    let relay3: NDKRelay;

    beforeEach(() => {
        ndk = new NDK();
        relay1 = new NDKRelay("wss://relay1.example.com", undefined, ndk);
        relay2 = new NDKRelay("wss://relay2.example.com", undefined, ndk);
        relay3 = new NDKRelay("wss://relay3.example.com", undefined, ndk);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic exclusiveRelay functionality", () => {
        it("should only accept events from relays in the relaySet when exclusiveRelay is true", () => {
            const relaySet = new NDKRelaySet(new Set([relay1, relay2]), ndk);
            const subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet,
                exclusiveRelay: true,
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "exclusive-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event",
                sig: "test-signature",
            };

            const receivedEvents: { event: NDKEvent; relay?: NDKRelay }[] = [];
            subscription.on("event", (event: NDKEvent, relay?: NDKRelay) => {
                receivedEvents.push({ event, relay });
            });

            // Add subscription to manager
            ndk.subManager.add(subscription);

            // Event from relay1 (in relaySet) should be accepted
            ndk.subManager.dispatchEvent(rawEvent, relay1);
            expect(receivedEvents).toHaveLength(1);
            expect(receivedEvents[0].relay).toBe(relay1);

            // Event from relay3 (NOT in relaySet) should be rejected
            ndk.subManager.dispatchEvent(rawEvent, relay3);
            expect(receivedEvents).toHaveLength(1); // Still only 1 event
        });

        it("should accept events from all relays when exclusiveRelay is false (default)", () => {
            const relaySet = new NDKRelaySet(new Set([relay1]), ndk);
            const subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet,
                exclusiveRelay: false,
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "non-exclusive-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event",
                sig: "test-signature",
            };

            const receivedEvents: { event: NDKEvent; relay?: NDKRelay }[] = [];
            subscription.on("event", (event: NDKEvent, relay?: NDKRelay) => {
                receivedEvents.push({ event, relay });
            });

            ndk.subManager.add(subscription);

            // Event from relay1 (in relaySet) should be accepted
            ndk.subManager.dispatchEvent(rawEvent, relay1);
            expect(receivedEvents).toHaveLength(1);

            // Event from relay2 (NOT in relaySet) should ALSO be accepted
            const rawEvent2: NostrEvent = {
                id: "non-exclusive-test-2",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event 2",
                sig: "test-signature-2",
            };
            ndk.subManager.dispatchEvent(rawEvent2, relay2);
            expect(receivedEvents).toHaveLength(2);
        });

        it("should work with relayUrls option", () => {
            // Add relays to the pool first so they'll be found by fromRelayUrls
            ndk.pool.relays.set(relay1.url, relay1);
            ndk.pool.relays.set(relay2.url, relay2);

            const subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relayUrls: ["wss://relay1.example.com", "wss://relay2.example.com"],
                exclusiveRelay: true,
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "relay-urls-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event",
                sig: "test-signature",
            };

            const receivedEvents: NDKEvent[] = [];
            subscription.on("event", (event: NDKEvent) => {
                receivedEvents.push(event);
            });

            ndk.subManager.add(subscription);

            // Event from relay1 (in relayUrls) should be accepted
            ndk.subManager.dispatchEvent(rawEvent, relay1);
            expect(receivedEvents).toHaveLength(1);

            // Event from relay3 (NOT in relayUrls) should be rejected
            ndk.subManager.dispatchEvent(rawEvent, relay3);
            expect(receivedEvents).toHaveLength(1);
        });
    });

    describe("Edge cases", () => {
        it("should handle cached events based on event's seen relays", () => {
            const relaySet = new NDKRelaySet(new Set([relay1, relay2]), ndk);
            const subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet,
                exclusiveRelay: true,
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "cache-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Cached event",
                sig: "test-signature",
            };

            const receivedEvents: NDKEvent[] = [];
            subscription.on("event", (event: NDKEvent) => {
                receivedEvents.push(event);
            });

            ndk.subManager.add(subscription);

            // Mark the event as seen on relay1 (which is in the relaySet)
            ndk.subManager.seenEvent(rawEvent.id!, relay1);

            // Dispatch from cache (relay = undefined)
            ndk.subManager.dispatchEvent(rawEvent, undefined);

            // Should be accepted because relay1 is in seenEvents and in relaySet
            expect(receivedEvents).toHaveLength(1);
        });

        it("should reject cached events if seen relays are not in relaySet", () => {
            const relaySet = new NDKRelaySet(new Set([relay1]), ndk);
            const subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet,
                exclusiveRelay: true,
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "cache-reject-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Cached event",
                sig: "test-signature",
            };

            const receivedEvents: NDKEvent[] = [];
            subscription.on("event", (event: NDKEvent) => {
                receivedEvents.push(event);
            });

            ndk.subManager.add(subscription);

            // Mark the event as seen on relay2 and relay3 (NOT in relaySet)
            ndk.subManager.seenEvent(rawEvent.id!, relay2);
            ndk.subManager.seenEvent(rawEvent.id!, relay3);

            // Dispatch from cache (relay = undefined)
            ndk.subManager.dispatchEvent(rawEvent, undefined);

            // Should be rejected because no seen relays are in relaySet
            expect(receivedEvents).toHaveLength(0);
        });

        it("should handle optimistic publishes based on skipOptimisticPublishEvent", () => {
            const relaySet = new NDKRelaySet(new Set([relay1]), ndk);
            const subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet,
                exclusiveRelay: true,
                skipOptimisticPublishEvent: false,
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "optimistic-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Optimistic event",
                sig: "test-signature",
            };

            const receivedEvents: NDKEvent[] = [];
            subscription.on("event", (event: NDKEvent) => {
                receivedEvents.push(event);
            });

            ndk.subManager.add(subscription);

            // Dispatch as optimistic publish (relay = undefined, optimisticPublish = true)
            ndk.subManager.dispatchEvent(rawEvent, undefined, true);

            // Should be accepted because skipOptimisticPublishEvent is false
            expect(receivedEvents).toHaveLength(1);
        });

        it("should reject optimistic publishes when skipOptimisticPublishEvent is true", () => {
            const relaySet = new NDKRelaySet(new Set([relay1]), ndk);
            const subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet,
                exclusiveRelay: true,
                skipOptimisticPublishEvent: true,
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "optimistic-reject-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Optimistic event",
                sig: "test-signature",
            };

            const receivedEvents: NDKEvent[] = [];
            subscription.on("event", (event: NDKEvent) => {
                receivedEvents.push(event);
            });

            ndk.subManager.add(subscription);

            // Dispatch as optimistic publish
            ndk.subManager.dispatchEvent(rawEvent, undefined, true);

            // Should be rejected because skipOptimisticPublishEvent is true
            expect(receivedEvents).toHaveLength(0);
        });

        it("should not apply exclusiveRelay check when relaySet is not specified", () => {
            const subscription = new NDKSubscription(ndk, [{ kinds: [1] }], {
                exclusiveRelay: true, // Set to true but no relaySet
                skipValidation: true,
                skipVerification: true,
            });

            const rawEvent: NostrEvent = {
                id: "no-relayset-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event",
                sig: "test-signature",
            };

            const receivedEvents: NDKEvent[] = [];
            subscription.on("event", (event: NDKEvent) => {
                receivedEvents.push(event);
            });

            ndk.subManager.add(subscription);

            // Should accept events from any relay when relaySet is not specified
            ndk.subManager.dispatchEvent(rawEvent, relay1);
            expect(receivedEvents).toHaveLength(1);

            const rawEvent2: NostrEvent = {
                ...rawEvent,
                id: "no-relayset-test-2",
            };
            ndk.subManager.dispatchEvent(rawEvent2, relay2);
            expect(receivedEvents).toHaveLength(2);
        });
    });

    describe("Multiple subscriptions interaction", () => {
        it("should allow exclusive and non-exclusive subscriptions to coexist", () => {
            const relaySet1 = new NDKRelaySet(new Set([relay1]), ndk);
            const exclusiveSub = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet: relaySet1,
                exclusiveRelay: true,
                skipValidation: true,
                skipVerification: true,
            });

            const nonExclusiveSub = new NDKSubscription(ndk, [{ kinds: [1] }], {
                exclusiveRelay: false,
                skipValidation: true,
                skipVerification: true,
            });

            const exclusiveEvents: NDKEvent[] = [];
            const nonExclusiveEvents: NDKEvent[] = [];

            exclusiveSub.on("event", (event: NDKEvent) => {
                exclusiveEvents.push(event);
            });

            nonExclusiveSub.on("event", (event: NDKEvent) => {
                nonExclusiveEvents.push(event);
            });

            ndk.subManager.add(exclusiveSub);
            ndk.subManager.add(nonExclusiveSub);

            const rawEvent: NostrEvent = {
                id: "coexist-test-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Test event",
                sig: "test-signature",
            };

            // Event from relay1 - should be received by both
            ndk.subManager.dispatchEvent(rawEvent, relay1);
            expect(exclusiveEvents).toHaveLength(1);
            expect(nonExclusiveEvents).toHaveLength(1);

            const rawEvent2: NostrEvent = {
                ...rawEvent,
                id: "coexist-test-2",
            };

            // Event from relay2 - should only be received by non-exclusive
            ndk.subManager.dispatchEvent(rawEvent2, relay2);
            expect(exclusiveEvents).toHaveLength(1); // Still 1
            expect(nonExclusiveEvents).toHaveLength(2); // Now 2
        });

        it("should handle multiple exclusive subscriptions with different relaySets", () => {
            const relaySet1 = new NDKRelaySet(new Set([relay1]), ndk);
            const relaySet2 = new NDKRelaySet(new Set([relay2]), ndk);

            const sub1 = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet: relaySet1,
                exclusiveRelay: true,
                skipValidation: true,
                skipVerification: true,
            });

            const sub2 = new NDKSubscription(ndk, [{ kinds: [1] }], {
                relaySet: relaySet2,
                exclusiveRelay: true,
                skipValidation: true,
                skipVerification: true,
            });

            const events1: NDKEvent[] = [];
            const events2: NDKEvent[] = [];

            sub1.on("event", (event: NDKEvent) => {
                events1.push(event);
            });

            sub2.on("event", (event: NDKEvent) => {
                events2.push(event);
            });

            ndk.subManager.add(sub1);
            ndk.subManager.add(sub2);

            const rawEvent1: NostrEvent = {
                id: "multi-exclusive-1",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Event from relay1",
                sig: "test-signature-1",
            };

            const rawEvent2: NostrEvent = {
                id: "multi-exclusive-2",
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                created_at: Math.floor(Date.now() / 1000),
                kind: 1,
                tags: [],
                content: "Event from relay2",
                sig: "test-signature-2",
            };

            // Event from relay1 - only sub1 should receive it
            ndk.subManager.dispatchEvent(rawEvent1, relay1);
            expect(events1).toHaveLength(1);
            expect(events2).toHaveLength(0);

            // Event from relay2 - only sub2 should receive it
            ndk.subManager.dispatchEvent(rawEvent2, relay2);
            expect(events1).toHaveLength(1);
            expect(events2).toHaveLength(1);
        });
    });
});
