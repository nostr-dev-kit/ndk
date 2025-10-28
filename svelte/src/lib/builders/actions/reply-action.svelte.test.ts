import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReplyAction } from "./reply-action.svelte.js";
import { createTestNDK, UserGenerator, TestEventFactory, waitForEffects } from "../../test-utils.js";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

describe("createReplyAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let testEvent: NDKEvent;
    let alice: any;
    let bob: any;
    let factory: TestEventFactory;

    beforeEach(async () => {
        ndk = createTestNDK();
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        // Create test users
        alice = await UserGenerator.getUser("alice", ndk);
        bob = await UserGenerator.getUser("bob", ndk);

        // Create test event with ID
        testEvent = new NDKEvent(ndk);
        testEvent.kind = NDKKind.Text;
        testEvent.content = "Original post";
        testEvent.pubkey = alice.pubkey;
        testEvent.created_at = Math.floor(Date.now() / 1000);
        testEvent.tags = [];
        testEvent.id = "test-event-id-12345";

        // Mock $subscribe - will be overridden in tests that need specific events
        const mockSubscription = {
            events: [],
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
                createReplyAction(() => ({ ndk, event: testEvent }));
            });

            // Wait for effect to run
            await waitForEffects();

            expect(ndk.$subscribe).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it("should not create subscription when event is undefined", () => {
            cleanup = $effect.root(() => {
                createReplyAction(() => ({ ndk, event: undefined }));
            });

            expect(ndk.$subscribe).not.toHaveBeenCalled();
        });

        it("should not create subscription when event has no id", () => {
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.kind = NDKKind.Text;
            eventWithoutId.content = "Test";

            cleanup = $effect.root(() => {
                createReplyAction(() => ({ ndk, event: eventWithoutId }));
            });

            expect(ndk.$subscribe).not.toHaveBeenCalled();
        });
    });

    describe("stats - count", () => {
        it("should return 0 when no subscription", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: undefined }));
            });

            expect(action.count).toBe(0);
        });

        it("should return count from subscription events", async () => {
            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.tags = [["e", testEvent.id, "", "reply"]];

            const reply2 = new NDKEvent(ndk);
            reply2.kind = NDKKind.Text;
            reply2.tags = [["e", testEvent.id, "", "reply"]];

            const reply3 = new NDKEvent(ndk);
            reply3.kind = NDKKind.Text;
            reply3.tags = [["e", testEvent.id, "", "reply"]];

            const mockSubscription = {
                events: [reply1, reply2, reply3],
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();
            expect(action.count).toBe(3);
        });
    });

    describe("stats - hasReplied", () => {
        it("should return false when no subscription", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: undefined }));
            });

            expect(action.hasReplied).toBe(false);
        });

        it("should return false when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.pubkey = bob.pubkey;

            const mockSubscription = {
                events: [reply1],
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();
            expect(action.hasReplied).toBe(false);
        });

        it("should return false when current user has not replied", async () => {
            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.pubkey = bob.pubkey;

            const mockSubscription = {
                events: [reply1],
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();
            expect(action.hasReplied).toBe(false);
        });

        it("should return true when current user has replied", async () => {
            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.pubkey = alice.pubkey;
            reply1.tags = [["e", testEvent.id, "", "reply"]];

            const mockSubscription = {
                events: [reply1],
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();
            expect(action.hasReplied).toBe(true);
        });

        it("should return true when current user has one of multiple replies", async () => {
            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.pubkey = bob.pubkey;
            reply1.tags = [["e", testEvent.id, "", "reply"]];

            const reply2 = new NDKEvent(ndk);
            reply2.kind = NDKKind.Text;
            reply2.pubkey = alice.pubkey;
            reply2.tags = [["e", testEvent.id, "", "reply"]];

            const reply3 = new NDKEvent(ndk);
            reply3.kind = NDKKind.Text;
            reply3.pubkey = bob.pubkey;
            reply3.tags = [["e", testEvent.id, "", "reply"]];

            const mockSubscription = {
                events: [reply1, reply2, reply3],
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: testEvent }));
            });

            await waitForEffects();
            expect(action.hasReplied).toBe(true);
            expect(action.count).toBe(3);
        });
    });

    describe("reply function", () => {
        it("should throw error when event is undefined", async () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: undefined }));
            });

            await expect(action.reply("Test reply")).rejects.toThrow("No event to reply to");
        });

        it("should throw error when event has no id", async () => {
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.kind = NDKKind.Text;
            eventWithoutId.content = "Test";

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: eventWithoutId }));
            });

            await expect(action.reply("Test reply")).rejects.toThrow("No event to reply to");
        });

        it("should throw error when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: testEvent }));
            });

            await expect(action.reply("Test reply")).rejects.toThrow("User must be logged in to reply");
        });

        it("should create and publish reply event", async () => {
            const replyEvent = new NDKEvent(ndk);
            replyEvent.kind = NDKKind.Text;
            const mockReply = vi.fn().mockReturnValue(replyEvent);
            const mockPublish = vi.fn().mockResolvedValue(new Set());

            vi.spyOn(testEvent, "reply").mockImplementation(mockReply);
            vi.spyOn(replyEvent, "publish").mockImplementation(mockPublish);

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: testEvent }));
            });

            const result = await action.reply("Test reply content");

            expect(testEvent.reply).toHaveBeenCalled();
            expect(result.content).toBe("Test reply content");
            expect(mockPublish).toHaveBeenCalled();
        });

        it("should return the published reply event", async () => {
            const replyEvent = new NDKEvent(ndk);
            replyEvent.kind = NDKKind.Text;

            vi.spyOn(testEvent, "reply").mockReturnValue(replyEvent);
            vi.spyOn(replyEvent, "publish").mockResolvedValue(new Set());

            let action: any;
            cleanup = $effect.root(() => {
                action = createReplyAction(() => ({ ndk, event: testEvent }));
            });

            const result = await action.reply("My reply");

            expect(result).toBe(replyEvent);
            expect(result.content).toBe("My reply");
        });
    });

    describe("subscription filters", () => {
        it("should subscribe with correct filter", async () => {
            let capturedConfig: any;
            vi.mocked(ndk.$subscribe).mockImplementation((config) => {
                capturedConfig = config();
                return { events: [] } as any;
            });

            cleanup = $effect.root(() => {
                createReplyAction(() => ({ ndk, event: testEvent }));
            });

            // Wait for effect to run
            await waitForEffects();

            expect(capturedConfig).toBeDefined();
            expect(capturedConfig.filters).toEqual([
                expect.objectContaining({
                    kinds: [NDKKind.Text, NDKKind.GenericReply],
                })
            ]);
            expect(capturedConfig.closeOnEose).toBe(false);
        });
    });
});
