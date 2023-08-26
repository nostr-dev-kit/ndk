import NDK, { NDKEvent, NDKSubscription, NDKUser, NostrEvent } from "../index";

describe("NDKEvent", () => {
    let ndk: NDK;
    let event: NDKEvent;
    let user1: NDKUser;
    let user2: NDKUser;

    beforeEach(() => {
        ndk = new NDK();
        user1 = new NDKUser({
            npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
        });
        user2 = new NDKUser({
            npub: "npub12262qa4uhw7u8gdwlgmntqtv7aye8vdcmvszkqwgs0zchel6mz7s6cgrkj",
        });
        event = new NDKEvent(ndk);
        event.author = user1;
    });

    describe("deduplicationKey", () => {
        it("returns <kind>:<pubkey> for kinds 0", () => {
            event.kind = 0;
            const result = event.deduplicationKey();
            expect(result).toEqual(`0:${user1.hexpubkey()}`);
        });

        it("returns <kind>:<pubkey> for kinds 3", () => {
            event.kind = 3;
            const result = event.deduplicationKey();
            expect(result).toEqual(`3:${user1.hexpubkey()}`);
        });

        it("returns tagId for other kinds", () => {
            event.kind = 2;
            const spy = jest.spyOn(event, "tagId").mockReturnValue("mockTagId");
            const result = event.deduplicationKey();
            expect(result).toEqual("mockTagId");
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it("returns parameterized tagId for kinds between 30k and 40k", () => {
            event.kind = 35000;
            const spy = jest
                .spyOn(event, "tagId")
                .mockReturnValue("parameterizedTagId");
            const result = event.deduplicationKey();
            expect(result).toEqual("parameterizedTagId");
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe("tag", () => {
        it("tags a user without a marker", () => {
            event.tag(user2);
            expect(event.tags).toEqual([["p", user2.hexpubkey()]]);
        });

        it("tags a user with a marker", () => {
            event.tag(user2, "author");
            expect(event.tags).toEqual([["p", user2.hexpubkey(), "author"]]);
        });

        it("tags an event without a marker", () => {
            const otherEvent = new NDKEvent(ndk, {
                id: "123",
                kind: 1,
            } as NostrEvent);
            otherEvent.author = user1;

            event.tag(otherEvent);
            expect(event.tags).toEqual([["e", otherEvent.id]]);
        });

        it("tags an event with a marker", () => {
            const otherEvent = new NDKEvent(ndk, {
                id: "123",
                kind: 1,
            } as NostrEvent);
            otherEvent.author = user1;
            event.tag(otherEvent, "marker");
            expect(event.tags).toEqual([["e", otherEvent.id, "marker"]]);
        });

        it("tags an event author when it's different from the signing user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1 } as NostrEvent);
            otherEvent.author = user2;
            event.tag(otherEvent);
            expect(event.tags).toEqual([
                ["e", otherEvent.id],
                ["p", user2.hexpubkey()],
            ]);
        });

        it("does not tag an event author when it's the same as the signing user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1 } as NostrEvent);
            otherEvent.author = user1;
            event.tag(otherEvent);
            expect(event.tags).toEqual([["e", otherEvent.id]]);
        });
    });

    describe("fetchEvents", () => {
        it("correctly handles a relay sending old replaced events", async () => {
            const eventData = {
                kind: 300001,
                tags: [["d", ""]],
                content: "",
                pubkey: "",
            };
            const event1 = new NDKEvent(ndk, {
                ...eventData,
                created_at: Date.now() / 1000 - 3600,
            });
            const event2 = new NDKEvent(ndk, {
                ...eventData,
                created_at: Date.now() / 1000,
            });

            ndk.subscribe = jest.fn((filter, opts?): NDKSubscription => {
                const sub = new NDKSubscription(ndk, filter, opts);

                setTimeout(() => {
                    sub.emit("event", event1);
                    sub.emit("event", event2);
                    sub.emit("eose");
                }, 100);

                return sub;
            });

            const events = await ndk.fetchEvents({ kinds: [30001 as number] });

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
                        t[1] ===
                            "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
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
                tags: [["d", "d-code"]],
            });

            const event2 = new NDKEvent(ndk, {
                created_at: Date.now() / 1000,
                content: "",
                tags: [],
                kind: 1,
                pubkey: "pubkey",
                id: "eventid",
            });

            expect(event1.tagReference()).toEqual(["a", "30000:pubkey:d-code"]);
            expect(event2.tagReference()).toEqual(["e", "eventid"]);
        });
    });
});
