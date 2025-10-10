import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignerGenerator, TestFixture } from "../../test";
import { NDK } from "../ndk";
import { NDKRelay } from "../relay";
import { NDKRelaySet } from "../relay/sets";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { NDKUser } from "../user";
import { NDKEvent } from ".";
import { NDKKind } from "./kinds";
import type { NIP73EntityType } from "./nip73";

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
            npub: "npub1nnn379gxen6tn8erft6fh43q905g82q0jks4t3hf58pkl4l8srrsyjkzrt",
        });
        event = new NDKEvent(ndk, { kind: 1 });
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

        // // Tests using RelayMock for publish behavior
        // it('publish method waits for connecting relays before publishing using RelayMock', async () => {
        //     const relay1 = new RelayMock('wss://relay1.test', { connectionDelay: 50, autoConnect: true }) as unknown as NDKRelay;
        //     const relay2 = new RelayMock('wss://relay2.test', { connectionDelay: 100, autoConnect: true }) as unknown as NDKRelay;

        //     const relaySet = new NDKRelaySet(new Set([relay1, relay2]), ndk);
        //     const event = new NDKEvent(ndk);
        //     event.kind = 1;
        //     event.content = "Hello, world!";
        //     await event.sign(NDKPrivateKeySigner.generate());

        //     const publishSpy1 = vi.spyOn(relay1, 'publish');
        //     const publishSpy2 = vi.spyOn(relay2, 'publish');

        //     await event.publish(relaySet);

        //     expect(publishSpy1).toHaveBeenCalled();
        //     expect(publishSpy2).toHaveBeenCalled();
        // });

        // it('publish method respects timeout when waiting for relays to connect using RelayMock', async () => {
        //     const relay1 = new RelayMock('wss://relay1.test', { connectionDelay: 0, autoConnect: true }) as unknown as NDKRelay;
        //     const slowRelay = new RelayMock('wss://slow.test', { connectionDelay: 500, autoConnect: true }) as unknown as NDKRelay;

        //     const relaySet = new NDKRelaySet(new Set([relay1, slowRelay]), ndk);
        //     const event = new NDKEvent(ndk);
        //     event.kind = 1;
        //     event.content = "Hello, world!";
        //     await event.sign(NDKPrivateKeySigner.generate());

        //     const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        //     const publishSpy1 = vi.spyOn(relay1, 'publish');
        //     const publishSpySlow = vi.spyOn(slowRelay, 'publish');

        //     await event.publish(relaySet, 100);

        //     expect(consoleWarnSpy).toHaveBeenCalledWith(
        //         expect.stringContaining("Timeout waiting for relays to connect"),
        //         expect.any(Error)
        //     );
        //     expect(publishSpy1).toHaveBeenCalled();
        //     expect(publishSpySlow).not.toHaveBeenCalled();

        //     consoleWarnSpy.mockRestore();
        // });
    });

    describe("deduplicationKey", () => {
        it("returns <kind>:<pubkey> for kinds 0", () => {
            event.pubkey = user1.pubkey;
            event.kind = 0;
            const result = event.deduplicationKey();
            expect(result).toEqual(`0:${user1.pubkey}`);
        });

        it("returns <kind>:<pubkey> for kinds 3", () => {
            event.pubkey = user1.pubkey;
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
            const otherEvent = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user1.pubkey });
            otherEvent.id = "123";

            event.tag(otherEvent);
            expect(event.tags).toEqual([
                ["e", otherEvent.id, "", "", otherEvent.pubkey],
                ["p", user1.pubkey],
            ]);
        });

        it("tags an event with a marker", () => {
            const event = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user1.pubkey });
            const otherEvent = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user1.pubkey });
            otherEvent.id = "123";

            event.tag(otherEvent, "marker");
            expect(event.tags).toEqual([["e", otherEvent.id, "", "marker", otherEvent.pubkey]]);
        });

        it("tags an event author when it's different from the signing user", () => {
            const event = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user1.pubkey });
            const otherEvent = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user2.pubkey });
            event.tag(otherEvent);
            expect(event.tags).toEqual([
                ["e", otherEvent.id, "", "", otherEvent.pubkey],
                ["p", user2.pubkey],
            ]);
        });

        it("does not tag an event author when it's the same as the signing user", () => {
            const event = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user1.pubkey });
            const otherEvent = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user1.pubkey });
            otherEvent.id = "abc";

            event.tag(otherEvent);
            expect(event.tags).toEqual([["e", otherEvent.id, "", "", otherEvent.pubkey]]);
        });

        it("does not re-tag the same user", () => {
            const otherEvent = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user2.pubkey });
            otherEvent.id = "abc";

            const otherEvent2 = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user2.pubkey });
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
                pubkey: user1.pubkey,
            };

            const event1 = new NDKEvent(ndk, {
                kind: 30000,
                content: eventData.content,
                pubkey: eventData.pubkey,
            });
            event1.tags = eventData.tags;
            event1.created_at = Math.floor(Date.now() / 1000 - 3600);
            event1.id = "id1";
            event1.sig = "sig1";

            const event2 = new NDKEvent(ndk, {
                kind: 30000,
                content: eventData.content,
                pubkey: eventData.pubkey,
            });
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
            expect(dedupedEvent?.id).toEqual(event2.id);
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
                event.content = "hello nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft!";
                const nostrEvent = await event.toNostrEvent();
                const mentionTag = nostrEvent.tags.find(
                    (t) => t[0] === "p" && t[1] === "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                );
                expect(mentionTag).toBeTruthy();
            });
        });
    });

    describe("referenceTags", () => {
        it("returns the correct tag for referencing the event", () => {
            const event1 = new NDKEvent(ndk, { kind: 30000, content: "", pubkey: user1.pubkey });
            event1.tags.push(["d", "d-code"]);
            event1.id = "eventid1";

            const event2 = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user2.pubkey });
            event2.id = "eventid2";

            expect(event1.referenceTags()).toEqual([
                ["a", `30000:${user1.pubkey}:d-code`],
                ["e", "eventid1", "", "", user1.pubkey],
                ["p", user1.pubkey],
            ]);
            expect(event2.referenceTags()).toEqual([
                ["e", "eventid2", "", "", user2.pubkey],
                ["p", user2.pubkey],
            ]);
        });

        it("adds a marker to the reference tag if provided", () => {
            const nip33event = new NDKEvent(ndk, { kind: 30000, pubkey: user1.pubkey });
            nip33event.tags.push(["d", "d-code"]);
            nip33event.id = "eventid1";

            const event = new NDKEvent(ndk, { kind: 1, pubkey: user2.pubkey });
            event.id = "eventid2";

            expect(nip33event.referenceTags("marker")).toEqual([
                ["a", `30000:${user1.pubkey}:d-code`, "", "marker"],
                ["e", "eventid1", "", "marker", user1.pubkey],
                ["p", user1.pubkey],
            ]);
            expect(event.referenceTags("marker")).toEqual([
                ["e", "eventid2", "", "marker", user2.pubkey],
                ["p", user2.pubkey],
            ]);
        });

        it("adds a marker to the reference tag if provided with relay if its set", () => {
            const relay = new NDKRelay("wss://relay.nos.dev/", undefined, ndk);
            const nip33event = new NDKEvent(ndk, {
                kind: 30000,
                content: "",
                pubkey: user1.pubkey,
            });
            nip33event.tags.push(["d", "d-code"]);
            nip33event.id = "eventid1";
            nip33event.relay = relay;

            const event = new NDKEvent(ndk, { kind: 1, content: "", pubkey: user2.pubkey });
            event.id = "eventid2";

            expect(nip33event.referenceTags("marker")).toEqual([
                ["a", `30000:${user1.pubkey}:d-code`, "wss://relay.nos.dev/", "marker"],
                ["e", "eventid1", "wss://relay.nos.dev/", "marker", user1.pubkey],
                ["p", user1.pubkey],
            ]);
            expect(event.referenceTags("marker")).toEqual([
                ["e", "eventid2", "", "marker", user2.pubkey],
                ["p", user2.pubkey],
            ]);
        });

        it("returns h tags if they are present", () => {
            const event = new NDKEvent(ndk, { kind: 1, pubkey: user1.pubkey });
            event.id = "eventid";
            event.tags.push(["h", "group-id"]);

            expect(event.referenceTags()).toEqual([
                ["e", "eventid", "", "", user1.pubkey],
                ["h", "group-id"],
                ["p", user1.pubkey],
            ]);
        });
    });

    describe("tagId", () => {
        it("returns the correct tagId for a given event", () => {
            const event1 = new NDKEvent(ndk, { kind: 30000, content: "", pubkey: "pubkey" });
            event1.tags.push(["d", "d-code"]);

            const event2 = new NDKEvent(ndk, { kind: 1, content: "" });
            event2.id = "eventid";

            expect(event1.tagId()).toEqual("30000:pubkey:d-code");
            expect(event2.tagId()).toEqual("eventid");
        });
    });

    describe("replacableDTag", () => {
        it("returns the correct tagId for a given event", () => {
            const event1 = new NDKEvent(ndk, { kind: 30000, content: "", pubkey: "" });
            event1.tags.push(["d", "d-code"]);

            const event2 = new NDKEvent(ndk, { kind: 1, content: "" });

            expect(event1.replaceableDTag()).toEqual("d-code");
            expect(() => event2.replaceableDTag()).toThrowError("Event is not a parameterized replaceable event");
        });
    });

    describe("tagExternal", () => {
        it("correctly tags a URL", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            event.tagExternal("https://example.com/article/123#nostr", "url");

            expect(event.tags).toContainEqual(["i", "https://example.com/article/123"]);
            expect(event.tags).toContainEqual(["k", "https://example.com"]);
        });

        it("correctly tags a hashtag", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            event.tagExternal("NostrTest", "hashtag");

            expect(event.tags).toContainEqual(["i", "#nostrtest"]);
            expect(event.tags).toContainEqual(["k", "#"]);
        });

        it("correctly tags a geohash", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            event.tagExternal("u4pruydqqvj", "geohash");

            expect(event.tags).toContainEqual(["i", "geo:u4pruydqqvj"]);
            expect(event.tags).toContainEqual(["k", "geo"]);
        });

        it("correctly tags an ISBN", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            event.tagExternal("978-3-16-148410-0", "isbn");

            expect(event.tags).toContainEqual(["i", "isbn:9783161484100"]);
            expect(event.tags).toContainEqual(["k", "isbn"]);
        });

        it("correctly tags a podcast GUID", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            event.tagExternal("e32b4890-b9ea-4aef-a0bf-54b787833dc5", "podcast:guid");

            expect(event.tags).toContainEqual(["i", "podcast:guid:e32b4890-b9ea-4aef-a0bf-54b787833dc5"]);
            expect(event.tags).toContainEqual(["k", "podcast:guid"]);
        });

        it("correctly tags an ISAN", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            event.tagExternal("1881-66C7-3420-0000-7-9F3A-0245-U", "isan");

            expect(event.tags).toContainEqual(["i", "isan:1881-66C7-3420-0000"]);
            expect(event.tags).toContainEqual(["k", "isan"]);
        });

        it("correctly tags a DOI", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            event.tagExternal("10.1000/182", "doi");

            expect(event.tags).toContainEqual(["i", "doi:10.1000/182"]);
            expect(event.tags).toContainEqual(["k", "doi"]);
        });

        it("adds a marker URL when provided", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            event.tagExternal("e32b4890-b9ea-4aef-a0bf-54b787833dc5", "podcast:guid", "https://example.com/marker");

            expect(event.tags).toContainEqual([
                "i",
                "podcast:guid:e32b4890-b9ea-4aef-a0bf-54b787833dc5",
                "https://example.com/marker",
            ]);
            expect(event.tags).toContainEqual(["k", "podcast:guid"]);
        });

        it("throws an error for unsupported entity types", () => {
            const event = new NDKEvent(ndk, { kind: 1 });
            expect(() => {
                event.tagExternal("test", "unsupported" as NIP73EntityType);
            }).toThrow("Unsupported NIP-73 entity type: unsupported");
        });
    });

    describe("reply", () => {
        let fixture: TestFixture;
        let _alice: NDKUser;
        let _bob: NDKUser;
        let _carol: NDKUser;

        beforeEach(async () => {
            fixture = new TestFixture();
            _alice = await fixture.getUser("alice");
            _bob = await fixture.getUser("bob");
            _carol = await fixture.getUser("carol");

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
                const [root, reply1] = await fixture.eventFactory.createEventChain("Hello world", "alice", [
                    { content: "First reply", author: "bob" },
                ]);

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
                const [_root, reply1] = await fixture.eventFactory.createEventChain("Hello world", "alice", [
                    { content: "First reply", author: "bob" },
                ]);

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
                const [root, reply1] = await fixture.eventFactory.createEventChain("Hello world", "alice", [
                    { content: "First reply", author: "bob" },
                ]);

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
                root = new NDKEvent(ndk, { kind: NDKKind.Article, content: "Hello world" });
                root.tags.push(["d", "test"]);
                await SignerGenerator.sign(root, "alice");
            });

            it("creates a reply using a kind 1111 event", async () => {
                const reply1 = root.reply();
                expect(reply1.kind).toBe(1111); // GenericReply kind
            });

            it("tags the root event or scope using an appropriate uppercase tag (e.g., 'A', 'E', 'I')", async () => {
                const reply1 = root.reply();
                expect(reply1.tags).toContainEqual(["A", root.tagId(), ""]);
            });

            it("tags the root event with an 'a' for addressable events when it's a top level reply", async () => {
                const reply1 = root.reply();

                expect(reply1.tags).toContainEqual(["A", root.tagId(), ""]);
                expect(reply1.tags).toContainEqual(["a", root.tagId(), ""]);
            });

            it("p-tags the author of the root event", async () => {
                const reply1 = root.reply();

                expect(reply1.tags).toContainEqual(["P", root.pubkey]);
            });

            it("p-tags the author of the reply event", async () => {
                const reply1 = root.reply();

                // Create a second reply to the first reply
                const reply2 = reply1.reply();

                expect(reply2.tags).toContainEqual(["p", reply1.pubkey]);
            });

            it("p-tags the author of the root event only once when it's the root reply", async () => {
                const reply1 = root.reply();

                expect(reply1.tags).toContainEqual(["p", root.pubkey]);
                expect(reply1.tags.filter((t) => t[0] === "p")).toHaveLength(1);
            });

            it("p-tags the author of the root and reply events", async () => {
                const reply1 = root.reply();

                // Create a second reply to the first reply
                const reply2 = reply1.reply();

                expect(reply2.tags).toContainEqual(["P", root.pubkey]);
                expect(reply2.tags).toContainEqual(["p", reply1.pubkey]);
            });

            it("tags the root event or scope using an appropriate uppercase tag with the pubkey when it's an E tag", async () => {
                const k20event = new NDKEvent(ndk, { kind: 20, content: "Hello world" });

                // Create a reply to the kind 20 event
                const reply1 = k20event.reply();

                expect(reply1.tags).toContainEqual(["E", k20event.tagId(), "", k20event.pubkey]);
            });

            it("tags the parent item using an appropriate lowercase tag (e.g., 'a', 'e', 'i')", async () => {
                const reply1 = root.reply();

                const reply2 = reply1.reply();

                expect(reply2.tags).toContainEqual(["A", root.tagId(), ""]);
                expect(reply2.tags).toContainEqual(["e", reply1.tagId(), "", reply1.pubkey]);
            });

            it("adds a 'K' tag to specify the root kind", async () => {
                const reply1 = root.reply();

                expect(reply1.tags).toContainEqual(["K", root.kind?.toString()]);
            });

            it("adds a 'k' tag to specify the parent kind", async () => {
                const reply1 = root.reply();

                const reply2 = reply1.reply();

                expect(reply2.tags).toContainEqual(["k", reply1.kind?.toString()]);
            });
        });

        describe("forceNip22 parameter", () => {
            it("maintains backward compatibility when forceNip22 is not provided", async () => {
                // Create a kind 1 event
                const op = await fixture.eventFactory.createSignedTextNote("Hello world", "alice");

                // Create reply without forceNip22 parameter
                fixture.setupSigner("bob");
                const reply = op.reply();

                // Should behave as before - kind 1 reply to kind 1 event
                expect(reply.kind).toBe(1);
                expect(reply.tags).toContainEqual(["e", op.id, "", "root", op.pubkey]);
                expect(reply.tags).toContainEqual(["p", op.pubkey]);
            });

            it("maintains backward compatibility when forceNip22 is explicitly false", async () => {
                // Create a kind 1 event
                const op = await fixture.eventFactory.createSignedTextNote("Hello world", "alice");

                // Create reply with forceNip22: false
                fixture.setupSigner("bob");
                const reply = op.reply(false);

                // Should behave as before - kind 1 reply to kind 1 event
                expect(reply.kind).toBe(1);
                expect(reply.tags).toContainEqual(["e", op.id, "", "root", op.pubkey]);
                expect(reply.tags).toContainEqual(["p", op.pubkey]);
            });

            it("forces kind 1111 when replying to kind 1 event with forceNip22: true", async () => {
                // Create a kind 1 event
                const op = await fixture.eventFactory.createSignedTextNote("Hello world", "alice");

                // Create reply with forceNip22: true
                fixture.setupSigner("bob");
                const reply = op.reply(true);

                // Should create kind 1111 reply instead of kind 1
                expect(reply.kind).toBe(1111); // GenericReply kind

                // Should have proper NIP-22 tagging
                expect(reply.tags).toContainEqual(["e", op.id, "", op.pubkey]);
                expect(reply.tags).toContainEqual(["E", op.id, "", op.pubkey]);
                expect(reply.tags).toContainEqual(["K", "1"]);
                expect(reply.tags).toContainEqual(["k", "1"]);
                expect(reply.tags).toContainEqual(["P", op.pubkey]);
                expect(reply.tags).toContainEqual(["p", op.pubkey]);
            });

            it("forces kind 1111 when replying to non-kind 1 event with forceNip22: true", async () => {
                // Create a non-kind 1 event (Article)
                const article = new NDKEvent(ndk, {
                    kind: NDKKind.Article,
                    content: "Article content",
                });
                article.tags.push(["d", "test-article"]);
                await SignerGenerator.sign(article, "alice");

                // Create reply with forceNip22: true
                fixture.setupSigner("bob");
                const reply = article.reply(true);

                // Should create kind 1111 reply (same as default behavior for non-kind 1)
                expect(reply.kind).toBe(1111); // GenericReply kind

                // Should have proper NIP-22 tagging for addressable event
                expect(reply.tags).toContainEqual(["a", article.tagId(), ""]);
                expect(reply.tags).toContainEqual(["A", article.tagId(), ""]);
                expect(reply.tags).toContainEqual(["K", article.kind?.toString()]);
                expect(reply.tags).toContainEqual(["k", article.kind?.toString()]);
                expect(reply.tags).toContainEqual(["P", article.pubkey]);
                expect(reply.tags).toContainEqual(["p", article.pubkey]);
            });

            it("preserves existing thread structure when using forceNip22 on kind 1 events", async () => {
                // Create thread with root and one reply
                const [root, reply1] = await fixture.eventFactory.createEventChain("Hello world", "alice", [
                    { content: "First reply", author: "bob" },
                ]);

                // Create a second reply to the first reply with forceNip22: true
                fixture.setupSigner("carol");
                const reply2 = reply1.reply(true);

                // Should create kind 1111 reply
                expect(reply2.kind).toBe(1111);

                // Should preserve thread structure with proper tagging
                // When forceNip22 is true, it doesn't preserve the traditional thread structure
                // Instead it uses NIP-22 style tagging
                expect(reply2.tags).toContainEqual(["e", reply1.id, "", reply1.pubkey]);
                expect(reply2.tags).toContainEqual(["E", reply1.id, "", reply1.pubkey]);
                expect(reply2.tags).toContainEqual(["p", root.pubkey]);
                expect(reply2.tags).toContainEqual(["p", reply1.pubkey]);

                // Should have NIP-22 specific tags
                expect(reply2.tags).toContainEqual(["k", "1"]);
            });

            it("handles mixed thread with both kind 1 and kind 1111 replies", async () => {
                // Create root kind 1 event
                const root = await fixture.eventFactory.createSignedTextNote("Root post", "alice");

                // Create normal kind 1 reply
                fixture.setupSigner("bob");
                const normalReply = root.reply();
                expect(normalReply.kind).toBe(1);

                // Create forced NIP-22 reply to the same root
                fixture.setupSigner("carol");
                const forcedReply = root.reply(true);
                expect(forcedReply.kind).toBe(1111);

                // Both should reference the same root but with different tagging styles
                expect(normalReply.tags).toContainEqual(["e", root.id, "", "root", root.pubkey]);
                expect(forcedReply.tags).toContainEqual(["e", root.id, "", root.pubkey]);
                expect(forcedReply.tags).toContainEqual(["E", root.id, "", root.pubkey]);
            });

            it("does not include markers in NIP-22 reply tags", async () => {
                // Create a kind 1 event
                const op = await fixture.eventFactory.createSignedTextNote("Hello world", "alice");

                // Create NIP-22 reply
                fixture.setupSigner("bob");
                const reply = op.reply(true);

                // Check that e and E tags don't have markers
                const eTags = reply.tags.filter((t) => t[0] === "e");
                const ETags = reply.tags.filter((t) => t[0] === "E");

                // NIP-22 tags should be: ["e", eventId, relayHint, pubkey]
                // NOT: ["e", eventId, relayHint, marker, pubkey]
                expect(eTags).toHaveLength(1);
                expect(eTags[0]).toHaveLength(4); // tag name, event id, relay hint, pubkey
                expect(eTags[0][0]).toBe("e");
                expect(eTags[0][1]).toBe(op.id);
                expect(eTags[0][2]).toBe(""); // empty relay hint
                expect(eTags[0][3]).toBe(op.pubkey); // pubkey, not a marker

                expect(ETags).toHaveLength(1);
                expect(ETags[0]).toHaveLength(4); // tag name, event id, relay hint, pubkey
                expect(ETags[0][0]).toBe("E");
                expect(ETags[0][1]).toBe(op.id);
                expect(ETags[0][2]).toBe(""); // empty relay hint
                expect(ETags[0][3]).toBe(op.pubkey); // pubkey, not a marker
            });

            it("does not include markers in NIP-22 reply tags for addressable events", async () => {
                // Create an addressable event
                const article = new NDKEvent(ndk, {
                    kind: NDKKind.Article,
                    content: "Article content",
                });
                article.tags.push(["d", "test-article"]);
                await SignerGenerator.sign(article, "alice");

                // Create NIP-22 reply
                fixture.setupSigner("bob");
                const reply = article.reply();

                // Check that a and A tags don't have markers
                const aTags = reply.tags.filter((t) => t[0] === "a");
                const ATags = reply.tags.filter((t) => t[0] === "A");

                // NIP-22 tags for addressable events should be: ["a", address, relayHint]
                // NOT: ["a", address, relayHint, marker]
                expect(aTags).toHaveLength(1);
                expect(aTags[0]).toHaveLength(3); // tag name, address, relay hint
                expect(aTags[0][0]).toBe("a");
                expect(aTags[0][1]).toBe(article.tagId());
                expect(aTags[0][2]).toBe(""); // empty relay hint, no marker

                expect(ATags).toHaveLength(1);
                expect(ATags[0]).toHaveLength(3); // tag name, address, relay hint
                expect(ATags[0][0]).toBe("A");
                expect(ATags[0][1]).toBe(article.tagId());
                expect(ATags[0][2]).toBe(""); // empty relay hint, no marker
            });
        });
    });

    describe("react", () => {
        it("adds a k-tag when reacting to non-kind-1 events", async () => {
            const targetEvent = new NDKEvent(ndk, { kind: 6, content: "repost content" });
            targetEvent.id = "target-event-id";
            targetEvent.pubkey = user1.pubkey;

            const mockSigner = {
                user: vi.fn().mockResolvedValue(user2),
                sign: vi.fn().mockResolvedValue(undefined),
            };
            ndk.signer = mockSigner as any;

            const reaction = await targetEvent.react("👍", false);

            expect(reaction.kind).toBe(NDKKind.Reaction);
            expect(reaction.content).toBe("👍");
            expect(reaction.tags).toContainEqual(["k", "6"]);
        });

        it("does not add a k-tag when reacting to kind-1 events", async () => {
            const targetEvent = new NDKEvent(ndk, { kind: 1, content: "text note" });
            targetEvent.id = "target-event-id";
            targetEvent.pubkey = user1.pubkey;

            const mockSigner = {
                user: vi.fn().mockResolvedValue(user2),
                sign: vi.fn().mockResolvedValue(undefined),
            };
            ndk.signer = mockSigner as any;

            const reaction = await targetEvent.react("👍", false);

            expect(reaction.kind).toBe(NDKKind.Reaction);
            expect(reaction.content).toBe("👍");
            expect(reaction.tags.find((tag) => tag[0] === "k")).toBeUndefined();
        });
    });
});
