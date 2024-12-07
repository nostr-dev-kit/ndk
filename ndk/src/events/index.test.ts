import type { NostrEvent } from ".";
import { NDKEvent } from ".";
import { NDK } from "../ndk";
import { NDKRelay } from "../relay";
import { NDKSubscription } from "../subscription";
import { NDKUser } from "../user";
import { NDKRelaySet } from "../relay/sets";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { NIP73EntityType } from "./nip73";
import { NDKSigner } from "../signers";
import { NDKKind } from "./kinds";

const ndk = new NDK();

describe("NDKEvent", () => {
    let event: NDKEvent;
    let user1: NDKUser;
    let user2: NDKUser;

    beforeEach(() => {
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
            const relay1 = new NDKRelay("wss://relay1.nos.dev", undefined, ndk);
            const relay2 = new NDKRelay("wss://relay2.nos.dev", undefined, ndk);
            const relay3 = new NDKRelay("wss://relay3.nos.dev", undefined, ndk);
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
            expect(event.tags).toEqual([["e", otherEvent.id, "", "", otherEvent.pubkey]]);
        });

        it("tags an event with a marker", () => {
            const otherEvent = new NDKEvent(ndk, {
                id: "123",
                kind: 1,
            } as NostrEvent);
            otherEvent.author = user1;
            event.tag(otherEvent, "marker");
            expect(event.tags).toEqual([["e", otherEvent.id, "", "marker", otherEvent.pubkey]]);
        });

        it("tags an event author when it's different from the signing user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1 } as NostrEvent);
            otherEvent.author = user2;
            event.tag(otherEvent);
            expect(event.tags).toEqual([
                ["e", otherEvent.id, "", "", otherEvent.pubkey],
                ["p", user2.pubkey],
            ]);
        });

        it("does not tag an event author when it's the same as the signing user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1, id: "abc" } as NostrEvent);
            otherEvent.author = user1;
            event.tag(otherEvent);
            expect(event.tags).toEqual([["e", otherEvent.id, "", "", otherEvent.pubkey]]);
        });

        it("does not re-tag the same user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1, id: "abc" } as NostrEvent);
            otherEvent.author = user2;
            const otherEvent2 = new NDKEvent(ndk, { kind: 1, id: "def" } as NostrEvent);
            otherEvent2.author = user2;
            event.tag(otherEvent);
            event.tag(otherEvent2);
            expect(event.tags).toEqual([
                ["e", otherEvent.id, "", "", otherEvent.pubkey],
                ["p", user2.pubkey],
                ["e", otherEvent2.id, "", "", otherEvent2.pubkey],
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
                ["e", "eventid1", "", "", "pubkey"],
                ["p", "pubkey"],
            ]);
            expect(event2.referenceTags()).toEqual([
                ["e", "eventid2", "", "", "pubkey"],
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
                ["e", "eventid1", "", "marker", "pubkey"],
                ["p", "pubkey"],
            ]);
            expect(event.referenceTags("marker")).toEqual([
                ["e", "eventid2", "", "marker", "pubkey"],
                ["p", "pubkey"],
            ]);
        });

        it("adds a marker to the reference tag if provided with relay if its set", () => {
            const relay = new NDKRelay("wss://relay.nos.dev/", undefined, ndk);
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
                ["e", "eventid1", "wss://relay.nos.dev/", "marker", "pubkey"],
                ["p", "pubkey"],
            ]);
            expect(event.referenceTags("marker")).toEqual([
                ["e", "eventid2", "", "marker", "pubkey"],
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
                ["e", "eventid", "", "", "pubkey"],
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

    describe("tagExternal", () => {
        it("correctly tags a URL", () => {
            const event = new NDKEvent(ndk);
            event.tagExternal("https://example.com/article/123#nostr", "url");

            expect(event.tags).toContainEqual(["i", "https://example.com/article/123"]);
            expect(event.tags).toContainEqual(["k", "https://example.com"]);
        });

        it("correctly tags a hashtag", () => {
            const event = new NDKEvent(ndk);
            event.tagExternal("NostrTest", "hashtag");

            expect(event.tags).toContainEqual(["i", "#nostrtest"]);
            expect(event.tags).toContainEqual(["k", "#"]);
        });

        it("correctly tags a geohash", () => {
            const event = new NDKEvent(ndk);
            event.tagExternal("u4pruydqqvj", "geohash");

            expect(event.tags).toContainEqual(["i", "geo:u4pruydqqvj"]);
            expect(event.tags).toContainEqual(["k", "geo"]);
        });

        it("correctly tags an ISBN", () => {
            const event = new NDKEvent(ndk);
            event.tagExternal("978-3-16-148410-0", "isbn");

            expect(event.tags).toContainEqual(["i", "isbn:9783161484100"]);
            expect(event.tags).toContainEqual(["k", "isbn"]);
        });

        it("correctly tags a podcast GUID", () => {
            const event = new NDKEvent(ndk);
            event.tagExternal("e32b4890-b9ea-4aef-a0bf-54b787833dc5", "podcast:guid");

            expect(event.tags).toContainEqual([
                "i",
                "podcast:guid:e32b4890-b9ea-4aef-a0bf-54b787833dc5",
            ]);
            expect(event.tags).toContainEqual(["k", "podcast:guid"]);
        });

        it("correctly tags an ISAN", () => {
            const event = new NDKEvent(ndk);
            event.tagExternal("1881-66C7-3420-0000-7-9F3A-0245-U", "isan");

            expect(event.tags).toContainEqual(["i", "isan:1881-66C7-3420-0000"]);
            expect(event.tags).toContainEqual(["k", "isan"]);
        });

        it("correctly tags a DOI", () => {
            const event = new NDKEvent(ndk);
            event.tagExternal("10.1000/182", "doi");

            expect(event.tags).toContainEqual(["i", "doi:10.1000/182"]);
            expect(event.tags).toContainEqual(["k", "doi"]);
        });

        it("adds a marker URL when provided", () => {
            const event = new NDKEvent(ndk);
            event.tagExternal(
                "e32b4890-b9ea-4aef-a0bf-54b787833dc5",
                "podcast:guid",
                "https://example.com/marker"
            );

            expect(event.tags).toContainEqual([
                "i",
                "podcast:guid:e32b4890-b9ea-4aef-a0bf-54b787833dc5",
                "https://example.com/marker",
            ]);
            expect(event.tags).toContainEqual(["k", "podcast:guid"]);
        });

        it("throws an error for unsupported entity types", () => {
            const event = new NDKEvent(ndk);
            expect(() => {
                event.tagExternal("test", "unsupported" as NIP73EntityType);
            }).toThrow("Unsupported NIP-73 entity type: unsupported");
        });
    });

    fdescribe("reply", () => {
        const signers = [0,1,2].map(i => NDKPrivateKeySigner.generate());
        let users: NDKUser[];

        beforeEach(async () => {
            users = await Promise.all(signers.map(s => s.user()));
        });

        const sign = async (event: Partial<NostrEvent>, signer = signers[0]) => {
            const e = new NDKEvent(ndk, event as NostrEvent);
            await e.sign(signer);
            return e;
        };

        const reply = async (event: NDKEvent, signer: NDKSigner) => {
            const reply = event.reply();
            await reply.sign(signer);
            return reply;
        }

        describe("replies to kind:1 events", () => {
            it("creates a reply using a kind 1 event", async () => {
                const op = await sign({ kind: 1 });
                const reply = op.reply();
                expect(reply.kind).toBe(1);
            });
                
            it('carries over the root event of the OP', async () => {
                const root = await sign({ kind: 1 });
                const reply1 = await reply(root, signers[1]);
                const reply2 = reply1.reply();
                
                expect(reply2.tags).toContainEqual(['e', root.id, '', 'root', root.pubkey]);
                expect(reply2.tags).toContainEqual(['p', root.pubkey]);
            });

            it('adds a root marker for root events', async () => {
                const op = await sign({ kind: 1 });
                const reply = op.reply();
                expect(reply.tags).toContainEqual(['e', op.id, '', 'root', op.pubkey]);
                expect(reply.tags).toContainEqual(['p', op.pubkey]);
            });

            it('adds a reply marker for non-root events', async () => {
                const op = await sign({ kind: 1 });
                const reply1 = await reply(op, signers[1]);
                const reply2 = reply1.reply();
                expect(reply2.tags).toContainEqual(['e', reply1.id, '', 'reply', reply1.pubkey]);
                expect(reply2.tags).toContainEqual(['p', reply1.pubkey]);
            });
        });
    
        describe("replies to other kinds", () => {
            let root: NDKEvent;
            beforeAll(async () => {
                root = await sign({ kind: 30023 });
            });
            
            it("creates a reply using a kind 1111 event", async () => {
                const reply1 = await reply(root, signers[1]);
                expect(reply1.kind).toBe(NDKKind.GenericReply);
            });

            it("tags the root event or scope using an appropriate uppercase tag (e.g., 'A', 'E', 'I')", async () => {
                const reply1 = await reply(root, signers[1]);
                expect(reply1.tags).toContainEqual(['A', root.tagId(), ""]);
            });

            it("tags the root event with an 'a' for addressable events when it's a top level reply", async () => {
                const root = await sign({ kind: 30023 });
                const reply1 = root.reply();
                expect(reply1.tags).toContainEqual(['A', root.tagId(), ""]);
                expect(reply1.tags).toContainEqual(['a', root.tagId(), ""]);
            });

            it("p-tags the author of the root event", async () => {
                const root = await sign({ kind: 30023 });
                const reply1 = root.reply();
                expect(reply1.tags).toContainEqual(['p', root.pubkey]);
            });

            it('p-tags the author of the reply event', async () => {
                const root = await sign({ kind: 30023 });
                const reply1 = await reply(root, signers[1]);
                const reply2 = reply1.reply();
                expect(reply2.tags).toContainEqual(['p', reply1.pubkey]);
            });

            it("p-tags the author of the root event only once when it's the root reply", async () => {
                const root = await sign({ kind: 30023 });
                const reply1 = root.reply();
                expect(reply1.tags).toContainEqual(['p', root.pubkey]);
                expect(reply1.tags.filter(t => t[0] === 'p')).toHaveLength(1);
            });

            it('p-tags the author of the root and reply events', async () => {
                const reply1 = await reply(root, signers[1]);
                const reply2 = reply1.reply();
                expect(reply2.tags).toContainEqual(['p', root.pubkey]);
                expect(reply2.tags).toContainEqual(['p', reply1.pubkey]);
            });

            it("tags the root event or scope using an appropriate uppercase tag with the pubkey when it's an E tag", async () => {
                const root = await sign({ kind: 20 }, signers[0]);
                const reply1 = await reply(root, signers[1]);
                expect(reply1.tags).toContainEqual(['E', root.tagId(), "", root.pubkey]);
            });

            it("tags the parent item using an appropriate lowercase tag (e.g., 'a', 'e', 'i')", async () => {
                const reply1 = await reply(root, signers[1]);
                const reply2 = reply1.reply();
                expect(reply2.tags).toContainEqual(['A', root.tagId(), ""]);
                expect(reply2.tags).toContainEqual(['e', reply1.tagId(), "", reply1.pubkey]);
            });

            it("adds a 'K' tag to specify the root kind", async () => {
                const reply1 = await reply(root, signers[1]);
                expect(reply1.tags).toContainEqual(['K', root.kind!.toString()]);
            });

            it("adds a 'k' tag to specify the parent kind", async () => {
                const reply1 = await reply(root, signers[1]);
                const reply2 = reply1.reply();
                expect(reply2.tags).toContainEqual(['k', reply1.kind!.toString()]);
            });
        });
    });
    
});
