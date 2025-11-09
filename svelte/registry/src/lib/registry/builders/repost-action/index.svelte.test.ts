import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../test-utils";
import { createRepostAction } from "./index.svelte";

describe("createRepostAction", () => {
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

        // Create a test event to repost
        const factory = new TestEventFactory(ndk as any);
        testEvent = await factory.createSignedTextNote("Test note", "alice");
        testEvent.id = generateTestEventId("note1");
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with zero reposts when no subscription events", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            expect(repostState!.count).toBe(0);
            expect(repostState!.hasReposted).toBe(false);
            expect(repostState!.pubkeys).toEqual([]);
        });

        it("should handle undefined event", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: undefined }), ndk);
            });

            expect(repostState!.count).toBe(0);
            expect(repostState!.hasReposted).toBe(false);
        });

        it("should handle event without ID", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.content = "Test";

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: eventWithoutId }), ndk);
            });

            expect(repostState!.count).toBe(0);
        });
    });

    describe("repost counting", () => {
        it("should count kind 6 (Repost) events", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Create a repost event (kind 6)
            const repostEvent = new NDKEvent(ndk);
            repostEvent.kind = NDKKind.Repost;
            repostEvent.content = "";
            repostEvent.pubkey = bob.pubkey;
            repostEvent.tags = [
                ["e", testEvent.id!],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(repostEvent);
            flushSync();

            expect(repostState!.count).toBe(1);
            expect(repostState!.pubkeys).toEqual([bob.pubkey]);
        });

        it("should count kind 16 (GenericRepost) events", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Create a generic repost event (kind 16)
            const genericRepost = new NDKEvent(ndk);
            genericRepost.kind = NDKKind.GenericRepost;
            genericRepost.content = "";
            genericRepost.pubkey = bob.pubkey;
            genericRepost.tags = [
                ["e", testEvent.id!],
                ["p", testEvent.pubkey],
                ["k", testEvent.kind!.toString()]
            ];

            mockSub.events.push(genericRepost);
            flushSync();

            expect(repostState!.count).toBe(1);
        });

        it("should count quote posts with #q tag", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Create a quote post (kind 1 with #q tag)
            const quotePost = new NDKEvent(ndk);
            quotePost.kind = NDKKind.Text;
            quotePost.content = "Great take!";
            quotePost.pubkey = bob.pubkey;
            quotePost.tags = [
                ["q", testEvent.tagId()]
            ];

            mockSub.events.push(quotePost);
            flushSync();

            expect(repostState!.count).toBe(1);
            expect(repostState!.pubkeys).toContain(bob.pubkey);
        });

        it("should count unique pubkeys, not total reposts", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Bob reposts twice (kind 6 and kind 16)
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = bob.pubkey;
            repost1.tags = [["e", testEvent.id!]];
            repost1.id = generateTestEventId("repost1");

            const repost2 = new NDKEvent(ndk);
            repost2.kind = NDKKind.GenericRepost;
            repost2.pubkey = bob.pubkey;
            repost2.tags = [["e", testEvent.id!]];
            repost2.id = generateTestEventId("repost2");

            // Carol reposts once
            const repost3 = new NDKEvent(ndk);
            repost3.kind = NDKKind.Repost;
            repost3.pubkey = carol.pubkey;
            repost3.tags = [["e", testEvent.id!]];
            repost3.id = generateTestEventId("repost3");

            mockSub.events.push(repost1, repost2, repost3);
            flushSync();

            // Should count 2 unique pubkeys, not 3 reposts
            expect(repostState!.count).toBe(2);
            expect(repostState!.pubkeys).toHaveLength(2);
            expect(repostState!.pubkeys).toContain(bob.pubkey);
            expect(repostState!.pubkeys).toContain(carol.pubkey);
        });

        it("should count multiple users reposting", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Three different users repost
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = alice.pubkey;
            repost1.tags = [["e", testEvent.id!]];

            const repost2 = new NDKEvent(ndk);
            repost2.kind = NDKKind.Repost;
            repost2.pubkey = bob.pubkey;
            repost2.tags = [["e", testEvent.id!]];

            const repost3 = new NDKEvent(ndk);
            repost3.kind = NDKKind.Repost;
            repost3.pubkey = carol.pubkey;
            repost3.tags = [["e", testEvent.id!]];

            mockSub.events.push(repost1, repost2, repost3);
            flushSync();

            expect(repostState!.count).toBe(3);
            expect(repostState!.pubkeys).toContain(alice.pubkey);
            expect(repostState!.pubkeys).toContain(bob.pubkey);
            expect(repostState!.pubkeys).toContain(carol.pubkey);
        });
    });

    describe("hasReposted detection", () => {
        it("should detect when current user has reposted", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Current user's repost
            const currentUserRepost = new NDKEvent(ndk);
            currentUserRepost.kind = NDKKind.Repost;
            currentUserRepost.pubkey = ndk.$currentPubkey!;
            currentUserRepost.tags = [
                ["e", testEvent.id!],
                ["p", testEvent.pubkey]
            ];
            currentUserRepost.id = generateTestEventId("user-repost");

            mockSub.events.push(currentUserRepost);
            flushSync();

            expect(repostState!.hasReposted).toBe(true);
            expect(repostState!.count).toBe(1);
        });

        it("should return false when current user has not reposted", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Someone else's repost
            const otherRepost = new NDKEvent(ndk);
            otherRepost.kind = NDKKind.Repost;
            otherRepost.pubkey = bob.pubkey;
            otherRepost.tags = [["e", testEvent.id!]];

            mockSub.events.push(otherRepost);
            flushSync();

            expect(repostState!.hasReposted).toBe(false);
            expect(repostState!.count).toBe(1);
        });

        it("should return false when user is not logged in", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            // Create NDK without signer (so $currentPubkey is undefined)
            const ndkNoUser = createTestNDK();

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndkNoUser, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndkNoUser);
            });

            const repost = new NDKEvent(ndkNoUser);
            repost.kind = NDKKind.Repost;
            repost.pubkey = bob.pubkey;
            repost.tags = [["e", testEvent.id!]];

            mockSub.events.push(repost);
            flushSync();

            expect(repostState!.hasReposted).toBe(false);
        });
    });

    describe("repost() function", () => {
        it("should create and publish a repost", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Mock event.repost()
            const mockRepostEvent = new NDKEvent(ndk);
            mockRepostEvent.kind = NDKKind.Repost;
            const repostSpy = vi.spyOn(testEvent, "repost").mockResolvedValue(mockRepostEvent);

            const result = await repostState!.repost();

            expect(repostSpy).toHaveBeenCalledWith(true);
            expect(result.kind).toBe(NDKKind.Repost);
        });

        it("should delete repost if already reposted (toggle)", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Current user's repost
            const userRepost = new NDKEvent(ndk);
            userRepost.kind = NDKKind.Repost;
            userRepost.pubkey = ndk.$currentPubkey!;
            userRepost.tags = [["e", testEvent.id!]];
            userRepost.id = generateTestEventId("user-repost");

            const deleteSpy = vi.spyOn(userRepost, "delete").mockResolvedValue(new Set());

            mockSub.events.push(userRepost);
            flushSync();

            expect(repostState!.hasReposted).toBe(true);

            // Try to repost again - should delete instead
            const result = await repostState!.repost();

            expect(deleteSpy).toHaveBeenCalled();
            expect(result).toBe(userRepost);
        });

        it("should throw error when event is undefined", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: undefined }), ndk);
            });

            await expect(repostState!.repost()).rejects.toThrow("No event to repost");
        });

        it("should throw error when event has no ID", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.content = "Test";

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: eventWithoutId }), ndk);
            });

            await expect(repostState!.repost()).rejects.toThrow("No event to repost");
        });

        it("should throw error when user is not logged in", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            // Create NDK without signer (so $currentPubkey is undefined)
            const ndkNoSigner = createTestNDK();

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndkNoSigner);
            });

            await expect(repostState!.repost()).rejects.toThrow("User must be logged in to repost");
        });
    });

    describe("quote() function", () => {
        it("should create and publish a quote post", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Mock tagId()
            vi.spyOn(testEvent, "tagId").mockReturnValue(testEvent.id!);

            // Capture the created event
            let createdEvent: NDKEvent | undefined;
            vi.spyOn(NDKEvent.prototype, "tag").mockImplementation(function(this: NDKEvent) {
                createdEvent = this;
                return this;
            });
            vi.spyOn(NDKEvent.prototype, "publish").mockResolvedValue(new Set());

            const quoteContent = "This is a great post!";
            const result = await repostState!.quote(quoteContent);

            expect(result.kind).toBe(NDKKind.Text);
            expect(result.content).toBe(quoteContent);
            expect(createdEvent).toBeDefined();
        });

        it("should throw error when event is undefined", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: undefined }), ndk);
            });

            await expect(repostState!.quote("Test")).rejects.toThrow("No event to quote");
        });

        it("should throw error when event has no ID", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.content = "Test";

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: eventWithoutId }), ndk);
            });

            await expect(repostState!.quote("Test")).rejects.toThrow("No event to quote");
        });

        it("should throw error when user is not logged in", async () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            // Create NDK without signer (so $currentPubkey is undefined)
            const ndkNoSigner = createTestNDK();

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndkNoSigner);
            });

            await expect(repostState!.quote("Test")).rejects.toThrow("User must be logged in to quote");
        });
    });

    describe("pubkeys tracking", () => {
        it("should track all unique pubkeys that reposted", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Multiple reposts from different users
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = alice.pubkey;
            repost1.tags = [["e", testEvent.id!]];

            const repost2 = new NDKEvent(ndk);
            repost2.kind = NDKKind.Repost;
            repost2.pubkey = bob.pubkey;
            repost2.tags = [["e", testEvent.id!]];

            const repost3 = new NDKEvent(ndk);
            repost3.kind = NDKKind.Repost;
            repost3.pubkey = carol.pubkey;
            repost3.tags = [["e", testEvent.id!]];

            mockSub.events.push(repost1, repost2, repost3);
            flushSync();

            expect(repostState!.pubkeys).toHaveLength(3);
            expect(repostState!.pubkeys).toContain(alice.pubkey);
            expect(repostState!.pubkeys).toContain(bob.pubkey);
            expect(repostState!.pubkeys).toContain(carol.pubkey);
        });

        it("should deduplicate pubkeys when same user reposts multiple times", () => {
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            // Bob reposts twice
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = bob.pubkey;
            repost1.tags = [["e", testEvent.id!]];
            repost1.id = generateTestEventId("repost1");

            const repost2 = new NDKEvent(ndk);
            repost2.kind = NDKKind.GenericRepost;
            repost2.pubkey = bob.pubkey;
            repost2.tags = [["e", testEvent.id!]];
            repost2.id = generateTestEventId("repost2");

            mockSub.events.push(repost1, repost2);
            flushSync();

            // Should only list Bob's pubkey once
            expect(repostState!.count).toBe(1);
            expect(repostState!.pubkeys).toHaveLength(1);
            expect(repostState!.pubkeys).toContain(bob.pubkey);
        });
    });

    describe("reactive config updates", () => {
        it("should update subscription when event changes", () => {
            let currentEvent = $state(testEvent);
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const subscribeSpy = vi.spyOn(ndk, "$subscribe");

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: currentEvent }), ndk);
            });

            const firstCallCount = subscribeSpy.mock.calls.length;

            // Change event
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
            let repostState: ReturnType<typeof createRepostAction> | undefined;

            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            cleanup = $effect.root(() => {
                repostState = createRepostAction(() => ({ event: currentEvent }), ndk);
            });

            // Add a repost
            const repost = new NDKEvent(ndk);
            repost.kind = NDKKind.Repost;
            repost.pubkey = bob.pubkey;
            repost.tags = [["e", testEvent.id!]];
            mockSub.events.push(repost);
            flushSync();

            expect(repostState!.count).toBe(1);

            // Clear event
            currentEvent = undefined;
            flushSync();

            // Should reset to zero
            expect(repostState!.count).toBe(0);
            expect(repostState!.hasReposted).toBe(false);
            expect(repostState!.pubkeys).toEqual([]);
        });
    });
});
