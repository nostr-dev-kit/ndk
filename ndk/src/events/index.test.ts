import type { NostrEvent } from ".";
import { NDKEvent } from ".";
import { NDK } from "../ndk";
import { NDKRelay } from "../relay";
import { NDKSubscription } from "../subscription";
import { NDKUser } from "../user";
import { NDKRelaySet } from "../relay/sets";
import { NDKPrivateKeySigner } from "../signers/private-key";

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

    describe("publish", () => {
        it("stores the relays where the event was successfully published to", async () => {
            const relay1 = new NDKRelay("wss://relay1.nos.dev");
            const relay2 = new NDKRelay("wss://relay2.nos.dev");
            const relay3 = new NDKRelay("wss://relay3.nos.dev");
            const relaySet = new NDKRelaySet(new Set([relay1, relay2, relay3]), ndk);
            relaySet.publish = jest.fn().mockResolvedValue(new Set([relay1, relay2]));

            event.kind = 5;
            await event.sign(NDKPrivateKeySigner.generate());
            const result = await event.publish(relaySet);
            expect(result).toEqual(new Set([relay1, relay2]));
        });
    });

    describe("deduplicationKey", () => {
        it("returns <kind>:<pubkey> for kinds 0", () => {
            event.kind = 0;
            const result = event.deduplicationKey();
            expect(result).toEqual(`0:${user1.pubkey}`);
        });

        it("returns <kind>:<pubkey> for kinds 3", () => {
            event.kind = 3;
            const result = event.deduplicationKey();
            expect(result).toEqual(`3:${user1.pubkey}`);
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
            const spy = jest.spyOn(event, "tagId").mockReturnValue("parameterizedTagId");
            const result = event.deduplicationKey();
            expect(result).toEqual("parameterizedTagId");
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe("tag", () => {
        it("tags a user without a marker", () => {
            event.tag(user2);
            expect(event.tags).toEqual([["p", user2.pubkey]]);
        });

        it("tags a user with a marker", () => {
            event.tag(user2, "author");
            expect(event.tags).toEqual([["p", user2.pubkey, "", "author"]]);
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
            expect(event.tags).toEqual([["e", otherEvent.id, "", "marker"]]);
        });

        it("tags an event author when it's different from the signing user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1 } as NostrEvent);
            otherEvent.author = user2;
            event.tag(otherEvent);
            expect(event.tags).toEqual([
                ["e", otherEvent.id],
                ["p", user2.pubkey],
            ]);
        });

        it("does not tag an event author when it's the same as the signing user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1, id: "abc" } as NostrEvent);
            otherEvent.author = user1;
            event.tag(otherEvent);
            expect(event.tags).toEqual([["e", otherEvent.id]]);
        });

        it("does not re-tag the same user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1, id: "abc" } as NostrEvent);
            otherEvent.author = user2;
            const otherEvent2 = new NDKEvent(ndk, { kind: 1, id: "def" } as NostrEvent);
            otherEvent2.author = user2;
            event.tag(otherEvent);
            event.tag(otherEvent2);
            expect(event.tags).toEqual([
                ["e", otherEvent.id],
                ["p", user2.pubkey],
                ["e", otherEvent2.id],
            ]);
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
                    sub.emit("event", event1, undefined, sub);
                    sub.emit("event", event2, undefined, sub);
                    sub.emit("eose", sub);
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
                        t[1] === "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
                );
                expect(mentionTag).toBeTruthy();
            });
        });
    });

    describe("referenceTags", () => {
        it("returns the correct tag for referencing the event", () => {
            const event1 = new NDKEvent(ndk, {
                created_at: Date.now() / 1000,
                content: "",
                kind: 30000,
                pubkey: "pubkey",
                tags: [["d", "d-code"]],
                id: "eventid1",
            });

            const event2 = new NDKEvent(ndk, {
                created_at: Date.now() / 1000,
                content: "",
                tags: [],
                kind: 1,
                pubkey: "pubkey",
                id: "eventid2",
            });

            expect(event1.referenceTags()).toEqual([
                ["a", "30000:pubkey:d-code"],
                ["e", "eventid1"],
                ["p", "pubkey"],
            ]);
            expect(event2.referenceTags()).toEqual([
                ["e", "eventid2"],
                ["p", "pubkey"],
            ]);
        });

        it("adds a marker to the reference tag if provided", () => {
            const nip33event = new NDKEvent(ndk, {
                kind: 30000,
                pubkey: "pubkey",
                tags: [["d", "d-code"]],
                id: "eventid1",
            } as NostrEvent);

            const event = new NDKEvent(ndk, {
                kind: 1,
                pubkey: "pubkey",
                id: "eventid2",
            } as NostrEvent);

            expect(nip33event.referenceTags("marker")).toEqual([
                ["a", "30000:pubkey:d-code", "", "marker"],
                ["e", "eventid1", "", "marker"],
                ["p", "pubkey"],
            ]);
            expect(event.referenceTags("marker")).toEqual([
                ["e", "eventid2", "", "marker"],
                ["p", "pubkey"],
            ]);
        });

        it("adds a marker to the reference tag if provided with relay if its set", () => {
            const relay = new NDKRelay("wss://relay.nos.dev/");
            const nip33event = new NDKEvent(ndk, {
                kind: 30000,
                pubkey: "pubkey",
                tags: [["d", "d-code"]],
                id: "eventid1",
            } as NostrEvent);
            nip33event.relay = relay;

            const event = new NDKEvent(ndk, {
                kind: 1,
                pubkey: "pubkey",
                id: "eventid2",
            } as NostrEvent);

            expect(nip33event.referenceTags("marker")).toEqual([
                ["a", "30000:pubkey:d-code", "wss://relay.nos.dev/", "marker"],
                ["e", "eventid1", "wss://relay.nos.dev/", "marker"],
                ["p", "pubkey"],
            ]);
            expect(event.referenceTags("marker")).toEqual([
                ["e", "eventid2", "", "marker"],
                ["p", "pubkey"],
            ]);
        });

        it("returns h tags if they are present", () => {
            const event = new NDKEvent(ndk, {
                kind: 1,
                pubkey: "pubkey",
                id: "eventid",
                tags: [["h", "group-id"]],
            } as NostrEvent);

            expect(event.referenceTags()).toEqual([
                ["e", "eventid"],
                ["h", "group-id"],
                ["p", "pubkey"],
            ]);
        });
    });

    describe("tagId", () => {
        it("returns the correct tagId for a given event", () => {
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

            expect(event1.tagId()).toEqual("30000:pubkey:d-code");
            expect(event2.tagId()).toEqual("eventid");
        });
    });

    describe("replacableDTag", () => {
        it("returns the correct tagId for a given event", () => {
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

            expect(event1.replaceableDTag()).toEqual("d-code");
            expect(() => event2.replaceableDTag()).toThrowError(
                "Event is not a parameterized replaceable event"
            );
        });
    });
});
