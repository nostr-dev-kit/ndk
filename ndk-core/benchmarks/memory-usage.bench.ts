import { bench, describe } from "vitest";
import { NDKEvent } from "../src/events/index.js";
import { NDK } from "../src/ndk/index.js";
import { NDKSubscriptionManager } from "../src/subscription/manager.js";

describe("Memory Usage", () => {
    bench("seenEvents map growth - 10k events", () => {
        const ndk = new NDK();
        const manager = new NDKSubscriptionManager();

        // Simulate 10k events being tracked
        for (let i = 0; i < 10000; i++) {
            manager.seenEvent(`event${i}`, { url: "wss://relay.damus.io" } as any);
        }

        // Access to keep in memory
        const size = manager.seenEvents.size;
    });

    bench("seenEvents map growth - 50k events", () => {
        const ndk = new NDK();
        const manager = new NDKSubscriptionManager();

        // Simulate 50k events being tracked (1 hour at high volume)
        for (let i = 0; i < 50000; i++) {
            manager.seenEvent(`event${i}`, { url: "wss://relay.damus.io" } as any);
        }

        const size = manager.seenEvents.size;
    });

    bench("event instance creation - 1000 events", () => {
        const ndk = new NDK();
        const events: NDKEvent[] = [];

        for (let i = 0; i < 1000; i++) {
            const event = new NDKEvent(ndk, {
                id: `event${i}`,
                kind: 1,
                pubkey: "a".repeat(64),
                created_at: Math.floor(Date.now() / 1000),
                content: "test event content that is reasonably long to simulate real events",
                tags: [
                    ["e", "eventid"],
                    ["p", "pubkey"],
                    ["client", "test"],
                ],
                sig: "b".repeat(128),
            });
            events.push(event);
        }
    });

    bench("duplicate event instances - no deduplication", () => {
        const ndk = new NDK();
        const events: NDKEvent[] = [];

        // Create same event 100 times (simulating receiving from 100 relays)
        const rawEvent = {
            id: "same-event-id",
            kind: 1,
            pubkey: "a".repeat(64),
            created_at: Math.floor(Date.now() / 1000),
            content: "test",
            tags: [],
            sig: "b".repeat(128),
        };

        for (let i = 0; i < 100; i++) {
            const event = new NDKEvent(ndk, rawEvent);
            events.push(event);
        }

        // All different instances
        const allDifferent = events.every((e, i) => i === 0 || e !== events[i - 1]);
    });
});
