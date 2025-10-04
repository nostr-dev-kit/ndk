import type NDK from "@nostr-dev-kit/ndk";
import { NDKKind, NDKSubscriptionCacheUsage, type NDKUser, NDKCashuMintList } from "@nostr-dev-kit/ndk";
import type { NDKWallet, NDKWalletBalance } from "@nostr-dev-kit/ndk-wallet";
import { NDKCashuWallet, type NDKCashuDeposit } from "@nostr-dev-kit/ndk-wallet";
import type { NDKNWCWallet } from "@nostr-dev-kit/ndk-wallet";
import type { NDKNutzapMonitor } from "@nostr-dev-kit/ndk-wallet";
import type { NDKNutzap } from "@nostr-dev-kit/ndk";
import type { Proof, ProofState as CashuProofState } from "@cashu/cashu-ts";

/**
 * Transaction types
 */
export type TransactionType = "payment" | "receipt" | "nutzap";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    timestamp: number;
    status: TransactionStatus;
    description?: string;
    error?: string;
}

/**
 * Wallet types supported
 */
export type WalletType = "cashu" | "nwc" | "webln";

/**
 * Nutzap monitor state
 */
export interface NutzapMonitorState {
    pending: NDKNutzap[];
    redeemed: NDKNutzap[];
    failed: NDKNutzap[];
}

/**
 * Proof entry with state information
 */
export interface ProofEntry {
    proof: Proof;
    mint: string;
    tokenId?: string;
    state: "available" | "reserved" | "deleted";
    timestamp: number;
}

/**
 * Validation result for proof states
 */
export interface ValidationResult {
    mint: string;
    proofStates: Map<string, CashuProofState>;
    timestamp: number;
}

/**
 * Global wallet store for managing wallet state
 */
class WalletStore {
    #ndk?: NDK;
    #currentWallet = $state<NDKWallet | undefined>(undefined);
    #nutzapMonitorInstance = $state<NDKNutzapMonitor | undefined>(undefined);

    // Reactive state
    balance = $state<number>(0);
    balanceByMint = $state<Map<string, number>>(new Map());
    connected = $state<boolean>(false);
    type = $state<WalletType | undefined>(undefined);
    history = $state<Transaction[]>([]);

    // Nutzap monitoring state
    nutzaps = $state<NutzapMonitorState>({
        pending: [],
        redeemed: [],
        failed: [],
    });

    // Proof management state
    proofEntries = $state<ProofEntry[]>([]);
    validationResults = $state<Map<string, ValidationResult>>(new Map());
    isValidating = $state<boolean>(false);

    // Blacklist state (persisted to NIP-51 kind 10020)
    blacklistedMints = $state<Set<string>>(new Set());

    /**
     * Initialize the wallet store with NDK instance
     */
    init(ndk: NDK) {
        this.#ndk = ndk;
    }

    /**
     * Set the active wallet
     */
    set(wallet: NDKWallet) {
        this.#currentWallet = wallet;
        this.connected = true;
        this.updateWalletType(wallet);
        this.setupWalletListeners(wallet);
        this.updateBalance();
    }

    /**
     * Get the current wallet instance
     */
    get wallet(): NDKWallet | undefined {
        return this.#currentWallet;
    }

    /**
     * Update wallet type based on wallet instance
     */
    private updateWalletType(wallet: NDKWallet) {
        if ("type" in wallet) {
            const walletType = wallet.type as string;
            if (walletType === "nwc") {
                this.type = "nwc";
            } else if (walletType === "nip-60") {
                this.type = "cashu";
            } else if (walletType === "webln") {
                this.type = "webln";
            }
        }
    }

    /**
     * Set up wallet event listeners
     */
    private setupWalletListeners(wallet: NDKWallet) {
        wallet.on("balance_updated", (balance?: NDKWalletBalance) => {
            if (balance) {
                this.balance = balance.amount;
            }
        });

        wallet.on("ready", () => {
            this.updateBalance();
        });

        wallet.on("insufficient_balance", ({ amount }) => {
            this.addTransaction({
                id: `fail-${Date.now()}`,
                type: "payment",
                amount,
                timestamp: Date.now(),
                status: "failed",
                error: "Insufficient balance",
            });
        });
    }

    /**
     * Update balance from wallet
     */
    private async updateBalance() {
        if (!this.#currentWallet) return;

        try {
            if (this.#currentWallet.updateBalance) {
                await this.#currentWallet.updateBalance();
            }

            // Check again in case wallet was cleared during async operation
            if (!this.#currentWallet) return;

            const balance = this.#currentWallet.balance;
            if (balance) {
                this.balance = balance.amount;
            }

            // Update balance by mint for Cashu wallets
            if (this.type === "cashu") {
                this.updateCashuBalanceByMint(this.#currentWallet as unknown as NDKCashuWallet);
            }
        } catch (error) {
            // Silently handle errors during balance updates
            console.error("Failed to update wallet balance:", error);
        }
    }

    /**
     * Update balance by mint for Cashu wallets
     */
    private updateCashuBalanceByMint(wallet: NDKCashuWallet) {
        if (!wallet.wallets) return;

        const balanceMap = new Map<string, number>();

        for (const [mint] of wallet.wallets.entries()) {
            // For now, we'll update this when we have proper balance tracking per mint
            // The total balance is already tracked in the balance property
            balanceMap.set(mint, 0);
        }

        this.balanceByMint = balanceMap;
    }

    /**
     * Send a payment
     */
    async pay(params: { amount: number; recipient?: string; comment?: string; unit?: string }): Promise<Transaction> {
        if (!this.#currentWallet) {
            throw new Error("No wallet connected");
        }

        const transaction: Transaction = {
            id: `pay-${Date.now()}`,
            type: "payment",
            amount: params.amount,
            timestamp: Date.now(),
            status: "pending",
            description: params.comment,
        };

        this.addTransaction(transaction);

        try {
            // Payment logic depends on wallet type
            if (this.#currentWallet.lnPay) {
                await this.#currentWallet.lnPay({
                    amount: params.amount,
                    comment: params.comment,
                    unit: params.unit || "msat",
                } as any);
            } else if (this.#currentWallet.cashuPay) {
                await this.#currentWallet.cashuPay({
                    amount: params.amount,
                    comment: params.comment,
                    unit: params.unit || "sat",
                } as any);
            }

            transaction.status = "completed";
            this.updateTransaction(transaction);
            await this.updateBalance();

            return transaction;
        } catch (error) {
            transaction.status = "failed";
            transaction.error = error instanceof Error ? error.message : String(error);
            this.updateTransaction(transaction);
            throw error;
        }
    }

    /**
     * Create a Lightning invoice for deposit (Cashu wallet only)
     * Returns an NDKCashuDeposit instance that handles the deposit flow
     */
    deposit(amount: number, mint?: string): NDKCashuDeposit | undefined {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            return undefined;
        }

        const targetMint = mint || this.#currentWallet.mints[0];
        if (!targetMint) {
            throw new Error("No mint configured");
        }

        return this.#currentWallet.deposit(amount, targetMint);
    }

    /**
     * Receive a Cashu token (redeem it into the wallet)
     */
    async receiveToken(token: string, description?: string): Promise<void> {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            throw new Error("Cashu wallet required");
        }

        await this.#currentWallet.receiveToken(token, description);
        await this.updateBalance();

        // Add transaction record
        this.addTransaction({
            id: `receive-${Date.now()}`,
            type: "receipt",
            amount: 0, // Amount will be known after redemption
            timestamp: Date.now(),
            status: "completed",
            description: description || "Cashu token received",
        });
    }

    /**
     * Initialize wallet - auto-discovers existing wallet or creates new one
     */
    async initialize(
        ndk: NDK,
        user: NDKUser,
        config?: {
            mints?: string[];
            nutzapMonitorEnabled?: boolean;
        },
    ): Promise<void> {
        this.#ndk = ndk;

        // Try to find existing wallet
        const existingEvent = await ndk.fetchEvent({
            kinds: [NDKKind.CashuWallet],
            authors: [user.pubkey],
        });

        let wallet: NDKCashuWallet;

        if (existingEvent) {
            // Load from event
            wallet = (await NDKCashuWallet.from(existingEvent)) as NDKCashuWallet;
        } else {
            // Create new wallet
            wallet = new NDKCashuWallet(ndk);
            if (config?.mints) {
                wallet.mints = config.mints;
            }
        }

        // Wire up mint caching callbacks if cache adapter supports it
        if (ndk.cacheAdapter) {
            console.debug("🔧 [Wallet] Setting up mint caching callbacks");

            wallet.onMintInfoNeeded = async (mint: string) => {
                console.debug(`🔍 [Wallet] Fetching cached mint info for ${mint}`);
                const info = await ndk.cacheAdapter!.loadCashuMintInfo?.(mint);
                if (info) {
                    console.debug(`✅ [Wallet] Using cached mint info for ${mint}`);
                } else {
                    console.debug(`❌ [Wallet] No cached mint info for ${mint}, will fetch from network`);
                }
                return info as any;
            };

            wallet.onMintInfoLoaded = async (mint: string, info: any) => {
                console.debug(`💾 [Wallet] Caching mint info for ${mint}`, info);
                await ndk.cacheAdapter!.saveCashuMintInfo?.(mint, info);
            };

            wallet.onMintKeysNeeded = async (mint: string) => {
                console.debug(`🔍 [Wallet] Fetching cached mint keys for ${mint}`);
                const keys = await ndk.cacheAdapter!.loadCashuMintKeys?.(mint);
                if (keys) {
                    console.debug(`✅ [Wallet] Using cached ${keys.length} keyset(s) for ${mint}`);
                } else {
                    console.debug(`❌ [Wallet] No cached mint keys for ${mint}, will fetch from network`);
                }
                return keys as any;
            };

            wallet.onMintKeysLoaded = async (mint: string, keysets: Map<string, any>) => {
                const keysArray = Array.from(keysets.values());
                console.debug(`💾 [Wallet] Caching ${keysArray.length} keyset(s) for ${mint}`);
                await ndk.cacheAdapter!.saveCashuMintKeys?.(mint, keysArray);
            };
        } else {
            console.debug("⚠️ [Wallet] No cache adapter available, mint caching disabled");
        }

        // Start wallet (loads state from Nostr)
        // The wallet will use ndk.activeUser for signing
        // Use PARALLEL cache to check cache and relays simultaneously for best UX
        await wallet.start({
            pubkey: user.pubkey,
            cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
        });

        // Set wallet in store
        this.set(wallet);

        // Load blacklisted mints
        await this.loadBlacklistedMints();

        // Start nutzap monitor if requested
        if (config?.nutzapMonitorEnabled) {
            const { NDKNutzapMonitor } = await import("@nostr-dev-kit/ndk-wallet");
            const monitor = new NDKNutzapMonitor(ndk, user, {});
            monitor.wallet = wallet;
            await this.startNutzapMonitor(monitor);
        }
    }

    /**
     * Add a mint to the Cashu wallet
     */
    addMint(mint: string): void {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            throw new Error("Cashu wallet required");
        }

        if (!this.#currentWallet.mints.includes(mint)) {
            this.#currentWallet.mints.push(mint);
        }
    }

    /**
     * Remove a mint from the Cashu wallet
     */
    removeMint(mint: string): void {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            throw new Error("Cashu wallet required");
        }

        this.#currentWallet.mints = this.#currentWallet.mints.filter((m) => m !== mint);
    }

    /**
     * Get list of configured mints (Cashu wallet only)
     */
    get mints(): string[] {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            return [];
        }

        return this.#currentWallet.mints;
    }

    /**
     * Get balance per mint (Cashu wallet only)
     */
    getMintBalances(): Map<string, number> {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            return new Map();
        }

        // Use the mintBalances from NDKCashuWallet
        const balances = new Map<string, number>();
        const mintBalances = this.#currentWallet.mintBalances || {};

        for (const [mint, balance] of Object.entries(mintBalances)) {
            balances.set(mint, balance);
        }

        return balances;
    }

    /**
     * Start nutzap monitoring
     */
    async startNutzapMonitor(monitor: NDKNutzapMonitor) {
        this.#nutzapMonitorInstance = monitor;

        // Set up monitor listeners
        monitor.on("seen", (nutzap: NDKNutzap) => {
            if (!this.nutzaps.pending.find((n) => n.id === nutzap.id)) {
                this.nutzaps.pending = [...this.nutzaps.pending, nutzap];
            }
        });

        monitor.on("redeemed", (nutzaps: NDKNutzap[], amount: number) => {
            // Remove from pending
            this.nutzaps.pending = this.nutzaps.pending.filter(
                (n) => !nutzaps.find((redeemed) => redeemed.id === n.id),
            );

            // Add to redeemed
            this.nutzaps.redeemed = [...this.nutzaps.redeemed, ...nutzaps];

            // Add transaction
            this.addTransaction({
                id: `nutzap-${Date.now()}`,
                type: "nutzap",
                amount,
                timestamp: Date.now(),
                status: "completed",
                description: `Redeemed ${nutzaps.length} nutzap${nutzaps.length > 1 ? "s" : ""}`,
            });

            // Update balance
            this.updateBalance();
        });

        monitor.on("failed", (nutzap: NDKNutzap, error: string) => {
            // Remove from pending
            this.nutzaps.pending = this.nutzaps.pending.filter((n) => n.id !== nutzap.id);

            // Add to failed
            this.nutzaps.failed = [...this.nutzaps.failed, nutzap];

            // Add failed transaction
            this.addTransaction({
                id: `nutzap-fail-${Date.now()}`,
                type: "nutzap",
                amount: 0,
                timestamp: Date.now(),
                status: "failed",
                error,
            });
        });

        // Start the monitor
        await monitor.start({});
    }

    /**
     * Stop nutzap monitoring
     */
    stopNutzapMonitor() {
        if (this.#nutzapMonitorInstance) {
            this.#nutzapMonitorInstance.stop();
            this.#nutzapMonitorInstance = undefined;
        }
    }

    /**
     * Add a transaction to history
     */
    private addTransaction(transaction: Transaction) {
        this.history = [transaction, ...this.history].slice(0, 100); // Keep last 100
    }

    /**
     * Update an existing transaction
     */
    private updateTransaction(transaction: Transaction) {
        const index = this.history.findIndex((t) => t.id === transaction.id);
        if (index !== -1) {
            this.history[index] = transaction;
            this.history = [...this.history]; // Trigger reactivity
        }
    }

    /**
     * Get all proof entries from the wallet state
     */
    async loadProofEntries(): Promise<void> {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            this.proofEntries = [];
            return;
        }

        const entries: ProofEntry[] = [];
        const proofEntries = this.#currentWallet.state.getProofEntries({
            onlyAvailable: false,
            includeDeleted: false
        });

        for (const entry of proofEntries) {
            entries.push({
                proof: entry.proof,
                mint: entry.mint,
                tokenId: entry.tokenId,
                state: entry.state,
                timestamp: entry.timestamp,
            });
        }

        this.proofEntries = entries;
    }

    /**
     * Validate proofs against their mints
     */
    async validateProofs(mint?: string): Promise<void> {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            throw new Error("Cashu wallet required");
        }

        this.isValidating = true;

        try {
            const mintsToValidate = mint ? [mint] : this.mints;

            for (const mintUrl of mintsToValidate) {
                const cashuWallet = await this.#currentWallet.getCashuWallet(mintUrl);
                const proofs = this.#currentWallet.state.getProofs({ mint: mintUrl });

                if (proofs.length === 0) continue;

                const proofStates = await cashuWallet.checkProofsStates(proofs);
                const stateMap = new Map<string, CashuProofState>();

                proofs.forEach((proof, index) => {
                    stateMap.set(proof.C, proofStates[index]);
                });

                this.validationResults.set(mintUrl, {
                    mint: mintUrl,
                    proofStates: stateMap,
                    timestamp: Date.now(),
                });
            }
        } finally {
            this.isValidating = false;
        }
    }

    /**
     * Delete selected proofs
     */
    async deleteProofs(proofs: Proof[]): Promise<void> {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            throw new Error("Cashu wallet required");
        }

        // Group proofs by mint
        const proofsByMint = new Map<string, Proof[]>();
        for (const proof of proofs) {
            const entry = this.proofEntries.find(e => e.proof.C === proof.C);
            if (!entry) continue;

            const mintProofs = proofsByMint.get(entry.mint) || [];
            mintProofs.push(proof);
            proofsByMint.set(entry.mint, mintProofs);
        }

        // Delete proofs for each mint
        for (const [mint, mintProofs] of proofsByMint.entries()) {
            await this.#currentWallet.state.update({
                store: [],
                destroy: mintProofs,
                mint,
            });
        }

        // Reload proof entries
        await this.loadProofEntries();
        await this.updateBalance();
    }

    /**
     * Load blacklisted mints from NIP-51 kind 10020
     */
    async loadBlacklistedMints(): Promise<void> {
        if (!this.#ndk) return;

        const user = this.#ndk.activeUser || (await this.#ndk.signer?.user());
        if (!user) return;

        const event = await this.#ndk.fetchEvent({
            kinds: [10020],
            authors: [user.pubkey],
        });

        if (event) {
            const mints = new Set<string>();
            for (const tag of event.tags) {
                if (tag[0] === "u") {
                    mints.add(tag[1]);
                }
            }
            this.blacklistedMints = mints;
        }
    }

    /**
     * Add a mint to the blacklist (NIP-51 kind 10020)
     */
    async blacklistMint(mintUrl: string): Promise<void> {
        if (!this.#ndk) throw new Error("NDK not initialized");

        const user = this.#ndk.activeUser || (await this.#ndk.signer?.user());
        if (!user) throw new Error("No active user");

        // Add to local state
        this.blacklistedMints = new Set([...this.blacklistedMints, mintUrl]);

        // Create/update NIP-51 event
        const event = new (await import("@nostr-dev-kit/ndk")).NDKEvent(this.#ndk, {
            kind: 10020,
            tags: Array.from(this.blacklistedMints).map(mint => ["u", mint]),
            content: "",
        });

        await event.publish();
    }

    /**
     * Remove a mint from the blacklist
     */
    async unblacklistMint(mintUrl: string): Promise<void> {
        if (!this.#ndk) throw new Error("NDK not initialized");

        const user = this.#ndk.activeUser || (await this.#ndk.signer?.user());
        if (!user) throw new Error("No active user");

        // Remove from local state
        const newBlacklist = new Set(this.blacklistedMints);
        newBlacklist.delete(mintUrl);
        this.blacklistedMints = newBlacklist;

        // Create/update NIP-51 event
        const event = new (await import("@nostr-dev-kit/ndk")).NDKEvent(this.#ndk, {
            kind: 10020,
            tags: Array.from(this.blacklistedMints).map(mint => ["u", mint]),
            content: "",
        });

        await event.publish();
    }

    /**
     * Get P2PK pubkey for receiving nutzaps
     */
    async getP2PKPubkey(): Promise<string> {
        if (!(this.#currentWallet instanceof NDKCashuWallet)) {
            throw new Error("Cashu wallet required");
        }

        return await this.#currentWallet.getP2pk();
    }

    /**
     * Clear all state
     */
    clear() {
        this.#currentWallet = undefined;
        this.balance = 0;
        this.balanceByMint = new Map();
        this.connected = false;
        this.type = undefined;
        this.history = [];
        this.nutzaps = {
            pending: [],
            redeemed: [],
            failed: [],
        };
        this.proofEntries = [];
        this.validationResults = new Map();
        this.isValidating = false;
        this.blacklistedMints = new Set();
        this.stopNutzapMonitor();
    }

    /**
     * Disconnect the current wallet
     */
    disconnect() {
        this.clear();
    }
}

// Export singleton instance
export const wallet = new WalletStore();
