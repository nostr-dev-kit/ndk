import { NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, UserGenerator } from "../../../../test-utils";
import { createMuteAction } from "./index.svelte";

describe("createMuteAction", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let alice: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let bob: Awaited<ReturnType<typeof UserGenerator.getUser>>;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        // Create test users
        alice = await UserGenerator.getUser("alice", ndk as any);
        bob = await UserGenerator.getUser("bob", ndk as any);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    // Helper to create a mock $mutes set
    function createMockMutes(initialMutes: string[] = []) {
        const mutesSet = new Set<string>(initialMutes);
        (mutesSet as any).toggle = async (pubkey: string) => {
            if (mutesSet.has(pubkey)) {
                mutesSet.delete(pubkey);
            } else {
                mutesSet.add(pubkey);
            }
        };
        return mutesSet;
    }

    describe("initialization", () => {
        it("should initialize with isMuted false when target is not muted", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes();
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            expect(muteState!.isMuted).toBe(false);
        });

        it("should initialize with isMuted true when target is already muted", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes([bob.pubkey]);
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            expect(muteState!.isMuted).toBe(true);
        });

        it("should handle undefined target", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes();
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: undefined }), ndk);
            });

            expect(muteState!.isMuted).toBe(false);
        });

        it("should handle NDKUser as target", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;
            const user = new NDKUser({ pubkey: bob.pubkey });

            const mockMutes = createMockMutes();
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: user }), ndk);
            });

            expect(muteState!.isMuted).toBe(false);
        });

        it("should handle string pubkey as target", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes();
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            expect(muteState!.isMuted).toBe(false);
        });
    });

    describe("isMuted state", () => {
        it("should detect when target is muted (string pubkey)", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes([bob.pubkey]);
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            expect(muteState!.isMuted).toBe(true);
        });

        it("should detect when target is muted (NDKUser)", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;
            const user = new NDKUser({ pubkey: bob.pubkey });

            const mockMutes = createMockMutes([bob.pubkey]);
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: user }), ndk);
            });

            expect(muteState!.isMuted).toBe(true);
        });

        it("should return false when target is not muted", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes();
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            expect(muteState!.isMuted).toBe(false);
        });

        it("should handle when $mutes is undefined", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(undefined as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            expect(muteState!.isMuted).toBe(false);
        });

        it("should handle when $mutes is null", () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(null as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            expect(muteState!.isMuted).toBe(false);
        });
    });

    describe("mute() function", () => {
        it("should call toggle on $mutes with string pubkey", async () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes();
            const toggleSpy = vi.spyOn(mockMutes as any, "toggle");
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndk);
            });

            await muteState!.mute();

            expect(toggleSpy).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should call toggle on $mutes with NDKUser target", async () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;
            const user = new NDKUser({ pubkey: bob.pubkey });

            const mockMutes = createMockMutes();
            const toggleSpy = vi.spyOn(mockMutes as any, "toggle");
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: user }), ndk);
            });

            await muteState!.mute();

            expect(toggleSpy).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should do nothing when target is undefined", async () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes();
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: undefined }), ndk);
            });

            const mutesSize = mockMutes.size;

            await muteState!.mute();

            // Should not change mutes
            expect(mockMutes.size).toBe(mutesSize);
        });

        it("should throw error when user is not logged in", async () => {
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            // Create NDK without signer (so $currentPubkey is undefined)
            const ndkNoSigner = createTestNDK();

            const mockMutes = createMockMutes();
            vi.spyOn(ndkNoSigner, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: bob.pubkey }), ndkNoSigner);
            });

            await expect(muteState!.mute()).rejects.toThrow("User must be logged in to mute");
        });
    });

    describe("reactive target updates", () => {
        it("should update isMuted when target changes", () => {
            let currentTarget = $state(alice.pubkey);
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes([bob.pubkey]);
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: currentTarget }), ndk);
            });

            // Alice is not muted
            expect(muteState!.isMuted).toBe(false);

            // Change to Bob (who is muted)
            currentTarget = bob.pubkey;
            flushSync();

            expect(muteState!.isMuted).toBe(true);
        });

        it("should handle target changing to undefined", () => {
            let currentTarget = $state<string | undefined>(bob.pubkey);
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes([bob.pubkey]);
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: currentTarget }), ndk);
            });

            expect(muteState!.isMuted).toBe(true);

            // Change to undefined
            currentTarget = undefined;
            flushSync();

            expect(muteState!.isMuted).toBe(false);
        });

        it("should handle target changing from NDKUser to string", () => {
            let currentTarget = $state<NDKUser | string>(new NDKUser({ pubkey: alice.pubkey }));
            let muteState: ReturnType<typeof createMuteAction> | undefined;

            const mockMutes = createMockMutes([bob.pubkey]);
            vi.spyOn(ndk, "$mutes", "get").mockReturnValue(mockMutes as any);

            cleanup = $effect.root(() => {
                muteState = createMuteAction(() => ({ target: currentTarget }), ndk);
            });

            expect(muteState!.isMuted).toBe(false);

            // Change to Bob's pubkey string
            currentTarget = bob.pubkey;
            flushSync();

            expect(muteState!.isMuted).toBe(true);
        });
    });
});
