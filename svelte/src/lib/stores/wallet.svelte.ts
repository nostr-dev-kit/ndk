import type NDK from "@nostr-dev-kit/ndk";
import { type Hexpubkey, NDKKind as Kind, type NDKEvent, type NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSessionManager } from "@nostr-dev-kit/sessions";
import {
    type NDKCashuDeposit,
    NDKCashuWallet,
    type NDKWallet,
    type NDKWalletBalance,
    NDKWalletStatus,
} from "@nostr-dev-kit/wallet";

export interface Mint {
    url: string;
    balance: number;
}

export interface Transaction {
    type: "send" | "receive";
    amount: number;
    timestamp: number;
    memo?: string;
    status: string;
}

/**
 * Complete reactive wallet API for Svelte applications.
 *
 * Provides reactive state, convenience getters, and method delegates
 * for NDKCashuWallet. Automatically syncs with NDKSessionManager to
 * manage wallet lifecycle based on active session.
 *
 * @example
 * // Direct usage in Svelte
 * const wallet = ndk.$wallet;
 * await wallet.send(1000, "Coffee");
 * console.log(wallet.mints, wallet.relays, wallet.transactions);
 */
export class ReactiveWalletStore {
    balance = $state<number>(0);
    #wallet = $state<NDKWallet | undefined>(undefined);
    status = $state<NDKWalletStatus>(NDKWalletStatus.INITIAL);
    #ndk: NDK;
    #sessionManager: NDKSessionManager;
    #currentWalletEventId?: string;

    constructor(ndk: NDK, sessionManager: NDKSessionManager) {
        this.#ndk = ndk;
        this.#sessionManager = sessionManager;

        // Subscribe to session manager and react to wallet events
        sessionManager.subscribe((state) => {
            const activePubkey = state.activePubkey;
            if (!activePubkey) {
                // No active session, clear wallet
                this.clear();
                return;
            }

            const session = state.sessions.get(activePubkey);
            const walletEvent = session?.events.get(Kind.CashuWallet as NDKKind);

            if (!walletEvent) {
                // No wallet event, clear wallet if it was set
                if (this.#wallet) {
                    this.clear();
                }
                return;
            }

            // Check if we already have this wallet loaded
            if (walletEvent.id === this.#currentWalletEventId) {
                return;
            }

            // Sync wallet from event
            this.#syncWallet(walletEvent, activePubkey);
        });
    }

    /**
     * Sync wallet from session's wallet event (kind 17375)
     */
    async #syncWallet(walletEvent: NDKEvent, pubkey: Hexpubkey): Promise<void> {
        try {
            // Instantiate wallet from event
            const wallet = await NDKCashuWallet.from(walletEvent);

            if (wallet) {
                // Set wallet on store BEFORE starting so UI can show immediately
                this.set(wallet);
                this.#currentWalletEventId = walletEvent.id;

                // Start wallet monitoring (will load from cache first, then sync)
                await wallet.start({ pubkey });
            }
        } catch (error) {
            console.error(`[ReactiveWalletStore] Failed to load wallet from event:`, error);
        }
    }

    /**
     * Set the active wallet and subscribe to balance updates
     */
    set(wallet: NDKWallet): void {
        // Unsubscribe from previous wallet if any
        if (this.#wallet) {
            this.#wallet.off("balance_updated", this.#handleBalanceUpdate);
            this.#wallet.off("status_changed", this.#handleStatusChange);
        }

        this.#wallet = wallet;
        this.status = wallet.status;

        // Register wallet with NDK so its payment methods are available to NDKZapper
        this.#ndk.wallet = wallet;

        // Subscribe to balance updates
        wallet.on("balance_updated", this.#handleBalanceUpdate);
        wallet.on("status_changed", this.#handleStatusChange);

        // Get initial balance
        void this.refreshBalance();
    }

    /**
     * Handle balance update events from wallet
     */
    #handleBalanceUpdate = (balance?: NDKWalletBalance): void => {
        if (balance) {
            this.balance = balance.amount || 0;
        } else {
            // If no balance is provided, refresh it
            void this.refreshBalance();
        }
    };

    /**
     * Handle status change events from wallet
     */
    #handleStatusChange = (status: NDKWalletStatus): void => {
        this.status = status;
    };

    /**
     * Manually refresh the wallet balance
     */
    async refreshBalance(): Promise<void> {
        if (!this.#wallet) return;

        try {
            const balance = this.#wallet.balance;
            this.balance = balance?.amount || 0;
        } catch (error) {
            console.error("[svelte] Failed to refresh wallet balance:", error);
        }
    }

    /**
     * Clear the wallet
     */
    clear(): void {
        if (this.#wallet) {
            this.#wallet.off("balance_updated", this.#handleBalanceUpdate);
            this.#wallet.off("status_changed", this.#handleStatusChange);
        }
        this.#wallet = undefined;
        this.balance = 0;
        this.status = NDKWalletStatus.INITIAL;
        this.#currentWalletEventId = undefined;

        // Clear wallet from NDK
        this.#ndk.wallet = undefined;
    }

    // Convenience getters

    /**
     * Get mints with balances
     */
    get mints(): Mint[] {
        const wallet = this.#wallet;
        if (!wallet || !(wallet instanceof NDKCashuWallet)) return [];

        const balances = wallet.state.getMintsBalance();
        const mints: Mint[] = [];

        for (const [url, balance] of Object.entries(balances)) {
            if (typeof balance === "number" && balance > 0) {
                mints.push({ url, balance });
            }
        }

        // If we have a total balance but no per-mint breakdown, use the configured mints
        if (mints.length === 0 && this.balance > 0) {
            const configuredMints = wallet.mints;
            if (configuredMints.length > 0) {
                return configuredMints.map((url) => ({ url, balance: this.balance }));
            }
        }

        return mints.sort((a, b) => b.balance - a.balance);
    }

    /**
     * Get configured relay URLs
     */
    get relays(): string[] {
        const wallet = this.#wallet;
        if (!wallet || !(wallet instanceof NDKCashuWallet)) return [];
        if (!wallet.relaySet) return [];
        return Array.from(wallet.relaySet.relays).map((relay) => relay.url);
    }

    /**
     * Get transaction history
     */
    get transactions(): Transaction[] {
        const paymentTxs = this.#ndk.$payments.history.map((tx: any) => ({
            type: tx.direction === "out" ? ("send" as const) : ("receive" as const),
            amount: tx.amount,
            timestamp: tx.timestamp,
            memo: tx.comment,
            status: tx.status === "confirmed" ? "completed" : tx.status,
        }));

        return paymentTxs.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Check if wallet needs onboarding (no wallet or no mints configured)
     */
    get needsOnboarding(): boolean {
        const wallet = this.#wallet;
        return !wallet || (wallet instanceof NDKCashuWallet && wallet.mints.length === 0);
    }

    // Method delegates

    /**
     * Create a deposit to add funds to the wallet
     */
    deposit(amount: number, mint?: string): NDKCashuDeposit | undefined {
        const wallet = this.#wallet;
        if (!(wallet instanceof NDKCashuWallet)) return undefined;
        return wallet.deposit(amount, mint);
    }

    /**
     * Create a cashu token to send to someone
     */
    async send(amount: number, memo?: string): Promise<string> {
        const wallet = this.#wallet;
        if (!(wallet instanceof NDKCashuWallet)) throw new Error("No wallet");
        return wallet.send(amount, memo);
    }

    /**
     * Receive a cashu token
     */
    async receiveToken(token: string, memo?: string): Promise<void> {
        const wallet = this.#wallet;
        if (!(wallet instanceof NDKCashuWallet)) throw new Error("No wallet");
        await wallet.receiveToken(token, memo);
    }

    /**
     * Get the P2PK public key for this wallet
     */
    async getP2PKPubkey(): Promise<string> {
        const wallet = this.#wallet;
        if (!(wallet instanceof NDKCashuWallet)) throw new Error("No wallet");
        return await wallet.getP2pk();
    }

    /**
     * Create and publish a new wallet
     */
    async setupWallet(config: { mints: string[]; relays?: string[] }): Promise<void> {
        const session = this.#sessionManager.getState().activePubkey;
        if (!session) throw new Error("No active session");

        const wallet = await NDKCashuWallet.create(this.#ndk, config.mints, config.relays);
        await wallet.start({ pubkey: session });
        this.set(wallet);
    }

    /**
     * Update existing wallet configuration (mints and relays)
     * If no wallet exists, creates a new one instead.
     */
    async updateWallet(config: { mints: string[]; relays?: string[] }): Promise<void> {
        const wallet = this.#wallet;
        if (!(wallet instanceof NDKCashuWallet)) {
            // No wallet exists, create one
            return this.setupWallet(config);
        }

        // Update existing wallet using the new update method
        await wallet.update(config);
    }
}

export function createReactiveWallet(ndk: NDK, sessionManager: NDKSessionManager): ReactiveWalletStore {
    return new ReactiveWalletStore(ndk, sessionManager);
}
