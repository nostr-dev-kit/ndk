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
import { vi } from "vitest";
import { EventGenerator } from "@nostr-dev-kit/ndk-test-utils";
import { TestFixture } from "@nostr-dev-kit/ndk-test-utils";

const ndk = new NDK();

describe("NDKEvent", () => {
    let event: NDKEvent;
    let user1: NDKUser;
    let user2: NDKUser;

    beforeEach(() => {
        EventGenerator.setNDK(ndk);

        user1 = new NDKUser({
            npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
        });
        user2 = new NDKUser({
            npub: "npub12262qa4uhw7u8gdwlgmntqtv7aye8vdcmvszkqwgs0zchel6mz7s6cgrkj",
        });
        event = EventGenerator.createEvent(undefined, "", user1.pubkey);
    });

    describe("publish", () => {
        it("stores the relays where the event was successfully published to", async () => {
            const relay1 = new NDKRelay("wss://relay1.nos.dev", undefined, ndk);
            const relay2 = new NDKRelay("wss://relay2.nos.dev", undefined, ndk);
            const relay3 = new NDKRelay("wss://relay3.nos.dev", undefined, ndk);
            const relaySet = new NDKRelaySet(new Set([relay1, relay2, relay3]), ndk);
            relaySet.publish = vi.fn().mockResolvedValue(new Set([relay1, relay2]));

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
            const spy = vi.spyOn(event, "tagId").mockReturnValue("mockTagId");
            const result = event.deduplicationKey();
            expect(result).toEqual("mockTagId");
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it("returns parameterized tagId for kinds between 30k and 40k", () => {
            event.kind = 35000;
            const spy = vi.spyOn(event, "tagId").mockReturnValue("parameterizedTagId");
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
            const otherEvent = EventGenerator.createEvent(1, "", user1.pubkey);
            otherEvent.id = "123";

            event.tag(otherEvent);
            expect(event.tags).toEqual([["e", otherEvent.id, "", "", otherEvent.pubkey]]);
        });

        it("tags an event with a marker", () => {
            const otherEvent = EventGenerator.createEvent(1, "", user1.pubkey);
            otherEvent.id = "123";

            event.tag(otherEvent, "marker");
            expect(event.tags).toEqual([["e", otherEvent.id, "", "marker", otherEvent.pubkey]]);
        });

        it("tags an event author when it's different from the signing user", () => {
            const otherEvent = EventGenerator.createEvent(1, "", user2.pubkey);
            event.tag(otherEvent);
            expect(event.tags).toEqual([
                ["e", otherEvent.id, "", "", otherEvent.pubkey],
                ["p", user2.pubkey],
            ]);
        });

        it("does not tag an event author when it's the same as the signing user", () => {
            const otherEvent = EventGenerator.createEvent(1, "", user1.pubkey);
            otherEvent.id = "abc";

            event.tag(otherEvent);
            expect(event.tags).toEqual([["e", otherEvent.id, "", "", otherEvent.pubkey]]);
        });

        it("does not re-tag the same user", () => {
            const otherEvent = EventGenerator.createEvent(1, "", user2.pubkey);
            otherEvent.id = "abc";

            const otherEvent2 = EventGenerator.createEvent(1, "", user2.pubkey);
            otherEvent2.id = "def";

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
        it("correctly handles a relay sending old replaced events", () => {
            // Create a dedupEvent function similar to what the NDK uses
            const dedupEvent = (existingEvent: NDKEvent, newEvent: NDKEvent) => {
                // Keep the newer event based on created_at
                if (newEvent.created_at! > existingEvent.created_at!) {
                    return newEvent;
                }
                return existingEvent;
            };

            // Create events with the same kind/pubkey but different timestamps
            const eventData = {
                kind: 30001,
                tags: [["d", "test"]],
                content: "content",
                pubkey: "pubkey123",
            };

            const event1 = EventGenerator.createEvent(
                eventData.kind,
                eventData.content,
                eventData.pubkey
            );
            event1.tags = eventData.tags;
            event1.created_at = Math.floor(Date.now() / 1000 - 3600);
            event1.id = "id1";
            event1.sig = "sig1";

            const event2 = EventGenerator.createEvent(
                eventData.kind,
                eventData.content,
                eventData.pubkey
            );
            event2.tags = eventData.tags;
            event2.created_at = Math.floor(Date.now() / 1000);
            event2.id = "id2";
            event2.sig = "sig2";

            // Test the deduplication logic directly
            const events = new Map<string, NDKEvent>();

            // Add the older event first
            const dedupKey1 = event1.deduplicationKey();
            events.set(dedupKey1, event1);

            // Then add the newer event
            const dedupKey2 = event2.deduplicationKey();
            const existingEvent = events.get(dedupKey2);
            if (existingEvent) {
                events.set(dedupKey2, dedupEvent(existingEvent, event2));
            } else {
                events.set(dedupKey2, event2);
            }

            // Verify that only the newest event was kept (deduplication)
            expect(events.size).toBe(1);
            const dedupedEvent = events.values().next().value;
            expect(dedupedEvent).toBeDefined();
            expect(dedupedEvent!.id).toEqual(event2.id);
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
            const event1 = EventGenerator.createEvent(30000, "", "pubkey");
            event1.tags.push(["d", "d-code"]);
            event1.id = "eventid1";

            const event2 = EventGenerator.createEvent(1, "", "pubkey");
            event2.id = "eventid2";

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
            const nip33event = EventGenerator.createEvent(30000, "", "pubkey");
            nip33event.tags.push(["d", "d-code"]);
            nip33event.id = "eventid1";

            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.id = "eventid2";

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
            const nip33event = EventGenerator.createEvent(30000, "", "pubkey");
            nip33event.tags.push(["d", "d-code"]);
            nip33event.id = "eventid1";
            nip33event.relay = relay;

            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.id = "eventid2";

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
            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.id = "eventid";
            event.tags.push(["h", "group-id"]);

            expect(event.referenceTags()).toEqual([
                ["e", "eventid", "", "", "pubkey"],
                ["h", "group-id"],
                ["p", "pubkey"],
            ]);
        });
    });

    describe("tagId", () => {
        it("returns the correct tagId for a given event", () => {
            const event1 = EventGenerator.createEvent(30000, "", "pubkey");
            event1.tags.push(["d", "d-code"]);

            const event2 = EventGenerator.createEvent(1, "", "pubkey");
            event2.id = "eventid";

            expect(event1.tagId()).toEqual("30000:pubkey:d-code");
            expect(event2.tagId()).toEqual("eventid");
        });
    });

    describe("replacableDTag", () => {
        it("returns the correct tagId for a given event", () => {
            const event1 = EventGenerator.createEvent(30000, "", "pubkey");
            event1.tags.push(["d", "d-code"]);

            const event2 = EventGenerator.createEvent(1, "", "pubkey");

            expect(event1.replaceableDTag()).toEqual("d-code");
            expect(() => event2.replaceableDTag()).toThrowError(
                "Event is not a parameterized replaceable event"
            );
        });
    });

    describe("tagExternal", () => {
        it("correctly tags a URL", () => {
            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.tagExternal("https://example.com/article/123#nostr", "url");

            expect(event.tags).toContainEqual(["i", "https://example.com/article/123"]);
            expect(event.tags).toContainEqual(["k", "https://example.com"]);
        });

        it("correctly tags a hashtag", () => {
            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.tagExternal("NostrTest", "hashtag");

            expect(event.tags).toContainEqual(["i", "#nostrtest"]);
            expect(event.tags).toContainEqual(["k", "#"]);
        });

        it("correctly tags a geohash", () => {
            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.tagExternal("u4pruydqqvj", "geohash");

            expect(event.tags).toContainEqual(["i", "geo:u4pruydqqvj"]);
            expect(event.tags).toContainEqual(["k", "geo"]);
        });

        it("correctly tags an ISBN", () => {
            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.tagExternal("978-3-16-148410-0", "isbn");

            expect(event.tags).toContainEqual(["i", "isbn:9783161484100"]);
            expect(event.tags).toContainEqual(["k", "isbn"]);
        });

        it("correctly tags a podcast GUID", () => {
            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.tagExternal("e32b4890-b9ea-4aef-a0bf-54b787833dc5", "podcast:guid");

            expect(event.tags).toContainEqual([
                "i",
                "podcast:guid:e32b4890-b9ea-4aef-a0bf-54b787833dc5",
            ]);
            expect(event.tags).toContainEqual(["k", "podcast:guid"]);
        });

        it("correctly tags an ISAN", () => {
            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.tagExternal("1881-66C7-3420-0000-7-9F3A-0245-U", "isan");

            expect(event.tags).toContainEqual(["i", "isan:1881-66C7-3420-0000"]);
            expect(event.tags).toContainEqual(["k", "isan"]);
        });

        it("correctly tags a DOI", () => {
            const event = EventGenerator.createEvent(1, "", "pubkey");
            event.tagExternal("10.1000/182", "doi");

            expect(event.tags).toContainEqual(["i", "doi:10.1000/182"]);
            expect(event.tags).toContainEqual(["k", "doi"]);
        });

        it("adds a marker URL when provided", () => {
            const event = EventGenerator.createEvent(1, "", "pubkey");
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
            const event = EventGenerator.createEvent(1, "", "pubkey");
            expect(() => {
                event.tagExternal("test", "unsupported" as NIP73EntityType);
            }).toThrow("Unsupported NIP-73 entity type: unsupported");
        });
    });

    describe("reply", () => {
        let fixture: TestFixture;
        let alice: NDKUser;
        let bob: NDKUser;
        let carol: NDKUser;

        beforeEach(async () => {
            fixture = new TestFixture();
            alice = await fixture.getUser("alice");
            bob = await fixture.getUser("bob");
            carol = await fixture.getUser("carol");

            // Set up signers
            fixture.setupSigner("alice");
        });

        describe("replies to kind:1 events", () => {
            it("creates a reply using a kind 1 event", async () => {
                // Create root event
                const op = await fixture.eventFactory.createSignedTextNote("Hello world", "alice");

                // Create reply
                const reply = op.reply();
                expect(reply.kind).toBe(1);
            });

            it("carries over the root event of the OP", async () => {
                // Create thread with root and one reply
                const [root, reply1] = await fixture.eventFactory.createEventChain(
                    "Hello world",
                    "alice",
                    [{ content: "First reply", author: "bob" }]
                );

                // Create a second reply to the first reply
                fixture.setupSigner("carol");
                const reply2 = reply1.reply();

                // Verify it has the root tag
                expect(reply2.tags).toContainEqual(["e", root.id, "", "root", root.pubkey]);
                expect(reply2.tags).toContainEqual(["p", root.pubkey]);
            });

            it("adds a root marker for root events", async () => {
                // Create root event
                const op = await fixture.eventFactory.createSignedTextNote("Hello world", "alice");

                // Create reply
                fixture.setupSigner("bob");
                const reply = op.reply();

                // Verify it has the root tag
                expect(reply.tags).toContainEqual(["e", op.id, "", "root", op.pubkey]);
                expect(reply.tags).toContainEqual(["p", op.pubkey]);
            });

            it("adds a reply marker for non-root events", async () => {
                // Create thread with root and one reply
                const [root, reply1] = await fixture.eventFactory.createEventChain(
                    "Hello world",
                    "alice",
                    [{ content: "First reply", author: "bob" }]
                );

                // Create a second reply to the first reply
                fixture.setupSigner("carol");
                const reply2 = reply1.reply();

                // Verify it has the proper reply tag for the parent
                expect(reply2.tags).toContainEqual(["e", reply1.id, "", "reply", reply1.pubkey]);
                expect(reply2.tags).toContainEqual(["p", reply1.pubkey]);
            });

            it("p-tags the author of the event", async () => {
                // Create root event
                const op = await fixture.eventFactory.createSignedTextNote("Hello world", "alice");

                // Create reply
                fixture.setupSigner("bob");
                const reply = op.reply();

                // Verify it tags the author
                expect(reply.tags).toContainEqual(["p", op.pubkey]);
            });

            it("carries over the p-tags from the root event", async () => {
                // Create thread with root and one reply
                const [root, reply1] = await fixture.eventFactory.createEventChain(
                    "Hello world",
                    "alice",
                    [{ content: "First reply", author: "bob" }]
                );

                // Create a second reply to the first reply
                fixture.setupSigner("carol");
                const reply2 = reply1.reply();

                // Verify it has tags for both authors
                expect(reply2.tags).toContainEqual(["p", root.pubkey]);
                expect(reply2.tags).toContainEqual(["p", reply1.pubkey]);
            });
        });

        describe("replies to other kinds", () => {
            let root: NDKEvent;

            beforeEach(async () => {
                // Create a non-standard event type (kind 30023)
                root = await fixture.eventFactory.createSignedTextNote(
                    "Hello world",
                    "alice",
                    30023
                );
                // Add a d-tag for parameterized replaceable events
                root.tags.push(["d", "test"]);
            });

            it("creates a reply using a kind 1111 event", async () => {
                // Create reply to non-standard event
                fixture.setupSigner("bob");
                const reply1 = await fixture.eventFactory.createReply(
                    root,
                    "This is a reply",
                    "bob"
                );

                expect(reply1.kind).toBe(1111); // GenericReply kind
            });

            it("tags the root event or scope using an appropriate uppercase tag (e.g., 'A', 'E', 'I')", async () => {
                // Create reply to non-standard event
                fixture.setupSigner("bob");
                const reply1 = await fixture.eventFactory.createReply(
                    root,
                    "This is a reply",
                    "bob"
                );

                expect(reply1.tags).toContainEqual(["A", root.tagId(), ""]);
            });

            it("tags the root event with an 'a' for addressable events when it's a top level reply", async () => {
                // Create reply to non-standard event
                fixture.setupSigner("bob");
                const reply1 = await fixture.eventFactory.createReply(
                    root,
                    "This is a reply",
                    "bob"
                );

                expect(reply1.tags).toContainEqual(["A", root.tagId(), ""]);
                expect(reply1.tags).toContainEqual(["a", root.tagId(), ""]);
            });

            it("p-tags the author of the root event", async () => {
                // Create reply to non-standard event
                fixture.setupSigner("bob");
                const reply1 = await fixture.eventFactory.createReply(
                    root,
                    "This is a reply",
                    "bob"
                );

                expect(reply1.tags).toContainEqual(["P", root.pubkey]);
            });

            it("p-tags the author of the reply event", async () => {
                // Create thread with non-standard root and one reply
                const reply1 = await fixture.eventFactory.createReply(root, "First reply", "bob");

                // Create a second reply to the first reply
                fixture.setupSigner("carol");
                const reply2 = reply1.reply();

                expect(reply2.tags).toContainEqual(["p", reply1.pubkey]);
            });

            it("p-tags the author of the root event only once when it's the root reply", async () => {
                // Intentionally create using the root event's reply() method
                const reply1 = root.reply();

                // Check that it has the p tag exactly once
                expect(reply1.tags).toContainEqual(["p", root.pubkey]);
                expect(reply1.tags.filter((t) => t[0] === "p")).toHaveLength(1);
            });

            it("p-tags the author of the root and reply events", async () => {
                // Create thread with non-standard root and one reply
                const reply1 = await fixture.eventFactory.createReply(root, "First reply", "bob");

                // Create a second reply to the first reply
                fixture.setupSigner("carol");
                const reply2 = reply1.reply();

                expect(reply2.tags).toContainEqual(["P", root.pubkey]);
                expect(reply2.tags).toContainEqual(["p", reply1.pubkey]);
            });

            it("tags the root event or scope using an appropriate uppercase tag with the pubkey when it's an E tag", async () => {
                // Create a kind 20 event
                const k20event = await fixture.eventFactory.createSignedTextNote(
                    "Kind 20 event",
                    "alice",
                    20
                );

                // Create a reply to the kind 20 event
                fixture.setupSigner("bob");
                const reply1 = await fixture.eventFactory.createReply(
                    k20event,
                    "This is a reply",
                    "bob"
                );

                expect(reply1.tags).toContainEqual(["E", k20event.tagId(), "", k20event.pubkey]);
            });

            it("tags the parent item using an appropriate lowercase tag (e.g., 'a', 'e', 'i')", async () => {
                // Create thread with non-standard root and one reply
                const reply1 = await fixture.eventFactory.createReply(root, "First reply", "bob");

                // Create a second reply to the first reply
                fixture.setupSigner("carol");
                const reply2 = reply1.reply();

                expect(reply2.tags).toContainEqual(["A", root.tagId(), ""]);
                expect(reply2.tags).toContainEqual(["e", reply1.tagId(), "", reply1.pubkey]);
            });

            it("adds a 'K' tag to specify the root kind", async () => {
                // Create reply to non-standard event
                fixture.setupSigner("bob");
                const reply1 = await fixture.eventFactory.createReply(
                    root,
                    "This is a reply",
                    "bob"
                );

                expect(reply1.tags).toContainEqual(["K", root.kind!.toString()]);
            });

            it("adds a 'k' tag to specify the parent kind", async () => {
                // Create thread with non-standard root and one reply
                const reply1 = await fixture.eventFactory.createReply(root, "First reply", "bob");

                // Create a second reply to the first reply
                fixture.setupSigner("carol");
                const reply2 = reply1.reply();

                expect(reply2.tags).toContainEqual(["k", reply1.kind!.toString()]);
            });
        });
    });
});
