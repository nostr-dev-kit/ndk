import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../test-utils";
import { createReplyAction } from "./index.svelte";

describe("createReplyAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let testEvent: NDKEvent;
    let alice: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let bob: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let carol: Awaited<ReturnType<typeof UserGenerator.getUser>>;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        // Create test users
        alice = await UserGenerator.getUser("alice", ndk as any);
        bob = await UserGenerator.getUser("bob", ndk as any);
        carol = await UserGenerator.getUser("carol", ndk as any);

        // Create a test event to reply to
        const factory = new TestEventFactory(ndk as any);
        testEvent = await factory.createSignedTextNote("Test note", "alice");
        testEvent.id = generateTestEventId("note1");
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with zero replies when no subscription events", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            expect(replyState!.count).toBe(0);
            expect(replyState!.hasReplied).toBe(false);
            expect(replyState!.pubkeys).toEqual([]);
        });

        it("should handle undefined event", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: undefined }), ndk);
            });

            expect(replyState!.count).toBe(0);
            expect(replyState!.hasReplied).toBe(false);
        });

        it("should handle event without ID", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.content = "Test";

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: eventWithoutId }), ndk);
            });

            expect(replyState!.count).toBe(0);
        });
    });

    describe("reply counting", () => {
        it("should count text note replies", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            // Mock subscription
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Create a reply event (kind 1)
            const replyEvent = new NDKEvent(ndk);
            replyEvent.kind = NDKKind.Text;
            replyEvent.content = "Great post!";
            replyEvent.pubkey = bob.pubkey;
            replyEvent.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(replyEvent);
            flushSync();

            expect(replyState!.count).toBe(1);
            expect(replyState!.pubkeys).toEqual([bob.pubkey]);
        });

        it("should count generic reply (kind 1111) events", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Create a generic reply event (kind 1111)
            const genericReply = new NDKEvent(ndk);
            genericReply.kind = NDKKind.GenericReply;
            genericReply.content = "Generic reply";
            genericReply.pubkey = bob.pubkey;
            genericReply.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(genericReply);
            flushSync();

            expect(replyState!.count).toBe(1);
        });

        it("should count multiple replies from different users", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Bob's reply
            const bobReply = new NDKEvent(ndk);
            bobReply.kind = NDKKind.Text;
            bobReply.content = "Reply 1";
            bobReply.pubkey = bob.pubkey;
            bobReply.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            // Carol's reply
            const carolReply = new NDKEvent(ndk);
            carolReply.kind = NDKKind.Text;
            carolReply.content = "Reply 2";
            carolReply.pubkey = carol.pubkey;
            carolReply.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(bobReply, carolReply);
            flushSync();

            expect(replyState!.count).toBe(2);
            expect(replyState!.pubkeys).toContain(bob.pubkey);
            expect(replyState!.pubkeys).toContain(carol.pubkey);
        });

        it("should only count events that are actual replies using eventIsReply", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Valid reply
            const validReply = new NDKEvent(ndk);
            validReply.kind = NDKKind.Text;
            validReply.content = "Valid reply";
            validReply.pubkey = bob.pubkey;
            validReply.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            // Not a reply - just mentions the event
            const notReply = new NDKEvent(ndk);
            notReply.kind = NDKKind.Text;
            notReply.content = "Not a reply";
            notReply.pubkey = carol.pubkey;
            notReply.tags = [
                ["e", testEvent.id!, "", "mention"],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(validReply, notReply);
            flushSync();

            // Should only count the valid reply
            expect(replyState!.count).toBe(1);
            expect(replyState!.pubkeys).toEqual([bob.pubkey]);
        });
    });

    describe("hasReplied detection", () => {
        it("should detect when current user has replied", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Current user's reply
            const currentUserReply = new NDKEvent(ndk);
            currentUserReply.kind = NDKKind.Text;
            currentUserReply.content = "My reply";
            currentUserReply.pubkey = ndk.$currentPubkey!;
            currentUserReply.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(currentUserReply);
            flushSync();

            expect(replyState!.hasReplied).toBe(true);
            expect(replyState!.count).toBe(1);
        });

        it("should return false when current user has not replied", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Someone else's reply
            const otherReply = new NDKEvent(ndk);
            otherReply.kind = NDKKind.Text;
            otherReply.content = "Other's reply";
            otherReply.pubkey = bob.pubkey;
            otherReply.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(otherReply);
            flushSync();

            expect(replyState!.hasReplied).toBe(false);
            expect(replyState!.count).toBe(1);
        });

        it("should return false when user is not logged in", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            // Create NDK without signer (so $currentPubkey is undefined)
            const ndkNoUser = createTestNDK();

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndkNoUser, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndkNoUser);
            });

            const reply = new NDKEvent(ndkNoUser);
            reply.kind = NDKKind.Text;
            reply.content = "A reply";
            reply.pubkey = bob.pubkey;
            reply.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(reply);
            flushSync();

            expect(replyState!.hasReplied).toBe(false);
        });
    });

    describe("reply() function", () => {
        it("should create and publish a reply", async () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Mock event.reply() and publish
            const mockReplyEvent = new NDKEvent(ndk);
            mockReplyEvent.kind = NDKKind.Text;
            const replySpy = vi.spyOn(testEvent, "reply").mockReturnValue(mockReplyEvent);
            const publishSpy = vi.spyOn(mockReplyEvent, "publish").mockResolvedValue(new Set());

            const replyContent = "This is my reply";
            const result = await replyState!.reply(replyContent);

            expect(replySpy).toHaveBeenCalled();
            expect(result.content).toBe(replyContent);
            expect(publishSpy).toHaveBeenCalled();
        });

        it("should throw error when event is undefined", async () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: undefined }), ndk);
            });

            await expect(replyState!.reply("Test")).rejects.toThrow("No event to reply to");
        });

        it("should throw error when event has no ID", async () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.content = "Test";

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: eventWithoutId }), ndk);
            });

            await expect(replyState!.reply("Test")).rejects.toThrow("No event to reply to");
        });

        it("should throw error when user is not logged in", async () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            // Create NDK without signer (so $currentPubkey is undefined)
            const ndkNoSigner = createTestNDK();

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndkNoSigner);
            });

            await expect(replyState!.reply("Test")).rejects.toThrow("User must be logged in to reply");
        });
    });

    describe("pubkeys tracking", () => {
        it("should track all pubkeys that replied", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Multiple replies from different users
            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.pubkey = alice.pubkey;
            reply1.tags = [["e", testEvent.id!, "", "reply"]];

            const reply2 = new NDKEvent(ndk);
            reply2.kind = NDKKind.Text;
            reply2.pubkey = bob.pubkey;
            reply2.tags = [["e", testEvent.id!, "", "reply"]];

            const reply3 = new NDKEvent(ndk);
            reply3.kind = NDKKind.Text;
            reply3.pubkey = carol.pubkey;
            reply3.tags = [["e", testEvent.id!, "", "reply"]];

            mockSub.events.push(reply1, reply2, reply3);
            flushSync();

            expect(replyState!.pubkeys).toHaveLength(3);
            expect(replyState!.pubkeys).toContain(alice.pubkey);
            expect(replyState!.pubkeys).toContain(bob.pubkey);
            expect(replyState!.pubkeys).toContain(carol.pubkey);
        });

        it("should handle multiple replies from the same user", () => {
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: testEvent }), ndk);
            });

            // Bob replies twice
            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.content = "First reply";
            reply1.pubkey = bob.pubkey;
            reply1.tags = [["e", testEvent.id!, "", "reply"]];
            reply1.id = generateTestEventId("reply1");

            const reply2 = new NDKEvent(ndk);
            reply2.kind = NDKKind.Text;
            reply2.content = "Second reply";
            reply2.pubkey = bob.pubkey;
            reply2.tags = [["e", testEvent.id!, "", "reply"]];
            reply2.id = generateTestEventId("reply2");

            mockSub.events.push(reply1, reply2);
            flushSync();

            // Should count both replies
            expect(replyState!.count).toBe(2);
            // Should list Bob's pubkey twice
            expect(replyState!.pubkeys).toHaveLength(2);
            expect(replyState!.pubkeys.filter(pk => pk === bob.pubkey)).toHaveLength(2);
        });
    });

    describe("reactive config updates", () => {
        it("should update subscription when event changes", () => {
            let currentEvent = $state(testEvent);
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const subscribeSpy = vi.spyOn(ndk, "$subscribe");

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: currentEvent }), ndk);
            });

            const firstCallCount = subscribeSpy.mock.calls.length;

            // Change event
            const factory = new TestEventFactory(ndk as any);
            const newEvent = new NDKEvent(ndk);
            newEvent.kind = NDKKind.Text;
            newEvent.content = "Different note";
            newEvent.pubkey = bob.pubkey;
            newEvent.id = generateTestEventId("note2");

            currentEvent = newEvent;
            flushSync();

            // Should have been called again with new event
            expect(subscribeSpy.mock.calls.length).toBeGreaterThan(firstCallCount);
        });

        it("should clear subscription when event becomes undefined", () => {
            let currentEvent = $state<NDKEvent | undefined>(testEvent);
            let replyState: ReturnType<typeof createReplyAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                replyState = createReplyAction(() => ({ event: currentEvent }), ndk);
            });

            // Add a reply
            const reply = new NDKEvent(ndk);
            reply.kind = NDKKind.Text;
            reply.pubkey = bob.pubkey;
            reply.tags = [["e", testEvent.id!, "", "reply"]];
            mockSub.events.push(reply);
            flushSync();

            expect(replyState!.count).toBe(1);

            // Clear event
            currentEvent = undefined;
            flushSync();

            // Should reset to zero
            expect(replyState!.count).toBe(0);
            expect(replyState!.hasReplied).toBe(false);
            expect(replyState!.pubkeys).toEqual([]);
        });
    });
});
