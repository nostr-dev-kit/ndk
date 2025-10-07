import type { NDKWallet, NDKWalletBalance } from "@nostr-dev-kit/wallet";

/**
 * Reactive wrapper around wallet
 */
export class ReactiveWalletStore {
    balance = $state<number>(0);
    wallet = $state<NDKWallet | undefined>(undefined);

    /**
     * Set the active wallet and subscribe to balance updates
     */
    set(wallet: NDKWallet): void {
        // Unsubscribe from previous wallet if any
        if (this.wallet) {
            this.wallet.off("balance_updated", this.#handleBalanceUpdate);
        }

        this.wallet = wallet;

        // Subscribe to balance updates
        wallet.on("balance_updated", this.#handleBalanceUpdate);

        // Get initial balance
        void this.refreshBalance();
    }

    /**
     * Handle balance update events from wallet
     */
    #handleBalanceUpdate = (balance?: NDKWalletBalance): void => {
        if (balance) {
            this.balance = balance.amount || 0;
        }
    };

    /**
     * Manually refresh the wallet balance
     */
    async refreshBalance(): Promise<void> {
        if (!this.wallet) return;

        try {
            const balance = this.wallet.balance;
            this.balance = balance?.amount || 0;
        } catch (error) {
            console.error("[ndk-svelte5] Failed to refresh wallet balance:", error);
        }
    }

    /**
     * Clear the wallet
     */
    clear(): void {
        if (this.wallet) {
            this.wallet.off("balance_updated", this.#handleBalanceUpdate);
        }
        this.wallet = undefined;
        this.balance = 0;
    }
}

export function createReactiveWallet(): ReactiveWalletStore {
    return new ReactiveWalletStore();
}
