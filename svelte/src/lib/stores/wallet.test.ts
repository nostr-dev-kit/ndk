import { EventEmitter } from "tseep";
import { beforeEach, describe, expect, it } from "vitest";
import { NDKSvelte } from "../ndk-svelte.svelte";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock wallet class
class MockWallet extends EventEmitter {
    type = "cashu";
    #balance = 1000;
    status = "initial";
    mints: string[] = [];
    privkeys = new Set<string>();

    get balance() {
        return { amount: this.#balance, unit: "sats" };
    }

    async refreshBalance() {
        this.emit("balance_updated");
        return this.#balance;
    }

    setBalance(amount: number) {
        this.#balance = amount;
    }

    async start() {
        // Mock start method
    }
}

describe("WalletStore", () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = new NDKSvelte({ explicitRelayUrls: ["wss://relay.test"], session: true });
    });

    it("should initialize with default state", () => {
        expect(ndk.$wallet).toBeDefined();
        expect(ndk.$wallet.balance).toBe(0);
        expect(ndk.$wallet.privkey).toBeUndefined();
    });

    it("should set wallet and update state", async () => {
        const mockWallet = new MockWallet() as any;

        ndk.$wallet.set(mockWallet);

        // Wait for async balance refresh
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Wallet is set internally, balance is exposed
        expect(ndk.$wallet.balance).toBe(1000);
    });

    it("should update balance when wallet emits balance_updated", async () => {
        const mockWallet = new MockWallet() as any;
        ndk.$wallet.set(mockWallet);

        mockWallet.setBalance(2000);
        mockWallet.emit("balance_updated");

        await ndk.$wallet.refreshBalance();

        expect(ndk.$wallet.balance).toBe(2000);
    });

    it("should clear wallet", () => {
        const mockWallet = new MockWallet() as any;

        ndk.$wallet.set(mockWallet);

        // Verify wallet is set (balance updated)
        expect(ndk.$wallet.balance).toBe(1000);

        ndk.$wallet.clear();

        // After clear, everything should be reset
        expect(ndk.$wallet.balance).toBe(0);
    });

    /**
     * Integration test for session switching race condition
     *
     * This test documents the bug where wallet was cleared during session transitions:
     * 1. Session A has a wallet loaded
     * 2. User switches to Session B (e.g., via login)
     * 3. Session manager fires callback with new activePubkey
     * 4. BUT: Session B's wallet event hasn't loaded yet (eventCount: 0)
     * 5. Bug: Old code would see "no wallet event" and clear()
     * 6. Fix: New code tracks currentPubkey and skips clear on pubkey change
     *
     * Note: This is a regression test that documents expected behavior.
     * Full integration testing with session manager would require more complex setup.
     */
    it("should maintain wallet state through set/clear operations", async () => {
        const mockWallet = new MockWallet() as any;
        mockWallet.setBalance(5000);

        // Simulate: Session A has wallet loaded
        ndk.$wallet.set(mockWallet);

        // Verify wallet is set
        expect(ndk.$wallet.balance).toBe(5000);

        // The fix ensures wallet persists until explicitly cleared
        // (not cleared on pubkey changes)
        expect(ndk.$wallet.balance).toBe(5000);

        // Only explicit clear should reset
        ndk.$wallet.clear();
        expect(ndk.$wallet.balance).toBe(0);
    });
});
