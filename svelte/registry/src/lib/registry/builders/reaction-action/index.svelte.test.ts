import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../test-utils";
import { createReactionAction } from "./index.svelte";

describe("createReactionAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let testEvent: NDKEvent;
    let alice: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let bob: Awaited<ReturnType<typeof UserGenerator.getUser>>;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        // Create test users
        alice = await UserGenerator.getUser("alice", ndk as any);
        bob = await UserGenerator.getUser("bob", ndk as any);

        // Create a test event to react to
        const factory = new TestEventFactory(ndk as any);
        testEvent = await factory.createSignedTextNote("Test note", "alice");
        testEvent.id = generateTestEventId("note1");
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with empty reactions when no subscription events", () => {
            let reactionState: ReturnType<typeof createReactionAction> | undefined;

            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            expect(reactionState!.all).toEqual([]);
            expect(reactionState!.totalCount).toBe(0);
        });

        it("should handle undefined event", () => {
            let reactionState: ReturnType<typeof createReactionAction> | undefined;

            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: undefined }), ndk);
            });

            expect(reactionState!.all).toEqual([]);
        });
    });

    describe("get()", () => {
        it("should return undefined when emoji has no reactions", () => {
            let reactionState: ReturnType<typeof createReactionAction> | undefined;

            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            expect(reactionState!.get("❤️")).toBeUndefined();
        });

        it("should return EmojiReaction when emoji exists", async () => {
            let reactionState: ReturnType<typeof createReactionAction> | undefined;

            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            // Mock a subscription that returns reaction events
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            // Create a reaction event
            const reactionEvent = new NDKEvent(ndk);
            reactionEvent.kind = NDKKind.Reaction;
            reactionEvent.content = "❤️";
            reactionEvent.pubkey = bob.pubkey;
            reactionEvent.tags = [
                ["e", testEvent.id!],
                ["p", testEvent.pubkey]
            ];

            // Add reaction to mock subscription
            mockSub.events.push(reactionEvent);

            // Mock the subscription
            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            // Recreate state with mocked subscription
            cleanup?.();
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            const reaction = reactionState!.get("❤️");
            expect(reaction).toBeDefined();
            expect(reaction?.emoji).toBe("❤️");
            expect(reaction?.count).toBe(1);
            expect(reaction?.hasReacted).toBe(false); // bob reacted, not current user
            expect(reaction?.pubkeys).toContain(bob.pubkey);
        });
    });

    describe("reaction counting and grouping", () => {
        it("should group reactions by emoji", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = bob.pubkey;
            reaction1.tags = [["e", testEvent.id!]];

            const reaction2 = new NDKEvent(ndk);
            reaction2.kind = NDKKind.Reaction;
            reaction2.content = "❤️";
            reaction2.pubkey = alice.pubkey;
            reaction2.tags = [["e", testEvent.id!]];

            const reaction3 = new NDKEvent(ndk);
            reaction3.kind = NDKKind.Reaction;
            reaction3.content = "🔥";
            reaction3.pubkey = bob.pubkey;
            reaction3.tags = [["e", testEvent.id!]];

            mockSub.events.push(reaction1, reaction2, reaction3);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            expect(reactionState!.all).toHaveLength(2);
            expect(reactionState!.get("❤️")?.count).toBe(2);
            expect(reactionState!.get("🔥")?.count).toBe(1);
            expect(reactionState!.totalCount).toBe(3);
        });

        it("should sort reactions by count descending", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            // Add 1 heart
            const heart = new NDKEvent(ndk);
            heart.kind = NDKKind.Reaction;
            heart.content = "❤️";
            heart.pubkey = bob.pubkey;
            heart.tags = [["e", testEvent.id!]];
            mockSub.events.push(heart);

            // Add 3 fires
            for (let i = 0; i < 3; i++) {
                const fire = new NDKEvent(ndk);
                fire.kind = NDKKind.Reaction;
                fire.content = "🔥";
                fire.pubkey = `pubkey-${i}`;
                fire.tags = [["e", testEvent.id!]];
                mockSub.events.push(fire);
            }

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            expect(reactionState!.all[0].emoji).toBe("🔥");
            expect(reactionState!.all[0].count).toBe(3);
            expect(reactionState!.all[1].emoji).toBe("❤️");
            expect(reactionState!.all[1].count).toBe(1);
        });
    });

    describe("hasReacted detection", () => {
        it("should detect when current user has reacted", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            // Current user reaction
            const userReaction = new NDKEvent(ndk);
            userReaction.kind = NDKKind.Reaction;
            userReaction.content = "❤️";
            userReaction.pubkey = ndk.$currentPubkey!;
            userReaction.tags = [["e", testEvent.id!]];

            mockSub.events.push(userReaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            const reaction = reactionState!.get("❤️");
            expect(reaction?.hasReacted).toBe(true);
            expect(reaction?.userReaction).toBe(userReaction);
        });

        it("should not detect hasReacted for other users", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            // Other user reaction
            const otherReaction = new NDKEvent(ndk);
            otherReaction.kind = NDKKind.Reaction;
            otherReaction.content = "❤️";
            otherReaction.pubkey = bob.pubkey;
            otherReaction.tags = [["e", testEvent.id!]];

            mockSub.events.push(otherReaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            const reaction = reactionState!.get("❤️");
            expect(reaction?.hasReacted).toBe(false);
            expect(reaction?.userReaction).toBeUndefined();
        });
    });

    describe("custom emoji (NIP-30)", () => {
        it("should extract custom emoji data from reaction event", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            const customReaction = new NDKEvent(ndk);
            customReaction.kind = NDKKind.Reaction;
            customReaction.content = ":pepe:";
            customReaction.pubkey = bob.pubkey;
            customReaction.tags = [
                ["e", testEvent.id!],
                ["emoji", "pepe", "https://example.com/pepe.png"]
            ];

            mockSub.events.push(customReaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            const reaction = reactionState!.get(":pepe:");
            expect(reaction?.shortcode).toBe("pepe");
            expect(reaction?.url).toBe("https://example.com/pepe.png");
        });
    });

    describe("react() function", () => {
        it("should publish reaction immediately when no delay", async () => {
            const mockPublish = vi.fn().mockResolvedValue(new Set());
            const mockReactionEvent = new NDKEvent(ndk);
            mockReactionEvent.publish = mockPublish;

            vi.spyOn(testEvent, "react").mockResolvedValue(mockReactionEvent);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            await reactionState!.react("❤️");

            expect(testEvent.react).toHaveBeenCalledWith("❤️", false);
            expect(mockPublish).toHaveBeenCalled();
        });

        it("should delay publishing when delayed is set", async () => {
            vi.useFakeTimers();

            const mockPublish = vi.fn().mockResolvedValue(new Set());
            const mockReactionEvent = new NDKEvent(ndk);
            mockReactionEvent.publish = mockPublish;

            vi.spyOn(testEvent, "react").mockResolvedValue(mockReactionEvent);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent, delayed: 5 }), ndk);
            });

            await reactionState!.react("❤️");

            // Should not publish immediately
            expect(mockPublish).not.toHaveBeenCalled();

            // Should publish after delay
            await vi.advanceTimersByTimeAsync(5000);
            expect(mockPublish).toHaveBeenCalled();

            vi.useRealTimers();
        });

        it("should cancel pending reaction when clicked again", async () => {
            vi.useFakeTimers();

            const mockPublish = vi.fn().mockResolvedValue(new Set());
            const mockReactionEvent = new NDKEvent(ndk);
            mockReactionEvent.publish = mockPublish;

            vi.spyOn(testEvent, "react").mockResolvedValue(mockReactionEvent);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent, delayed: 5 }), ndk);
            });

            // First click - add reaction
            await reactionState!.react("❤️");
            expect(mockPublish).not.toHaveBeenCalled();

            // Second click before delay - cancel
            await reactionState!.react("❤️");

            // Advance time - should not publish
            await vi.advanceTimersByTimeAsync(5000);
            expect(mockPublish).not.toHaveBeenCalled();

            vi.useRealTimers();
        });

        it("should delete existing reaction when already reacted", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            // Existing user reaction
            const userReaction = new NDKEvent(ndk);
            userReaction.kind = NDKKind.Reaction;
            userReaction.content = "❤️";
            userReaction.pubkey = ndk.$currentPubkey!;
            userReaction.tags = [["e", testEvent.id!]];
            userReaction.delete = vi.fn().mockResolvedValue(undefined);

            mockSub.events.push(userReaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            // React again - should delete
            await reactionState!.react("❤️");

            expect(userReaction.delete).toHaveBeenCalled();
        });

        it("should add NIP-30 emoji tag when custom emoji provided", async () => {
            const mockPublish = vi.fn().mockResolvedValue(new Set());
            const mockReactionEvent = new NDKEvent(ndk);
            mockReactionEvent.tags = [];
            mockReactionEvent.publish = mockPublish;

            vi.spyOn(testEvent, "react").mockResolvedValue(mockReactionEvent);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            await reactionState!.react({
                emoji: ":pepe:",
                shortcode: "pepe",
                url: "https://example.com/pepe.png"
            });

            expect(mockReactionEvent.tags).toContainEqual(["emoji", "pepe", "https://example.com/pepe.png"]);
            expect(mockPublish).toHaveBeenCalled();
        });

        it("should throw error when no event to react to", async () => {
            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: undefined }), ndk);
            });

            await expect(reactionState!.react("❤️")).rejects.toThrow("No event to react to");
        });

        it("should throw error when user not logged in", async () => {
            // Create NDK without signer
            const ndkNoSigner = createTestNDK();

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndkNoSigner);
            });

            await expect(reactionState!.react("❤️")).rejects.toThrow("User must be logged in to react");
        });
    });

    describe("pubkey tracking", () => {
        it("should track all unique pubkeys who reacted", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = bob.pubkey;
            reaction1.tags = [["e", testEvent.id!]];

            const reaction2 = new NDKEvent(ndk);
            reaction2.kind = NDKKind.Reaction;
            reaction2.content = "❤️";
            reaction2.pubkey = alice.pubkey;
            reaction2.tags = [["e", testEvent.id!]];

            mockSub.events.push(reaction1, reaction2);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            const reaction = reactionState!.get("❤️");
            expect(reaction?.pubkeys).toHaveLength(2);
            expect(reaction?.pubkeys).toContain(bob.pubkey);
            expect(reaction?.pubkeys).toContain(alice.pubkey);
        });

        it("should not duplicate pubkeys in tracking", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            // Same user reacting multiple times (shouldn't happen but test defensively)
            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = bob.pubkey;
            reaction1.tags = [["e", testEvent.id!]];

            const reaction2 = new NDKEvent(ndk);
            reaction2.kind = NDKKind.Reaction;
            reaction2.content = "❤️";
            reaction2.pubkey = bob.pubkey; // Same pubkey
            reaction2.tags = [["e", testEvent.id!]];

            mockSub.events.push(reaction1, reaction2);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            const reaction = reactionState!.get("❤️");
            expect(reaction?.pubkeys).toHaveLength(1);
            expect(reaction?.pubkeys).toContain(bob.pubkey);
        });
    });

    describe("totalCount", () => {
        it("should sum all reaction counts", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: [],
            };

            // Add various reactions
            const reactions = [
                { emoji: "❤️", pubkey: "pk1" },
                { emoji: "❤️", pubkey: "pk2" },
                { emoji: "🔥", pubkey: "pk3" },
                { emoji: "👍", pubkey: "pk4" },
                { emoji: "👍", pubkey: "pk5" },
                { emoji: "👍", pubkey: "pk6" },
            ];

            for (const { emoji, pubkey } of reactions) {
                const r = new NDKEvent(ndk);
                r.kind = NDKKind.Reaction;
                r.content = emoji;
                r.pubkey = pubkey;
                r.tags = [["e", testEvent.id!]];
                mockSub.events.push(r);
            }

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            let reactionState: ReturnType<typeof createReactionAction> | undefined;
            cleanup = $effect.root(() => {
                reactionState = createReactionAction(() => ({ event: testEvent }), ndk);
            });

            flushSync();

            expect(reactionState!.totalCount).toBe(6);
        });
    });
});
