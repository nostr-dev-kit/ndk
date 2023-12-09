import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKSubscription, NostrEvent, type NDKUser, NDKSubscriptionCacheUsage, NDKRelay } from "@nostr-dev-kit/ndk";
import NDKRedisCacheAdapter from ".";
import Redis from "ioredis";

const signer = NDKPrivateKeySigner.generate();
const ndk = new NDK({
    cacheAdapter: new NDKRedisCacheAdapter(),
    signer
});
const redis = new Redis()
const relay = new NDKRelay("ws://localhost");

let user: NDKUser;

beforeAll(async () => {
    user = await signer.blockUntilReady();
});

async function storeEvent(sub: NDKSubscription, event?: NDKEvent) {
    event ??= new NDKEvent(ndk, {
        kind: NDKKind.Text,
        content: "hello, world"
    } as NostrEvent);
    await event.sign();

    await sub.eventReceived(event, relay);

    return event;
}

describe("setEvent", () => {
    it("stores the event", async () => {
        const sub = new NDKSubscription(ndk, {
            authors: [user.pubkey],
            kinds: [NDKKind.Text],
        }, { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, closeOnEose: true });
        const event = await storeEvent(sub);

        await sleep(100); // We don't want the cache to await the event to be stored, but we need to test that it is stored

        const result = await redis.get(event.id);
        expect(result).toBeTruthy();
    })

    it("finds the event", async () => {
        const sub = new NDKSubscription(ndk, {
            authors: [user.pubkey],
            kinds: [NDKKind.Text],
        }, { cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, closeOnEose: true });
        const event = await storeEvent(sub);

        // sub should have an event fired to it
        await new Promise<void>((resolve) => {
            sub.on("event", (event) => {
                expect(event.id).toEqual(event.id);
                resolve();
            });

            sub.start();
        });
    });
});

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}