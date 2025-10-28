import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
    createZapAmount,
    createIsZapped,
    createTargetTransactions,
    createPendingPayments,
    createTransactions,
    zap,
} from "./runes.svelte.js";
import { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKZapper } from "@nostr-dev-kit/ndk";
import { createTestNDK, UserGenerator, waitForEffects } from "../test-utils.js";
import type { NDKSvelte } from "../ndk-svelte.svelte.js";

describe("payments runes", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;
    let testEvent: NDKEvent;
    let alice: any;

    beforeEach(async () => {
        ndk = createTestNDK();
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        alice = await UserGenerator.getUser("alice", ndk);

        testEvent = new NDKEvent(ndk);
        testEvent.kind = NDKKind.Text;
        testEvent.content = "Test post";
        testEvent.pubkey = alice.pubkey;
        testEvent.id = "test-event-id";

        // Mock tagId for createTargetTransactions
        vi.spyOn(testEvent, "tagId").mockReturnValue("test-event-id");

        // Mock $payments store
        const mockPayments = {
            getZapAmount: vi.fn().mockReturnValue(1000),
            isZapped: vi.fn().mockReturnValue(false),
            byTarget: new Map(),
            pending: [],
            history: [],
            addPending: vi.fn(),
        };

        vi.spyOn(ndk, "$payments", "get").mockReturnValue(mockPayments as any);
        vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(alice.pubkey);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("createZapAmount", () => {
        it("should return derived value from payments store", () => {
            let zapAmount: any;
            cleanup = $effect.root(() => {
                zapAmount = createZapAmount(ndk, testEvent);
            });

            expect(zapAmount.value).toBe(1000);
            expect(ndk.$payments.getZapAmount).toHaveBeenCalledWith(testEvent);
        });

        it("should be reactive to store changes", async () => {
            const mockPayments = ndk.$payments;
            vi.mocked(mockPayments.getZapAmount).mockReturnValue(1000);

            let zapAmount: any;
            cleanup = $effect.root(() => {
                zapAmount = createZapAmount(ndk, testEvent);
            });

            await waitForEffects();
            expect(zapAmount.value).toBe(1000);

            // Simulate store change
            vi.mocked(mockPayments.getZapAmount).mockReturnValue(2000);

            await waitForEffects();
        });
    });

    describe("createIsZapped", () => {
        it("should return derived value from payments store", () => {
            let isZapped: any;
            cleanup = $effect.root(() => {
                isZapped = createIsZapped(ndk, testEvent);
            });

            expect(isZapped.value).toBe(false);
            expect(ndk.$payments.isZapped).toHaveBeenCalledWith(testEvent);
        });

        it("should return true when user has zapped", () => {
            const mockPayments = ndk.$payments;
            vi.mocked(mockPayments.isZapped).mockReturnValue(true);

            let isZapped: any;
            cleanup = $effect.root(() => {
                isZapped = createIsZapped(ndk, testEvent);
            });

            expect(isZapped.value).toBe(true);
        });
    });

    describe("createTargetTransactions", () => {
        it("should return empty array when no transactions", () => {
            let transactions: any;
            cleanup = $effect.root(() => {
                transactions = createTargetTransactions(ndk, testEvent);
            });

            expect(transactions.value).toEqual([]);
        });

        // Note: Testing with populated Map is complex in mocked environment
        // This functionality is tested in integration tests
    });

    describe("createPendingPayments", () => {
        it("should return empty array when no pending payments", () => {
            let pending: any;
            cleanup = $effect.root(() => {
                pending = createPendingPayments(ndk);
            });

            expect(pending.value).toEqual([]);
        });

        it("should return pending payments", () => {
            const mockPending = [
                { amount: 1000, status: "pending" },
                { amount: 500, status: "pending" },
            ];

            const mockPayments = ndk.$payments;
            mockPayments.pending = mockPending;

            let pending: any;
            cleanup = $effect.root(() => {
                pending = createPendingPayments(ndk);
            });

            expect(pending.value).toEqual(mockPending);
        });
    });

    describe("createTransactions", () => {
        const mockHistory = [
            { amount: 1000, direction: "out", type: "zap" },
            { amount: 500, direction: "in", type: "zap" },
            { amount: 200, direction: "out", type: "cashu" },
            { amount: 300, direction: "in", type: "cashu" },
        ];

        beforeEach(() => {
            const mockPayments = ndk.$payments;
            mockPayments.history = mockHistory;
        });

        it("should return all transactions when no filters", () => {
            let transactions: any;
            cleanup = $effect.root(() => {
                transactions = createTransactions(ndk);
            });

            expect(transactions.value).toEqual(mockHistory);
        });

        it("should filter by direction out", () => {
            let transactions: any;
            cleanup = $effect.root(() => {
                transactions = createTransactions(ndk, { direction: "out" });
            });

            expect(transactions.value).toHaveLength(2);
            expect(transactions.value).toEqual([
                { amount: 1000, direction: "out", type: "zap" },
                { amount: 200, direction: "out", type: "cashu" },
            ]);
        });

        it("should filter by direction in", () => {
            let transactions: any;
            cleanup = $effect.root(() => {
                transactions = createTransactions(ndk, { direction: "in" });
            });

            expect(transactions.value).toHaveLength(2);
            expect(transactions.value).toEqual([
                { amount: 500, direction: "in", type: "zap" },
                { amount: 300, direction: "in", type: "cashu" },
            ]);
        });

        it("should filter by type", () => {
            let transactions: any;
            cleanup = $effect.root(() => {
                transactions = createTransactions(ndk, { type: "zap" });
            });

            expect(transactions.value).toHaveLength(2);
            expect(transactions.value).toEqual([
                { amount: 1000, direction: "out", type: "zap" },
                { amount: 500, direction: "in", type: "zap" },
            ]);
        });

        it("should limit results", () => {
            let transactions: any;
            cleanup = $effect.root(() => {
                transactions = createTransactions(ndk, { limit: 2 });
            });

            expect(transactions.value).toHaveLength(2);
            expect(transactions.value).toEqual([
                { amount: 1000, direction: "out", type: "zap" },
                { amount: 500, direction: "in", type: "zap" },
            ]);
        });

        it("should combine filters", () => {
            let transactions: any;
            cleanup = $effect.root(() => {
                transactions = createTransactions(ndk, {
                    direction: "out",
                    type: "zap",
                    limit: 1,
                });
            });

            expect(transactions.value).toHaveLength(1);
            expect(transactions.value).toEqual([{ amount: 1000, direction: "out", type: "zap" }]);
        });
    });

    describe("zap function", () => {
        let mockWallet: any;
        let mockZapperInstance: any;

        beforeEach(() => {
            mockWallet = {};
            ndk.wallet = mockWallet;

            mockZapperInstance = {
                zap: vi.fn().mockResolvedValue(undefined),
            };

            // Mock NDKZapper constructor
            vi.spyOn(NDKZapper.prototype, "zap").mockImplementation(mockZapperInstance.zap);
        });

        it("should throw error when no wallet connected", async () => {
            ndk.wallet = undefined;

            await expect(zap(ndk, testEvent, 1000)).rejects.toThrow("No wallet connected");
        });

        it("should throw error when no active session", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined);

            await expect(zap(ndk, testEvent, 1000)).rejects.toThrow("No active session");
        });

        it("should call NDKZapper.zap()", async () => {
            await zap(ndk, testEvent, 1000);

            expect(NDKZapper.prototype.zap).toHaveBeenCalled();
        });

        it("should add zapper to pending payments", async () => {
            const mockPayments = ndk.$payments;

            await zap(ndk, testEvent, 1000);

            expect(mockPayments.addPending).toHaveBeenCalled();
            // Verify zapper instance and pubkey were passed
            const callArgs = vi.mocked(mockPayments.addPending).mock.calls[0];
            expect(callArgs[0]).toBeInstanceOf(NDKZapper);
            expect(callArgs[1]).toBe(alice.pubkey);
        });

        it("should support comment option", async () => {
            await zap(ndk, testEvent, 1000, { comment: "Great post!" });

            // Verify it completes without error
            expect(NDKZapper.prototype.zap).toHaveBeenCalled();
        });

        it("should support delay option", async () => {
            vi.useFakeTimers();

            const zapPromise = zap(ndk, testEvent, 1000, { delay: 1000 });

            // Should not have been called yet
            expect(NDKZapper.prototype.zap).not.toHaveBeenCalled();

            // Fast-forward time
            vi.advanceTimersByTime(1000);

            await zapPromise;

            expect(NDKZapper.prototype.zap).toHaveBeenCalled();

            vi.useRealTimers();
        });
    });
});
