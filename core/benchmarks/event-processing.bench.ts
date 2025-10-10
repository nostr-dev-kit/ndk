import { bench, describe } from "vitest";
import { NDKEvent } from "../src/events/index.js";
import { getEventHash } from "../src/events/validation.js";
import { NDK } from "../src/ndk/index.js";

describe("Event Processing Performance", () => {
    bench("event serialization - 1000 events", () => {
        const ndk = new NDK();

        for (let i = 0; i < 1000; i++) {
            const event = new NDKEvent(ndk, {
                id: `event${i}`,
                kind: 1,
                pubkey: "a".repeat(64),
                created_at: Math.floor(Date.now() / 1000),
                content: "test event with some content",
                tags: [
                    ["e", "ref"],
                    ["p", "mention"],
                ],
                sig: "b".repeat(128),
            });
            event.serialize();
        }
    });

    bench("event hashing - 1000 events", () => {
        const ndk = new NDK();

        for (let i = 0; i < 1000; i++) {
            const event = new NDKEvent(ndk, {
                kind: 1,
                pubkey: "a".repeat(64),
                created_at: Math.floor(Date.now() / 1000),
                content: `test ${i}`,
                tags: [],
            });
            event.getEventHash();
        }
    });

    bench("TextEncoder instantiation overhead", () => {
        // Simulating current behavior - new TextEncoder per hash
        for (let i = 0; i < 1000; i++) {
            const encoder = new TextEncoder();
            const encoded = encoder.encode(`test ${i}`);
        }
    });

    bench("Shared TextEncoder (optimized)", () => {
        // Simulating optimized behavior - shared TextEncoder
        const encoder = new TextEncoder();
        for (let i = 0; i < 1000; i++) {
            const encoded = encoder.encode(`test ${i}`);
        }
    });

    bench("event validation - 1000 events", () => {
        const ndk = new NDK();

        const events: NDKEvent[] = [];
        for (let i = 0; i < 1000; i++) {
            const event = new NDKEvent(ndk, {
                id: `event${i}`,
                kind: 1,
                pubkey: "a".repeat(64),
                created_at: Math.floor(Date.now() / 1000),
                content: "test",
                tags: [],
                sig: "b".repeat(128),
            });
            events.push(event);
        }

        for (const event of events) {
            event.validate();
        }
    });

    bench("event deduplication key generation", () => {
        const ndk = new NDK();

        for (let i = 0; i < 1000; i++) {
            const event = new NDKEvent(ndk, {
                id: `event${i}`,
                kind: 1,
                pubkey: "a".repeat(64),
                created_at: Math.floor(Date.now() / 1000),
                content: "test",
                tags: [],
            });
            event.deduplicationKey();
        }
    });
});
