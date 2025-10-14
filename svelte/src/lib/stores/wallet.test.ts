import { EventEmitter } from "tseep";
import { beforeEach, describe, expect, it } from "vitest";
import { NDKSvelte } from "../ndk-svelte.svelte";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock wallet class
class MockWallet extends EventEmitter {
    type = "cashu";
    #balance = 1000;

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
}

describe("WalletStore", () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = new NDKSvelte({ explicitRelayUrls: ["wss://relay.test"], session: true });
    });

    it("should initialize with default state", () => {
        expect(ndk.$wallet).toBeDefined();
        expect(ndk.$wallet.balance).toBe(0);
        expect(ndk.$wallet.wallet).toBeUndefined();
    });

    it("should set wallet and update state", async () => {
        const mockWallet = new MockWallet() as any;

        ndk.$wallet.set(mockWallet);

        // Wait for async balance refresh
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(ndk.$wallet.wallet).toBe(mockWallet);
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

        ndk.$wallet.clear();

        expect(ndk.$wallet.balance).toBe(0);
        expect(ndk.$wallet.wallet).toBeUndefined();
    });
});
