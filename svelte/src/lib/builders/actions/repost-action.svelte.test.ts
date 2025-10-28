import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRepostAction } from "./repost-action.svelte.js";
import { createTestNDK, UserGenerator, waitForEffects } from "../../test-utils.js";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

describe("createRepostAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let testEvent: NDKEvent;
    let alice: any;
    let bob: any;

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

        // Mock event.filter() and event.tagId()
        vi.spyOn(testEvent, "filter").mockReturnValue({ "#e": [testEvent.id] });
        vi.spyOn(testEvent, "tagId").mockReturnValue(testEvent.id);

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
                createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await waitForEffects();

            expect(ndk.$subscribe).toHaveBeenCalled();
        });

        it("should not create subscription when event is undefined", () => {
            cleanup = $effect.root(() => {
                createRepostAction(() => ({ event: undefined }), ndk);
            });

            expect(ndk.$subscribe).not.toHaveBeenCalled();
        });

        it("should not create subscription when event has no id", () => {
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.kind = NDKKind.Text;
            eventWithoutId.content = "Test";

            cleanup = $effect.root(() => {
                createRepostAction(() => ({ event: eventWithoutId }), ndk);
            });

            expect(ndk.$subscribe).not.toHaveBeenCalled();
        });
    });

    describe("subscription filters", () => {
        it("should subscribe with correct filters for reposts and quotes", async () => {
            let capturedConfig: any;
            vi.mocked(ndk.$subscribe).mockImplementation((config) => {
                capturedConfig = config();
                return { events: new Set() } as any;
            });

            cleanup = $effect.root(() => {
                createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await waitForEffects();

            expect(capturedConfig).toBeDefined();
            expect(capturedConfig.filters).toHaveLength(2);

            // First filter: regular reposts using event.filter()
            expect(capturedConfig.filters[0]).toEqual(
                expect.objectContaining({
                    kinds: [NDKKind.Repost, NDKKind.GenericRepost],
                    "#e": [testEvent.id]
                })
            );

            // Second filter: quote posts with #q tag
            expect(capturedConfig.filters[1]).toEqual({
                "#q": [testEvent.id]
            });

            expect(capturedConfig.closeOnEose).toBe(false);
        });
    });

    describe("stats - count", () => {
        it("should return 0 when no subscription", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: undefined }), ndk);
            });

            expect(action.count).toBe(0);
        });

        it("should return count from subscription events", async () => {
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = bob.pubkey;

            const repost2 = new NDKEvent(ndk);
            repost2.kind = NDKKind.GenericRepost;
            repost2.pubkey = bob.pubkey;

            const mockSubscription = {
                events: new Set([repost1, repost2]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await waitForEffects();
            expect(action.count).toBe(2);
        });
    });

    describe("stats - hasReposted", () => {
        it("should return false when no subscription", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: undefined }), ndk);
            });

            expect(action.hasReposted).toBe(false);
        });

        it("should return false when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = bob.pubkey;

            const mockSubscription = {
                events: new Set([repost1]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await waitForEffects();
            expect(action.hasReposted).toBe(false);
        });

        it("should return false when current user has not reposted", async () => {
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = bob.pubkey;

            const mockSubscription = {
                events: new Set([repost1]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await waitForEffects();
            expect(action.hasReposted).toBe(false);
        });

        it("should return true when current user has reposted", async () => {
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = alice.pubkey;

            const mockSubscription = {
                events: new Set([repost1]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await waitForEffects();
            expect(action.hasReposted).toBe(true);
        });

        it("should return true when current user has one of multiple reposts", async () => {
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = bob.pubkey;

            const repost2 = new NDKEvent(ndk);
            repost2.kind = NDKKind.GenericRepost;
            repost2.pubkey = alice.pubkey;

            const mockSubscription = {
                events: new Set([repost1, repost2]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await waitForEffects();
            expect(action.hasReposted).toBe(true);
            expect(action.count).toBe(2);
        });
    });

    describe("repost function", () => {
        it("should throw error when event is undefined", async () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: undefined }), ndk);
            });

            await expect(action.repost()).rejects.toThrow("No event to repost");
        });

        it("should throw error when event has no id", async () => {
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.kind = NDKKind.Text;
            eventWithoutId.content = "Test";

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: eventWithoutId }), ndk);
            });

            await expect(action.repost()).rejects.toThrow("No event to repost");
        });

        it("should throw error when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await expect(action.repost()).rejects.toThrow("User must be logged in to repost");
        });

        it("should call event.repost when not already reposted", async () => {
            const repostEvent = new NDKEvent(ndk);
            repostEvent.kind = NDKKind.GenericRepost;
            const mockRepost = vi.fn().mockResolvedValue(repostEvent);

            vi.spyOn(testEvent, "repost").mockImplementation(mockRepost);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            const result = await action.repost();

            expect(testEvent.repost).toHaveBeenCalledWith(true);
            expect(result).toBe(repostEvent);
        });

        it("should delete existing repost when already reposted", async () => {
            const userRepost = new NDKEvent(ndk);
            userRepost.kind = NDKKind.Repost;
            userRepost.pubkey = alice.pubkey;
            const mockDelete = vi.fn().mockResolvedValue(new Set());
            vi.spyOn(userRepost, "delete").mockImplementation(mockDelete);

            const mockSubscription = {
                events: new Set([userRepost]),
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await waitForEffects();

            const result = await action.repost();

            expect(userRepost.delete).toHaveBeenCalled();
            expect(result).toBe(userRepost);
        });
    });

    describe("quote function", () => {
        it("should throw error when event is undefined", async () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: undefined }), ndk);
            });

            await expect(action.quote("Test quote")).rejects.toThrow("No event to quote");
        });

        it("should throw error when event has no id", async () => {
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.kind = NDKKind.Text;
            eventWithoutId.content = "Test";

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: eventWithoutId }), ndk);
            });

            await expect(action.quote("Test quote")).rejects.toThrow("No event to quote");
        });

        it("should throw error when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            await expect(action.quote("Test quote")).rejects.toThrow("User must be logged in to quote");
        });

        it("should create and publish quote event with correct tags", async () => {
            // Mock NDK.publish to intercept the event being published
            let publishedEvent: NDKEvent | undefined;
            const originalPublish = NDKEvent.prototype.publish;
            vi.spyOn(NDKEvent.prototype, "publish").mockImplementation(async function(this: NDKEvent) {
                publishedEvent = this;
                return new Set();
            });

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            const result = await action.quote("Great post!");

            expect(publishedEvent).toBeDefined();
            expect(publishedEvent!.kind).toBe(NDKKind.Text);
            expect(publishedEvent!.content).toBe("Great post!");
            expect(publishedEvent!.tags).toEqual([
                ["q", testEvent.id],
                ["e", testEvent.id, "", "mention"],
                ["p", alice.pubkey]
            ]);

            // Restore original
            NDKEvent.prototype.publish = originalPublish;
        });

        it("should return the published quote event", async () => {
            // Mock publish to succeed
            const originalPublish = NDKEvent.prototype.publish;
            vi.spyOn(NDKEvent.prototype, "publish").mockResolvedValue(new Set());

            let action: any;
            cleanup = $effect.root(() => {
                action = createRepostAction(() => ({ event: testEvent }), ndk);
            });

            const result = await action.quote("My quote");

            expect(result.content).toBe("My quote");
            expect(result.kind).toBe(NDKKind.Text);

            // Restore original
            NDKEvent.prototype.publish = originalPublish;
        });
    });
});
