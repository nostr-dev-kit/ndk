import NDK, { NDKEvent, NDKPrivateKeySigner, NDKSubscription } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "./index.js";

const ndk = new NDK();
ndk.signer = NDKPrivateKeySigner.generate();
ndk.cacheAdapter = new NDKCacheAdapterDexie();

describe("foundEvents", () => {
    it("applies limit filter", async () => {
        const startTime = Math.floor(Date.now() / 1000);
        const times = [];
        for (let i = 0; i < 10; i++) {
            const event = new NDKEvent(ndk);
            event.kind = 2;
            event.created_at = startTime - i * 60;
            times.push(event.created_at);
            await event.sign();
            ndk.cacheAdapter!.setEvent(event, []);
        }

        const subscription = new NDKSubscription(ndk, [{ kinds: [2], limit: 2 }]);
        const spy = jest.spyOn(subscription, "eventReceived");
        await ndk.cacheAdapter!.query(subscription);
        expect(subscription.eventReceived).toBeCalledTimes(2);

        // the time of the events that were received must be the first two in the list
        expect(spy.mock.calls[0][0].created_at).toBe(times[0]);
        expect(spy.mock.calls[1][0].created_at).toBe(times[1]);
    });
});

describe("foundEvent", () => {
    beforeAll(async () => {
        // save event
        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.tags.push(["a", "123"]);
        await event.sign();
        ndk.cacheAdapter!.setEvent(event, []);
    });

    it("correctly avoids reporting events that don't fully match NIP-01 filter", async () => {
        const subscription = new NDKSubscription(ndk, [{ "#a": ["123"], "#t": ["hello"] }]);
        jest.spyOn(subscription, "eventReceived");
        await ndk.cacheAdapter!.query(subscription);
        expect(subscription.eventReceived).toBeCalledTimes(0);
    });

    it("correctly reports events that fully match NIP-01 filter", async () => {
        const subscription = new NDKSubscription(ndk, [{ "#a": ["123"] }]);
        jest.spyOn(subscription, "eventReceived");
        await ndk.cacheAdapter!.query(subscription);
        expect(subscription.eventReceived).toBeCalledTimes(1);
    });
});

describe("by kind filter", () => {
    beforeAll(async () => {
        // save event
        const event = new NDKEvent(ndk);
        event.kind = 10002;
        await event.sign();
        ndk.cacheAdapter!.setEvent(event, []);
    });

    it("returns an event when fetching by kind", async () => {
        const subscription = new NDKSubscription(ndk, [{ kinds: [10002] }]);
        jest.spyOn(subscription, "eventReceived");
        await ndk.cacheAdapter!.query(subscription);
        expect(subscription.eventReceived).toBeCalledTimes(1);
    });

    it("matches by kind even when there is a since filter", async () => {
        const subscription = new NDKSubscription(ndk, [{ kinds: [10002], since: 1000 }]);
        jest.spyOn(subscription, "eventReceived");
        await ndk.cacheAdapter!.query(subscription);
        expect(subscription.eventReceived).toBeCalledTimes(1);
    });
});
