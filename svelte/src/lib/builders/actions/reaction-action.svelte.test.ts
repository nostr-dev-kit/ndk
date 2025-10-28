import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReactionAction } from "./reaction-action.svelte.js";
import { createTestNDK, UserGenerator, waitForEffects } from "../../test-utils.js";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

describe("createReactionAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let testEvent: NDKEvent;
    let alice: any;
    let bob: any;
    let carol: any;

    beforeEach(async () => {
        ndk = createTestNDK();
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        // Create test users
        alice = await UserGenerator.getUser("alice", ndk);
        bob = await UserGenerator.getUser("bob", ndk);
        carol = await UserGenerator.getUser("carol", ndk);

        // Create test event with ID
        testEvent = new NDKEvent(ndk);
        testEvent.kind = NDKKind.Text;
        testEvent.content = "Original post";
        testEvent.pubkey = alice.pubkey;
        testEvent.created_at = Math.floor(Date.now() / 1000);
        testEvent.tags = [];
        testEvent.id = "test-event-id-12345";

        // Mock $subscribe
        const mockSubscription = {
            events: new Set(),
        };
        vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSubscription as any);

        // Mock $currentPubkey
        vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(alice.pubkey);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should create subscription when event has id", async () => {
            cleanup = $effect.root(() => {
                createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            expect(ndk.$subscribe).toHaveBeenCalled();
        });

        it("should not create subscription when event is undefined", () => {
            cleanup = $effect.root(() => {
                createReactionAction(() => ({ ndk, event: undefined }));
            });

            expect(ndk.$subscribe).not.toHaveBeenCalled();
        });

        it("should not create subscription when event has no id", () => {
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.kind = NDKKind.Text;
            eventWithoutId.content = "Test";

            cleanup = $effect.root(() => {
                createReactionAction(() => ({ ndk, event: eventWithoutId }));
            });

            expect(ndk.$subscribe).not.toHaveBeenCalled();
        });
    });

    describe("subscription filters", () => {
        it("should subscribe with correct filter for reactions", async () => {
            let capturedConfig: any;
            vi.mocked(ndk.$subscribe).mockImplementation((config) => {
                capturedConfig = config();
                return { events: new Set() } as any;
            });

            cleanup = $effect.root(() => {
                createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            expect(capturedConfig).toBeDefined();
            expect(capturedConfig.filters).toEqual([
                expect.objectContaining({
                    kinds: [NDKKind.Reaction],
                    "#e": [testEvent.id]
                })
            ]);
        });
    });

    describe("stats - all", () => {
        it("should return empty array when no subscription", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: undefined }));
            });

            expect(action.all).toEqual([]);
        });

        it("should group reactions by emoji", async () => {
            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = bob.pubkey;

            const reaction2 = new NDKEvent(ndk);
            reaction2.kind = NDKKind.Reaction;
            reaction2.content = "👍";
            reaction2.pubkey = carol.pubkey;

            const reaction3 = new NDKEvent(ndk);
            reaction3.kind = NDKKind.Reaction;
            reaction3.content = "❤️";
            reaction3.pubkey = carol.pubkey;

            const mockSubscription = {
                events: new Set([reaction1, reaction2, reaction3]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            expect(action.all).toHaveLength(2);
            expect(action.all.find((r: any) => r.emoji === "❤️")?.count).toBe(2);
            expect(action.all.find((r: any) => r.emoji === "👍")?.count).toBe(1);
        });

        it("should track pubkeys who reacted", async () => {
            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = bob.pubkey;

            const reaction2 = new NDKEvent(ndk);
            reaction2.kind = NDKKind.Reaction;
            reaction2.content = "❤️";
            reaction2.pubkey = carol.pubkey;

            const mockSubscription = {
                events: new Set([reaction1, reaction2]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            const heartReaction = action.all.find((r: any) => r.emoji === "❤️");
            expect(heartReaction?.pubkeys).toContain(bob.pubkey);
            expect(heartReaction?.pubkeys).toContain(carol.pubkey);
            expect(heartReaction?.pubkeys).toHaveLength(2);
        });

        it("should identify user's reactions with hasReacted", async () => {
            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = alice.pubkey;

            const reaction2 = new NDKEvent(ndk);
            reaction2.kind = NDKKind.Reaction;
            reaction2.content = "👍";
            reaction2.pubkey = bob.pubkey;

            const mockSubscription = {
                events: new Set([reaction1, reaction2]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            const heartReaction = action.all.find((r: any) => r.emoji === "❤️");
            const thumbsUpReaction = action.all.find((r: any) => r.emoji === "👍");

            expect(heartReaction?.hasReacted).toBe(true);
            expect(heartReaction?.userReaction).toBe(reaction1);
            expect(thumbsUpReaction?.hasReacted).toBe(false);
            expect(thumbsUpReaction?.userReaction).toBeUndefined();
        });

        it("should sort reactions by count descending", async () => {
            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "👍";
            reaction1.pubkey = bob.pubkey;

            const reaction2 = new NDKEvent(ndk);
            reaction2.kind = NDKKind.Reaction;
            reaction2.content = "❤️";
            reaction2.pubkey = alice.pubkey;

            const reaction3 = new NDKEvent(ndk);
            reaction3.kind = NDKKind.Reaction;
            reaction3.content = "❤️";
            reaction3.pubkey = bob.pubkey;

            const reaction4 = new NDKEvent(ndk);
            reaction4.kind = NDKKind.Reaction;
            reaction4.content = "❤️";
            reaction4.pubkey = carol.pubkey;

            const mockSubscription = {
                events: new Set([reaction1, reaction2, reaction3, reaction4]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            expect(action.all).toHaveLength(2);
            expect(action.all[0].emoji).toBe("❤️");
            expect(action.all[0].count).toBe(3);
            expect(action.all[1].emoji).toBe("👍");
            expect(action.all[1].count).toBe(1);
        });

        it("should return false for hasReacted when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = bob.pubkey;

            const mockSubscription = {
                events: new Set([reaction1]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            const heartReaction = action.all.find((r: any) => r.emoji === "❤️");
            expect(heartReaction?.hasReacted).toBe(false);
        });
    });

    describe("get function", () => {
        it("should return undefined for emoji not found", async () => {
            const mockSubscription = {
                events: new Set(),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            expect(action.get("❤️")).toBeUndefined();
        });

        it("should return correct emoji reaction data", async () => {
            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = alice.pubkey;

            const mockSubscription = {
                events: new Set([reaction1]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            const heartReaction = action.get("❤️");
            expect(heartReaction).toBeDefined();
            expect(heartReaction?.emoji).toBe("❤️");
            expect(heartReaction?.count).toBe(1);
            expect(heartReaction?.hasReacted).toBe(true);
            expect(heartReaction?.pubkeys).toContain(alice.pubkey);
        });
    });

    describe("react function", () => {
        it("should throw error when event is undefined", async () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: undefined }));
            });

            await expect(action.react("❤️")).rejects.toThrow("No event to react to");
        });

        it("should throw error when event has no id", async () => {
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.kind = NDKKind.Text;
            eventWithoutId.content = "Test";

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: eventWithoutId }));
            });

            await expect(action.react("❤️")).rejects.toThrow("No event to react to");
        });

        it("should throw error when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await expect(action.react("❤️")).rejects.toThrow("User must be logged in to react");
        });

        it("should create reaction event using event.react()", async () => {
            const reactionEvent = new NDKEvent(ndk);
            reactionEvent.kind = NDKKind.Reaction;
            reactionEvent.content = "❤️";
            reactionEvent.tags = [];

            const mockReact = vi.fn().mockResolvedValue(reactionEvent);
            const mockPublish = vi.fn().mockResolvedValue(new Set());

            vi.spyOn(testEvent, "react").mockImplementation(mockReact);
            vi.spyOn(reactionEvent, "publish").mockImplementation(mockPublish);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await action.react("❤️");

            expect(testEvent.react).toHaveBeenCalledWith("❤️", false);
            expect(reactionEvent.publish).toHaveBeenCalled();
        });

        it("should delete existing reaction if already reacted", async () => {
            const existingReaction = new NDKEvent(ndk);
            existingReaction.kind = NDKKind.Reaction;
            existingReaction.content = "❤️";
            existingReaction.pubkey = alice.pubkey;
            const mockDelete = vi.fn().mockResolvedValue(new Set());
            vi.spyOn(existingReaction, "delete").mockImplementation(mockDelete);

            const mockSubscription = {
                events: new Set([existingReaction]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();

            await action.react("❤️");

            expect(existingReaction.delete).toHaveBeenCalled();
        });

        it("should add custom emoji tag for CustomEmojiData", async () => {
            const reactionEvent = new NDKEvent(ndk);
            reactionEvent.kind = NDKKind.Reaction;
            reactionEvent.content = ":custom_emoji:";
            reactionEvent.tags = [];

            const mockReact = vi.fn().mockResolvedValue(reactionEvent);
            const mockPublish = vi.fn().mockResolvedValue(new Set());

            vi.spyOn(testEvent, "react").mockImplementation(mockReact);
            vi.spyOn(reactionEvent, "publish").mockImplementation(mockPublish);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await action.react({
                emoji: ":custom_emoji:",
                shortcode: "custom_emoji",
                url: "https://example.com/emoji.png"
            });

            expect(testEvent.react).toHaveBeenCalledWith(":custom_emoji:", false);
            expect(reactionEvent.tags).toContainEqual(["emoji", "custom_emoji", "https://example.com/emoji.png"]);
            expect(reactionEvent.publish).toHaveBeenCalled();
        });

        it("should not add custom emoji tag for string emoji", async () => {
            const reactionEvent = new NDKEvent(ndk);
            reactionEvent.kind = NDKKind.Reaction;
            reactionEvent.content = "❤️";
            reactionEvent.tags = [];

            const mockReact = vi.fn().mockResolvedValue(reactionEvent);
            const mockPublish = vi.fn().mockResolvedValue(new Set());

            vi.spyOn(testEvent, "react").mockImplementation(mockReact);
            vi.spyOn(reactionEvent, "publish").mockImplementation(mockPublish);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReactionAction(() => ({ ndk, event: testEvent }));
            });

            await action.react("❤️");

            expect(reactionEvent.tags).toEqual([]);
        });
    });
});
