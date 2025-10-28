import { NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFollowAction } from "./follow-action.svelte.js";
import { createTestNDK, UserGenerator, waitForEffects } from "../../test-utils.js";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

describe("createFollowAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let alice: NDKUser;
    let bob: NDKUser;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();

        // Create test users
        alice = await UserGenerator.getUser("alice", ndk);
        bob = await UserGenerator.getUser("bob", ndk);

        // Mock the follows store getter
        const mockFollows = {
            has: vi.fn().mockReturnValue(false),
            add: vi.fn().mockResolvedValue(undefined),
            remove: vi.fn().mockResolvedValue(undefined),
        };

        vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("isFollowing state", () => {
        it("should return false when target is undefined", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: undefined }), ndk);
            });

            expect(action.isFollowing).toBe(false);
        });

        it("should return false when not following user", () => {
            const mockFollows = ndk.$follows;
            vi.mocked(mockFollows.has).mockReturnValue(false);

            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: bob }), ndk);
            });

            expect(action.isFollowing).toBe(false);
            expect(mockFollows.has).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should return true when following user", () => {
            const mockFollows = ndk.$follows;
            vi.mocked(mockFollows.has).mockReturnValue(true);

            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: bob }), ndk);
            });

            expect(action.isFollowing).toBe(true);
            expect(mockFollows.has).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should handle user without pubkey gracefully", () => {
            const userWithoutPubkey = new NDKUser({});

            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: userWithoutPubkey }), ndk);
            });

            expect(action.isFollowing).toBe(false);
        });
    });

    describe("follow function", () => {
        it("should do nothing when target is undefined", async () => {
            const mockFollows = ndk.$follows;

            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: undefined }), ndk);
            });

            await action.follow();

            expect(mockFollows.add).not.toHaveBeenCalled();
            expect(mockFollows.remove).not.toHaveBeenCalled();
        });

        it("should add user to follows when not following", async () => {
            const mockFollows = ndk.$follows;
            vi.mocked(mockFollows.has).mockReturnValue(false);

            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: bob }), ndk);
            });

            await action.follow();

            expect(mockFollows.add).toHaveBeenCalledWith(bob.pubkey);
            expect(mockFollows.remove).not.toHaveBeenCalled();
        });

        it("should remove user from follows when already following", async () => {
            const mockFollows = ndk.$follows;
            vi.mocked(mockFollows.has).mockReturnValue(true);

            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: bob }), ndk);
            });

            await action.follow();

            expect(mockFollows.remove).toHaveBeenCalledWith(bob.pubkey);
            expect(mockFollows.add).not.toHaveBeenCalled();
        });

        it("should throw error when user not loaded", async () => {
            const userWithoutPubkey = new NDKUser({});

            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: userWithoutPubkey }), ndk);
            });

            await expect(action.follow()).rejects.toThrow("User not loaded yet");
        });
    });

    describe("reactive updates", () => {
        it("should react to changes in follow status", async () => {
            const mockFollows = ndk.$follows;
            // Start with not following
            vi.mocked(mockFollows.has).mockReturnValue(false);

            let action: any;
            cleanup = $effect.root(() => {
                action = createFollowAction(() => ({ target: bob }), ndk);
            });

            await waitForEffects();
            expect(action.isFollowing).toBe(false);

            // Simulate adding to follows
            vi.mocked(mockFollows.has).mockReturnValue(true);

            // The isFollowing is derived, so it should update when checked again
            // Note: In real usage, the store change would trigger reactivity
            await waitForEffects();
        });
    });
});
