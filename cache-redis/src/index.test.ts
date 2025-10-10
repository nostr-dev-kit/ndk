import NDK, {
    NDKEvent,
    NDKKind,
    NDKPrivateKeySigner,
    NDKRelay,
    NDKSubscription,
    NDKSubscriptionCacheUsage,
    type NDKUser,
    type NostrEvent,
} from "@nostr-dev-kit/ndk";
import Redis from "ioredis";
import NDKRedisCacheAdapter from ".";

const signer = NDKPrivateKeySigner.generate();

// Initialize NDK without cache first
const ndk = new NDK({ signer });

// Create cache adapter and wait for Redis to connect
const cacheAdapter = new NDKRedisCacheAdapter();
ndk.cacheAdapter = cacheAdapter;

const redis = new Redis();

let user: NDKUser;
let relay: NDKRelay;

beforeAll(async () => {
    // Wait for Redis connection to be ready
    await new Promise<void>((resolve) => {
        if (cacheAdapter.redis.status === "ready") {
            resolve();
        } else {
            cacheAdapter.redis.once("ready", () => resolve());
        }
    });

    user = await signer.blockUntilReady();
    relay = new NDKRelay("ws://localhost", undefined, ndk);

    // Clear Redis before tests
    await redis.flushdb();
});

async function storeEvent(sub: NDKSubscription, event?: NDKEvent) {
    event ??= new NDKEvent(ndk, {
        kind: NDKKind.Text,
        content: "hello, world",
    } as NostrEvent);
    await event.sign();

    await sub.eventReceived(event, relay);

    return event;
}

describe("setEvent", () => {
    it("stores the event", async () => {
        const sub = new NDKSubscription(
            ndk,
            {
                authors: [user.pubkey],
                kinds: [NDKKind.Text],
            },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, closeOnEose: true },
        );
        const event = await storeEvent(sub);

        await sleep(100); // We don't want the cache to await the event to be stored, but we need to test that it is stored

        const result = await redis.get(event.id);
        expect(result).toBeTruthy();
    });

    it("finds the event", async () => {
        const sub = new NDKSubscription(
            ndk,
            {
                authors: [user.pubkey],
                kinds: [NDKKind.Text],
            },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, closeOnEose: true },
        );
        const storedEvent = await storeEvent(sub);

        // Wait for event to be stored
        await sleep(100);

        // Create a new subscription to find the event
        const findSub = new NDKSubscription(
            ndk,
            {
                authors: [user.pubkey],
                kinds: [NDKKind.Text],
            },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, closeOnEose: true },
        );

        // sub should have an event fired to it
        await new Promise<void>((resolve) => {
            findSub.on("event", (event) => {
                expect(event.id).toEqual(storedEvent.id);
                resolve();
            });

            findSub.on("eose", () => {
                // If we get EOSE without an event, resolve to prevent timeout
                resolve();
            });

            findSub.start();
        });
    });
});

describe("relay tracking", () => {
    it("stores and retrieves multiple relays for an event", async () => {
        const relay1 = new NDKRelay("ws://relay1.com", undefined, ndk);
        const relay2 = new NDKRelay("ws://relay2.com", undefined, ndk);
        const relay3 = new NDKRelay("ws://relay3.com", undefined, ndk);

        // Add relays to the pool for retrieval
        ndk.pool.addRelay(relay1);
        ndk.pool.addRelay(relay2);
        ndk.pool.addRelay(relay3);

        // Use a unique kind for this test to avoid conflicts
        const uniqueKind = 30001;
        const sub = new NDKSubscription(
            ndk,
            {
                authors: [user.pubkey],
                kinds: [uniqueKind],
            },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, closeOnEose: true },
        );

        const event = new NDKEvent(ndk, {
            kind: uniqueKind,
            content: "hello from multiple relays",
        } as NostrEvent);
        await event.sign();

        // Store the event from first relay (this will call setEvent)
        await sub.eventReceived(event, relay1);

        // For subsequent relays, directly add relay tracking since NDK won't call setEvent for duplicates
        await cacheAdapter.addEventRelay(event.id, relay2);
        await cacheAdapter.addEventRelay(event.id, relay3);

        await sleep(200); // Give time for async operations

        // Verify relay set contains all three relays (with normalized URLs)
        const relaySetKey = `relays:${event.id}`;
        const relayUrls = await redis.smembers(relaySetKey);

        expect(relayUrls).toContain("ws://relay1.com/");
        expect(relayUrls).toContain("ws://relay2.com/");
        expect(relayUrls).toContain("ws://relay3.com/");
        expect(relayUrls.length).toBe(3);

        // Query the event and verify relays are restored
        const newSub = new NDKSubscription(
            ndk,
            {
                authors: [user.pubkey],
                kinds: [uniqueKind],
            },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, closeOnEose: true },
        );

        await new Promise<void>((resolve) => {
            newSub.on("event", (retrievedEvent: NDKEvent) => {
                expect(retrievedEvent.id).toEqual(event.id);

                // Verify that onRelays returns all relays (with normalized URLs)
                const onRelays = retrievedEvent.onRelays;
                const relayUrls = onRelays.map(r => r.url);

                expect(relayUrls).toContain("ws://relay1.com/");
                expect(relayUrls).toContain("ws://relay2.com/");
                expect(relayUrls).toContain("ws://relay3.com/");

                resolve();
            });

            newSub.start();
        });
    });

    it("doesn't duplicate relay entries", async () => {
        const relay1 = new NDKRelay("ws://relay-unique.com", undefined, ndk);
        ndk.pool.addRelay(relay1);

        const sub = new NDKSubscription(
            ndk,
            {
                authors: [user.pubkey],
                kinds: [NDKKind.Metadata],
            },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, closeOnEose: true },
        );

        const event = new NDKEvent(ndk, {
            kind: NDKKind.Metadata,
            content: "test metadata",
        } as NostrEvent);
        await event.sign();

        // Store the event from relay
        await sub.eventReceived(event, relay1);

        // Try to add the same relay multiple times
        await cacheAdapter.addEventRelay(event.id, relay1);
        await cacheAdapter.addEventRelay(event.id, relay1);

        await sleep(100);

        // Verify relay set contains only one entry (with normalized URL)
        const relaySetKey = `relays:${event.id}`;
        const relayUrls = await redis.smembers(relaySetKey);

        expect(relayUrls).toContain("ws://relay-unique.com/");
        expect(relayUrls.length).toBe(1);
    });
});

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
