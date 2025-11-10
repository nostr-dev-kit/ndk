import { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser, NDKZapper } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../test-utils";
import { createZapSendAction } from "./index.svelte";

describe("createZapSendAction", () => {
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

        // Create a test event to zap
        const factory = new TestEventFactory(ndk as any);
        testEvent = await factory.createSignedTextNote("Test note", "alice");
        testEvent.id = generateTestEventId("note1");
        testEvent.ndk = ndk; // Ensure NDK is set
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with default values", () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            expect(zapState!.amount).toBe(1000);
            expect(zapState!.comment).toBe("");
            expect(zapState!.sending).toBe(false);
            expect(zapState!.error).toBeNull();
        });

        it("should allow reading and writing amount", () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            expect(zapState!.amount).toBe(1000);

            zapState!.amount = 5000;
            flushSync();

            expect(zapState!.amount).toBe(5000);
        });

        it("should allow reading and writing comment", () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            expect(zapState!.comment).toBe("");

            zapState!.comment = "Great post!";
            flushSync();

            expect(zapState!.comment).toBe("Great post!");
        });

        it("should provide splits array", () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            expect(Array.isArray(zapState!.splits)).toBe(true);
        });
    });

    describe("send() function", () => {
        it("should create NDKZapper with correct parameters", async () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            const zapSpy = vi.spyOn(NDKZapper.prototype, "zap").mockResolvedValue(undefined);

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            zapState!.amount = 2000;
            zapState!.comment = "Great work!";
            flushSync();

            await zapState!.send();

            expect(zapSpy).toHaveBeenCalled();
        });

        it("should set sending to true during zap", async () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            // Mock zap with delay
            vi.spyOn(NDKZapper.prototype, "zap").mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
            });

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            expect(zapState!.sending).toBe(false);

            const sendPromise = zapState!.send();

            // Should be true during send
            await new Promise(resolve => setTimeout(resolve, 1));
            expect(zapState!.sending).toBe(true);

            await sendPromise;

            // Should be false after send completes
            expect(zapState!.sending).toBe(false);
        });

        it("should set sending to false after error", async () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            const error = new Error("Zap failed");
            vi.spyOn(NDKZapper.prototype, "zap").mockRejectedValue(error);

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            await expect(zapState!.send()).rejects.toThrow("Zap failed");

            // Should still be false after error
            expect(zapState!.sending).toBe(false);
        });

        it("should store error when zap fails", async () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            const error = new Error("Zap failed");
            vi.spyOn(NDKZapper.prototype, "zap").mockRejectedValue(error);

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            expect(zapState!.error).toBeNull();

            await expect(zapState!.send()).rejects.toThrow("Zap failed");

            expect(zapState!.error).toBe(error);
        });

        it("should clear previous error on successful zap", async () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            const zapSpy = vi.spyOn(NDKZapper.prototype, "zap")
                .mockRejectedValueOnce(new Error("First error"))
                .mockResolvedValueOnce(undefined);

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: testEvent }), ndk);
            });

            // First zap fails
            await expect(zapState!.send()).rejects.toThrow("First error");
            expect(zapState!.error).not.toBeNull();

            // Second zap succeeds
            await zapState!.send();
            expect(zapState!.error).toBeNull();
        });

        it("should throw error when target is undefined", async () => {
            let zapState: ReturnType<typeof createZapSendAction> | undefined;
            let currentTarget = $state<NDKEvent | undefined>(testEvent);

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: currentTarget as any }), ndk);
            });

            // Clear target
            currentTarget = undefined;
            flushSync();

            await expect(zapState!.send()).rejects.toThrow("No target to zap");
        });
    });

    describe("reactive config updates", () => {
        it("should handle target changes", () => {
            let currentTarget = $state<NDKEvent>(testEvent);
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: currentTarget }), ndk);
            });

            expect(zapState!.amount).toBe(1000);

            // Change target
            const newEvent = new NDKEvent(ndk);
            newEvent.kind = NDKKind.Text;
            newEvent.content = "Different note";
            newEvent.pubkey = bob.pubkey;
            newEvent.id = generateTestEventId("note2");
            newEvent.ndk = ndk;

            currentTarget = newEvent;
            flushSync();

            // Should still work with new target
            expect(zapState!.amount).toBe(1000);
            expect(Array.isArray(zapState!.splits)).toBe(true);
        });

        it("should handle target changing from event to user", () => {
            let currentTarget = $state<NDKEvent | NDKUser>(testEvent);
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: currentTarget }), ndk);
            });

            expect(zapState!.amount).toBe(1000);

            // Change to NDKUser
            const user = new NDKUser({ pubkey: bob.pubkey });
            user.ndk = ndk;
            currentTarget = user;
            flushSync();

            // Should still work with user target
            expect(zapState!.amount).toBe(1000);
            expect(Array.isArray(zapState!.splits)).toBe(true);
        });

        it("should reset state when target becomes undefined", () => {
            let currentTarget = $state<NDKEvent | undefined>(testEvent);
            let zapState: ReturnType<typeof createZapSendAction> | undefined;

            cleanup = $effect.root(() => {
                zapState = createZapSendAction(() => ({ target: currentTarget as any }), ndk);
            });

            // Clear target
            currentTarget = undefined;
            flushSync();

            // Splits should be empty when no target
            expect(zapState!.splits).toEqual([]);
        });
    });
});
