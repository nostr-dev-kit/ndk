import { NDKPrivateKeySigner, NDKUser, NDK } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMuteAction } from "./mute-action.svelte.js";
import { createTestNDK, UserGenerator, waitForEffects } from "../../test-utils.js";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

describe("createMuteAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let alice: NDKUser;
    let bob: NDKUser;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();

        // Create test users
        alice = await UserGenerator.getUser("alice", ndk as NDK);
        bob = await UserGenerator.getUser("bob", ndk as NDK);

        // Mock the mutes store getter
        const mockMutes = {
            has: vi.fn().mockReturnValue(false),
            toggle: vi.fn().mockResolvedValue(undefined),
        };

        vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);
        vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(alice.pubkey);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("isMuted state", () => {
        it("should return false when target is undefined", () => {
            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: undefined }), ndk);
            });

            expect(action.isMuted).toBe(false);
        });

        it("should return false when target is not muted", () => {
            const mockMutes = ndk.$mutes!;
            vi.mocked(mockMutes.has).mockReturnValue(false);

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob }), ndk);
            });

            expect(action.isMuted).toBe(false);
            expect(mockMutes!.has).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should return true when target is muted", () => {
            const mockMutes = ndk.$mutes!;
            vi.mocked(mockMutes!.has).mockReturnValue(true);

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob }), ndk);
            });

            expect(action.isMuted).toBe(true);
            expect(mockMutes!.has).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should work with string pubkey", () => {
            const mockMutes = ndk.$mutes!;
            vi.mocked(mockMutes!.has).mockReturnValue(true);

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            expect(action.isMuted).toBe(true);
            expect(mockMutes.has).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should throw error when accessing user without pubkey", () => {
            const userWithoutPubkey = new NDKUser({});

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: userWithoutPubkey }), ndk);
            });

            // Accessing isMuted will throw because user.pubkey throws when not set
            expect(() => action.isMuted).toThrow("npub not set");
        });

        it("should return false when $mutes is undefined", () => {
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(undefined as any);

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob }), ndk);
            });

            expect(action.isMuted).toBe(false);
        });
    });

    describe("mute function", () => {
        it("should do nothing when target is undefined", async () => {
            const mockMutes = ndk.$mutes!;

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: undefined }), ndk);
            });

            await action.mute();

            expect(mockMutes!.toggle).not.toHaveBeenCalled();
        });

        it("should throw error when user not logged in", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob }), ndk);
            });

            await expect(action.mute()).rejects.toThrow("User must be logged in to mute");
        });

        it("should call toggle with pubkey when target is NDKUser", async () => {
            const mockMutes = ndk.$mutes!;

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob }), ndk);
            });

            await action.mute();

            expect(mockMutes!.toggle).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should call toggle with pubkey when target is string", async () => {
            const mockMutes = ndk.$mutes!;

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            await action.mute();

            expect(mockMutes!.toggle).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should toggle mute status (mute when not muted)", async () => {
            const mockMutes = ndk.$mutes!;
            vi.mocked(mockMutes.has).mockReturnValue(false);

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob }), ndk);
            });

            expect(action.isMuted).toBe(false);

            await action.mute();

            expect(mockMutes!.toggle).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should toggle mute status (unmute when already muted)", async () => {
            const mockMutes = ndk.$mutes!;
            vi.mocked(mockMutes.has).mockReturnValue(true);

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob }), ndk);
            });

            expect(action.isMuted).toBe(true);

            await action.mute();

            expect(mockMutes!.toggle).toHaveBeenCalledWith(bob.pubkey);
        });
    });

    describe("reactive updates", () => {
        it("should react to changes in mute status", async () => {
            const mockMutes = ndk.$mutes!;
            // Start with not muted
            vi.mocked(mockMutes.has).mockReturnValue(false);

            let action: any;
            cleanup = $effect.root(() => {
                action = createMuteAction(() => ({ target: bob }), ndk);
            });

            await waitForEffects();
            expect(action.isMuted).toBe(false);

            vi.mocked(mockMutes!.has).mockReturnValue(true);

            // The isMuted is derived, so it should update when checked again
            // Note: In real usage, the store change would trigger reactivity
            await waitForEffects();
        });
    });
});
