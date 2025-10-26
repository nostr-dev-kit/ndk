import type NDK from "@nostr-dev-kit/ndk";
import { type Hexpubkey, NDKKind as Kind, type NDKEvent, type NDKKind, type LnPaymentInfo } from "@nostr-dev-kit/ndk";
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
    #currentPubkey?: string;
    #syncing = false;

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

            // Check if active pubkey changed
            const pubkeyChanged = this.#currentPubkey && this.#currentPubkey !== activePubkey;

            if (!walletEvent) {
                // Only clear wallet if we're on the SAME pubkey and wallet event disappeared
                // Don't clear if we switched to a different pubkey that doesn't have a wallet yet
                if (this.#wallet && !pubkeyChanged) {
                    this.clear();
                }
                return;
            }

            // Check if we already have this wallet loaded
            if (walletEvent.id === this.#currentWalletEventId && activePubkey === this.#currentPubkey) {
                return;
            }

            // Skip if we're already syncing to prevent race conditions
            if (this.#syncing) {
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
        this.#syncing = true;
        try {
            // Instantiate wallet from event
            const wallet = await NDKCashuWallet.from(walletEvent);

            if (wallet) {
                // Set current wallet event ID and pubkey FIRST to prevent re-syncing during start()
                this.#currentWalletEventId = walletEvent.id;
                this.#currentPubkey = pubkey;

                // Set wallet on store BEFORE starting so UI can show immediately
                this.set(wallet);

                // Start wallet monitoring (will load from cache first, then sync)
                await wallet.start({ pubkey });
            }
        } catch (error) {
            console.error(`[ReactiveWalletStore] Failed to load wallet from event:`, error);
        } finally {
            this.#syncing = false;
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
        this.#currentPubkey = undefined;

        // Clear wallet from NDK
        this.#ndk.wallet = undefined;
    }

    // Convenience getters

    /**
     * Get configured mint URLs
     */
    get mints(): string[] {
        const wallet = this.#wallet;
        if (!wallet || !(wallet instanceof NDKCashuWallet)) return [];
        return wallet.mints;
    }

    /**
     * Get all mints with their balances (including configured mints with 0 balance)
     */
    get mintBalances(): Mint[] {
        const wallet = this.#wallet;
        if (!wallet || !(wallet instanceof NDKCashuWallet)) return [];

        const balances = wallet.state.getMintsBalance();
        const configuredMints = wallet.mints;
        const mintMap = new Map<string, number>();

        // First, add all configured mints with 0 balance
        for (const url of configuredMints) {
            mintMap.set(url, 0);
        }

        // Then update with actual balances
        for (const [url, balance] of Object.entries(balances)) {
            if (typeof balance === "number") {
                mintMap.set(url, balance);
            }
        }

        // Convert to array and sort by balance
        return Array.from(mintMap.entries())
            .map(([url, balance]) => ({ url, balance }))
            .sort((a, b) => b.balance - a.balance);
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

    /**
     * Get the wallet's private key (first privkey)
     */
    get privkey(): string | undefined {
        const wallet = this.#wallet;
        if (!(wallet instanceof NDKCashuWallet)) return undefined;
        const privkeys = Array.from(wallet.privkeys);
        return privkeys.length > 0 ? privkeys[0] : undefined;
    }

    /**
     * Get the wallet's relay set
     */
    get relaySet() {
        const wallet = this.#wallet;
        if (!(wallet instanceof NDKCashuWallet)) return undefined;
        return wallet.relaySet;
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
     * Pay a Lightning invoice
     */
    async lnPay(payment: LnPaymentInfo): Promise<any> {
        const wallet = this.#wallet;
        if (!(wallet instanceof NDKCashuWallet)) throw new Error("No wallet");
        return wallet.lnPay(payment);
    }

    /**
     * Save wallet configuration (mints and relays).
     * Creates a new wallet if none exists, or updates the existing one.
     * Also publishes the CashuMintList (kind 10019) for nutzap reception.
     *
     * @param config - Wallet configuration with mints and optional relays
     * @returns Promise that resolves when wallet is saved
     *
     * @example
     * // Create or update wallet
     * await ndk.$wallet.save({
     *   mints: ['https://mint.example.com'],
     *   relays: ['wss://relay.example.com']
     * });
     */
    async save(config: { mints: string[]; relays?: string[] }): Promise<void> {
        let wallet = this.#wallet;

        if (!(wallet instanceof NDKCashuWallet)) {
            // No wallet exists, create one
            const session = this.#sessionManager.getState().activePubkey;
            if (!session) throw new Error("No active session");

            const newWallet = await NDKCashuWallet.create(this.#ndk, config.mints, config.relays);
            await newWallet.start({ pubkey: session });
            this.set(newWallet);
            wallet = newWallet;
        } else {
            // Update existing wallet
            await wallet.update(config);
        }

        // Publish CashuMintList (kind 10019) for nutzap reception
        await wallet.publishMintList();
    }
}

export function createReactiveWallet(ndk: NDK, sessionManager: NDKSessionManager): ReactiveWalletStore {
    return new ReactiveWalletStore(ndk, sessionManager);
}
