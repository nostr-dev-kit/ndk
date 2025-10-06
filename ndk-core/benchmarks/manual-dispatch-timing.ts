import { NDK } from "../src/ndk/index.js";
import { NDKSubscription } from "../src/subscription/index.js";
import { NDKSubscriptionManager } from "../src/subscription/manager.js";

function runBenchmark(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    const hz = 1000 / duration;
    console.log(`${name}:`);
    console.log(`  Duration: ${duration.toFixed(2)}ms`);
    console.log(`  Hz: ${hz.toFixed(2)}`);
    console.log(`  Mean: ${duration.toFixed(2)}ms`);
    console.log("");
}

console.log("=== Manual Subscription Dispatch Timing ===\n");

// Test 1: dispatch 1000 events with 10 subscriptions
runBenchmark("dispatch 1000 events with 10 subscriptions", () => {
    const ndk = new NDK({ filterValidationMode: "ignore" });
    const manager = new NDKSubscriptionManager();

    for (let i = 0; i < 10; i++) {
        const sub = new NDKSubscription(ndk, [{ kinds: [1], authors: [`author${i}`] }]);
        manager.add(sub);
    }

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

// Test 2: dispatch 1000 events with 50 subscriptions
runBenchmark("dispatch 1000 events with 50 subscriptions", () => {
    const ndk = new NDK({ filterValidationMode: "ignore" });
    const manager = new NDKSubscriptionManager();

    for (let i = 0; i < 50; i++) {
        const sub = new NDKSubscription(ndk, [{ kinds: [1], authors: [`author${i}`] }]);
        manager.add(sub);
    }

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

// Test 3: dispatch 1000 events with 100 subscriptions
runBenchmark("dispatch 1000 events with 100 subscriptions", () => {
    const ndk = new NDK({ filterValidationMode: "ignore" });
    const manager = new NDKSubscriptionManager();

    for (let i = 0; i < 100; i++) {
        const sub = new NDKSubscription(ndk, [{ kinds: [1], authors: [`author${i}`] }]);
        manager.add(sub);
    }

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

// Test 4: dispatch 5000 events with 100 subscriptions
runBenchmark("dispatch 5000 events with 100 subscriptions (stress test)", () => {
    const ndk = new NDK({ filterValidationMode: "ignore" });
    const manager = new NDKSubscriptionManager();

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

// Test 5: dispatch with mixed subscription types
runBenchmark("dispatch with mixed subscription types", () => {
    const ndk = new NDK({ filterValidationMode: "ignore" });
    const manager = new NDKSubscriptionManager();

    for (let i = 0; i < 50; i++) {
        let filter;
        if (i % 3 === 0) {
            filter = { kinds: [1] };
        } else if (i % 3 === 1) {
            filter = { authors: [`author${i}`] };
        } else {
            filter = { kinds: [1, 3], authors: [`author${i}`] };
        }
        const sub = new NDKSubscription(ndk, [filter]);
        manager.add(sub);
    }

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
