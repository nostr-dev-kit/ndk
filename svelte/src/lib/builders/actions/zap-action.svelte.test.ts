import { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createZapAction } from "./zap-action.svelte.js";
import { createTestNDK, UserGenerator, waitForEffects } from "../../test-utils.js";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

describe("createZapAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let testEvent: NDKEvent;
    let testUser: NDKUser;
    let alice: any;
    let bob: any;

    beforeEach(async () => {
        ndk = createTestNDK();
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        // Create test users
        alice = await UserGenerator.getUser("alice", ndk);
        bob = await UserGenerator.getUser("bob", ndk);
        testUser = bob;

        // Create test event with ID
        testEvent = new NDKEvent(ndk);
        testEvent.kind = NDKKind.Text;
        testEvent.content = "Original post";
        testEvent.pubkey = alice.pubkey;
        testEvent.created_at = Math.floor(Date.now() / 1000);
        testEvent.tags = [];
        testEvent.id = "test-event-id-12345";
        // Add zap method
        (testEvent as any).zap = vi.fn().mockResolvedValue(undefined);

        // Add zap method to test user
        (testUser as any).zap = vi.fn().mockResolvedValue(undefined);

        // Mock $subscribe
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
        it("should create subscription for event with id", async () => {
            cleanup = $effect.root(() => {
                createZapAction(() => ({ target: testEvent }), ndk);
            });

            await waitForEffects();

            expect(ndk.$subscribe).toHaveBeenCalled();
        });

        it("should create subscription for user", async () => {
            cleanup = $effect.root(() => {
                createZapAction(() => ({ target: testUser }), ndk);
            });

            await waitForEffects();

            expect(ndk.$subscribe).toHaveBeenCalled();
        });

        it("should not create subscription when target is undefined", () => {
            cleanup = $effect.root(() => {
                createZapAction(() => ({ target: undefined }), ndk);
            });

            expect(ndk.$subscribe).not.toHaveBeenCalled();
        });

        it("should create subscription when event has no id (filters by pubkey)", async () => {
            const eventWithoutId = new NDKEvent(ndk);
            eventWithoutId.kind = NDKKind.Text;
            eventWithoutId.content = "Test";
            eventWithoutId.pubkey = alice.pubkey;

            cleanup = $effect.root(() => {
                createZapAction(() => ({ target: eventWithoutId }), ndk);
            });

            await waitForEffects();

            expect(ndk.$subscribe).toHaveBeenCalled();
        });
    });

    describe("subscription filters", () => {
        it("should subscribe with #e filter for events with id", async () => {
            let capturedConfig: any;
            vi.mocked(ndk.$subscribe).mockImplementation((config) => {
                capturedConfig = config();
                return { events: [] } as any;
            });

            cleanup = $effect.root(() => {
                createZapAction(() => ({ target: testEvent }), ndk);
            });

            await waitForEffects();

            expect(capturedConfig).toBeDefined();
            expect(capturedConfig.filters).toEqual([
                expect.objectContaining({
                    kinds: [9735],
                    "#e": [testEvent.id]
                })
            ]);
            expect(capturedConfig.closeOnEose).toBe(false);
        });

        it("should subscribe with #p filter for users", async () => {
            let capturedConfig: any;
            vi.mocked(ndk.$subscribe).mockImplementation((config) => {
                capturedConfig = config();
                return { events: [] } as any;
            });

            cleanup = $effect.root(() => {
                createZapAction(() => ({ target: testUser }), ndk);
            });

            await waitForEffects();

            expect(capturedConfig).toBeDefined();
            expect(capturedConfig.filters).toEqual([
                expect.objectContaining({
                    kinds: [9735],
                    "#p": [testUser.pubkey]
                })
            ]);
        });
    });

    describe("stats - count", () => {
        it("should return 0 when no subscription", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createZapAction(() => ({ target: undefined }), ndk);
            });

            expect(action.count).toBe(0);
        });

        it("should return count from subscription events", async () => {
            const zap1 = new NDKEvent(ndk);
            zap1.kind = 9735;

            const zap2 = new NDKEvent(ndk);
            zap2.kind = 9735;

            const mockSubscription = {
                events: [zap1, zap2],
            };
            vi.mocked(ndk.$subscribe).mockReturnValue(mockSubscription as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createZapAction(() => ({ target: testEvent }), ndk);
            });

            await waitForEffects();
            expect(action.count).toBe(2);
        });
    });

    describe("stats - totalAmount and hasZapped", () => {
        it("should return 0 amount when no subscription", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createZapAction(() => ({ target: undefined }), ndk);
            });

            expect(action.totalAmount).toBe(0);
            expect(action.hasZapped).toBe(false);
        });

        // Note: Testing totalAmount and hasZapped fully requires mocking zapInvoiceFromEvent
        // which is complex in browser test environment. These are tested in integration tests.
    });

    describe("zap function", () => {
        it("should throw error when target is undefined", async () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createZapAction(() => ({ target: undefined }), ndk);
            });

            await expect(action.zap(1000)).rejects.toThrow("No target to zap");
        });

        it("should throw error when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            let action: any;
            cleanup = $effect.root(() => {
                action = createZapAction(() => ({ target: testEvent }), ndk);
            });

            await expect(action.zap(1000)).rejects.toThrow("User must be logged in to zap");
        });

        it("should call target.zap with amount in millisats", async () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createZapAction(() => ({ target: testEvent }), ndk);
            });

            await action.zap(10); // 10 sats

            expect(testEvent.zap).toHaveBeenCalledWith(10000, undefined); // 10000 millisats
        });

        it("should pass comment to target.zap", async () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createZapAction(() => ({ target: testEvent }), ndk);
            });

            await action.zap(5, "Great post!");

            expect(testEvent.zap).toHaveBeenCalledWith(5000, "Great post!");
        });

        it("should work with user targets", async () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createZapAction(() => ({ target: testUser }), ndk);
            });

            await action.zap(21);

            expect(testUser.zap).toHaveBeenCalledWith(21000, undefined);
        });
    });
});
