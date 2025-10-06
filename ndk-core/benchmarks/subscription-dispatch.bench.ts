import { bench, describe } from "vitest";
import { NDKEvent } from "../src/events/index.js";
import { NDK } from "../src/ndk/index.js";
import { NDKPrivateKeySigner } from "../src/signers/private-key/index.js";
import { NDKSubscription } from "../src/subscription/index.js";
import { NDKSubscriptionManager } from "../src/subscription/manager.js";

describe("Subscription Dispatching Performance", () => {
    bench("dispatch 1000 events with 10 subscriptions", () => {
        const ndk = new NDK();
        const manager = new NDKSubscriptionManager();

        // Create 10 subscriptions with different filters
        for (let i = 0; i < 10; i++) {
            const sub = new NDKSubscription(ndk, [{ kinds: [1], authors: [`author${i}`] }]);
            manager.add(sub);
        }

        // Dispatch 1000 events
        for (let i = 0; i < 1000; i++) {
            const event = {
                id: `event${i}`,
                kind: 1,
                pubkey: `author${i % 10}`,
                created_at: Math.floor(Date.now() / 1000),
                content: "test",
                tags: [],
                sig: "sig",
            };
            manager.dispatchEvent(event);
        }
    });

    bench("dispatch 1000 events with 50 subscriptions", () => {
        const ndk = new NDK();
        const manager = new NDKSubscriptionManager();

        // Create 50 subscriptions
        for (let i = 0; i < 50; i++) {
            const sub = new NDKSubscription(ndk, [{ kinds: [1], authors: [`author${i}`] }]);
            manager.add(sub);
        }

        // Dispatch 1000 events
        for (let i = 0; i < 1000; i++) {
            const event = {
                id: `event${i}`,
                kind: 1,
                pubkey: `author${i % 50}`,
                created_at: Math.floor(Date.now() / 1000),
                content: "test",
                tags: [],
                sig: "sig",
            };
            manager.dispatchEvent(event);
        }
    });

    bench("dispatch 1000 events with 100 subscriptions", () => {
        const ndk = new NDK();
        const manager = new NDKSubscriptionManager();

        // Create 100 subscriptions
        for (let i = 0; i < 100; i++) {
            const sub = new NDKSubscription(ndk, [{ kinds: [1], authors: [`author${i}`] }]);
            manager.add(sub);
        }

        // Dispatch 1000 events
        for (let i = 0; i < 1000; i++) {
            const event = {
                id: `event${i}`,
                kind: 1,
                pubkey: `author${i % 100}`,
                created_at: Math.floor(Date.now() / 1000),
                content: "test",
                tags: [],
                sig: "sig",
            };
            manager.dispatchEvent(event);
        }
    });

    bench("dispatch 5000 events with 100 subscriptions (stress test)", () => {
        const ndk = new NDK();
        const manager = new NDKSubscriptionManager();

        // Create 100 subscriptions with varied filters
        for (let i = 0; i < 100; i++) {
            const kinds = [1, 3, 6, 7];
            const sub = new NDKSubscription(ndk, [
                {
                    kinds: [kinds[i % 4]],
                    authors: [`author${i}`, `author${(i + 1) % 100}`],
                },
            ]);
            manager.add(sub);
        }

        // Dispatch 5000 events
        for (let i = 0; i < 5000; i++) {
            const event = {
                id: `event${i}`,
                kind: [1, 3, 6, 7][i % 4],
                pubkey: `author${i % 100}`,
                created_at: Math.floor(Date.now() / 1000),
                content: "test",
                tags: [],
                sig: "sig",
            };
            manager.dispatchEvent(event);
        }
    });

    bench("dispatch with mixed subscription types", () => {
        const ndk = new NDK();
        const manager = new NDKSubscriptionManager();

        // Create varied subscriptions
        for (let i = 0; i < 50; i++) {
            let filter;
            if (i % 3 === 0) {
                // Kind-only filter
                filter = { kinds: [1] };
            } else if (i % 3 === 1) {
                // Author-only filter
                filter = { authors: [`author${i}`] };
            } else {
                // Combined filter
                filter = { kinds: [1, 3], authors: [`author${i}`] };
            }
            const sub = new NDKSubscription(ndk, [filter]);
            manager.add(sub);
        }

        // Dispatch 2000 events
        for (let i = 0; i < 2000; i++) {
            const event = {
                id: `event${i}`,
                kind: [1, 3, 6][i % 3],
                pubkey: `author${i % 50}`,
                created_at: Math.floor(Date.now() / 1000),
                content: "test",
                tags: [],
                sig: "sig",
            };
            manager.dispatchEvent(event);
        }
    });
});
