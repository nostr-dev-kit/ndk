import NDK, { NDKEvent, NDKSubscription } from "../index";

describe("NDKEvent", () => {
    let ndk: NDK;
    let event: NDKEvent;

    beforeEach(() => {
        ndk = new NDK();
        event = new NDKEvent(ndk);
    });

    describe("fetchEvents", () => {
        it("correctly handles a relay sending old replaced events", async () => {
            const eventData = { kind: 300001, tags: [["d", ""]], content: "", pubkey: "" };
            const event1 = new NDKEvent(ndk, {
                ...eventData,
                created_at: Date.now() / 1000 - 3600
            });
            const event2 = new NDKEvent(ndk, { ...eventData, created_at: Date.now() / 1000 });

            ndk.subscribe = jest.fn((filter, opts?): NDKSubscription => {
                const sub = new NDKSubscription(ndk, filter, opts);

                setTimeout(() => {
                    sub.emit("event", event1);
                    sub.emit("event", event2);
                    sub.emit("eose");
                }, 100);

                return sub;
            });

            const events = await ndk.fetchEvents({ kinds: [30001] });

            expect(events.size).toBe(1);
            const dedupedEvent = events.values().next().value;

            expect(dedupedEvent).toEqual(event2);
        });
    });

    describe("toNostrEvent", () => {
        it("returns a NostrEvent object", async () => {
            const nostrEvent = await event.toNostrEvent();
            expect(nostrEvent).toHaveProperty("created_at");
            expect(nostrEvent).toHaveProperty("content");
            expect(nostrEvent).toHaveProperty("tags");
            expect(nostrEvent).toHaveProperty("kind");
            expect(nostrEvent).toHaveProperty("pubkey");
            expect(nostrEvent).toHaveProperty("id");
        });

        describe("mentions", () => {
            it("handles NIP-27 mentions", async () => {
                event.content =
                    "hello nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft!";
                const nostrEvent = await event.toNostrEvent();
                const mentionTag = nostrEvent.tags.find(
                    (t) =>
                        t[0] === "p" &&
                        t[1] === "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
                );
                expect(mentionTag).toBeTruthy();
            });
        });
    });

    describe("tagReference", () => {
        it("returns the correct tag for referencing the event", () => {
            const event1 = new NDKEvent(ndk, {
                created_at: Date.now() / 1000,
                content: "",
                kind: 30000,
                pubkey: "pubkey",
                tags: [["d", "d-code"]]
            });

            const event2 = new NDKEvent(ndk, {
                created_at: Date.now() / 1000,
                content: "",
                tags: [],
                kind: 1,
                pubkey: "pubkey",
                id: "eventid"
            });

            expect(event1.tagReference()).toEqual(["a", "30000:pubkey:d-code"]);
            expect(event2.tagReference()).toEqual(["e", "eventid"]);
        });
    });
});
