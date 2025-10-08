import type NDK from "@nostr-dev-kit/ndk";
import { NDKKind as Kind, type Hexpubkey, type NDKEvent, type NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSessionManager } from "@nostr-dev-kit/sessions";
import { NDKCashuWallet, type NDKWallet, type NDKWalletBalance, NDKWalletStatus } from "@nostr-dev-kit/wallet";

/**
 * Reactive wrapper around wallet
 *
 * Subscribes to NDKSessionManager and reacts to wallet events (kind 17375)
 * in the active session, managing wallet lifecycle independently.
 */
export class ReactiveWalletStore {
    balance = $state<number>(0);
    wallet = $state<NDKWallet | undefined>(undefined);
    status = $state<NDKWalletStatus>(NDKWalletStatus.INITIAL);
    #ndk: NDK;
    #currentWalletEventId?: string;

    constructor(ndk: NDK, sessionManager: NDKSessionManager) {
        this.#ndk = ndk;

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
                if (this.wallet) {
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
        const startTime = Date.now();

        if (this.#currentWalletEventId) {
            console.log(`[${new Date().toISOString()}] [ReactiveWalletStore.#syncWallet] Wallet event changed from ${this.#currentWalletEventId} to ${walletEvent.id}, created_at: ${walletEvent.created_at}`);
        }

        try {
            console.log(`[${new Date().toISOString()}] [ReactiveWalletStore.#syncWallet] Instantiating wallet from event`, { eventId: walletEvent.id, created_at: walletEvent.created_at });

            // Instantiate wallet from event
            const wallet = await NDKCashuWallet.from(walletEvent);

            if (wallet) {
                // Set up mint caching callbacks
                this.#setupMintCaching(wallet);

                // Set wallet on store BEFORE starting so UI can show immediately
                this.set(wallet);
                this.#currentWalletEventId = walletEvent.id;

                console.log(`[${new Date().toISOString()}] [ReactiveWalletStore.#syncWallet] Starting wallet monitoring`);
                const walletStartTime = Date.now();

                // Start wallet monitoring (will load from cache first, then sync)
                await wallet.start({ pubkey });
                console.log(`[${new Date().toISOString()}] [ReactiveWalletStore.#syncWallet] Wallet started in ${Date.now() - walletStartTime}ms`);

                console.log(`[${new Date().toISOString()}] [ReactiveWalletStore.#syncWallet] Wallet sync completed (total time: ${Date.now() - startTime}ms)`);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] [ReactiveWalletStore.#syncWallet] Failed to load wallet from event:`, error);
        }
    }

    /**
     * Set up mint info and keys caching callbacks
     */
    #setupMintCaching(wallet: NDKWallet): void {
        const cache = this.#ndk.cacheAdapter;
        if (!cache) return;

        // Load mint info from cache
        wallet.onMintInfoNeeded = async (mint: string) => {
            if (cache.loadCashuMintInfo) {
                return await cache.loadCashuMintInfo(mint);
            }
            return undefined;
        };

        // Save mint info to cache
        wallet.onMintInfoLoaded = (mint: string, info: any) => {
            if (cache.saveCashuMintInfo) {
                cache.saveCashuMintInfo(mint, info);
            }
        };

        // Load mint keys from cache
        wallet.onMintKeysNeeded = async (mint: string) => {
            if (cache.loadCashuMintKeys) {
                return await cache.loadCashuMintKeys(mint);
            }
            return undefined;
        };

        // Save mint keys to cache
        wallet.onMintKeysLoaded = (mint: string, keys: Map<string, any>) => {
            if (cache.saveCashuMintKeys) {
                const keysArray = Array.from(keys.values());
                cache.saveCashuMintKeys(mint, keysArray);
            }
        };
    }

    /**
     * Set the active wallet and subscribe to balance updates
     */
    set(wallet: NDKWallet): void {
        console.log("[ReactiveWalletStore] Setting wallet", {
            walletType: wallet.type,
            hasCashuPay: !!wallet.cashuPay,
            hasLnPay: !!wallet.lnPay,
        });

        // Unsubscribe from previous wallet if any
        if (this.wallet) {
            this.wallet.off("balance_updated", this.#handleBalanceUpdate);
            this.wallet.off("status_changed", this.#handleStatusChange);
        }

        this.wallet = wallet;
        this.status = wallet.status;

        // Register wallet with NDK so its payment methods are available to NDKZapper
        console.log("[ReactiveWalletStore] Registering wallet with NDK", {
            hasNdk: !!this.#ndk,
            walletHasLnPay: !!wallet.lnPay,
            walletHasCashuPay: !!wallet.cashuPay,
        });
        this.#ndk.wallet = wallet;
        console.log("[ReactiveWalletStore] After setting ndk.wallet", {
            ndkHasWalletConfig: !!this.#ndk.walletConfig,
            walletConfigHasLnPay: !!this.#ndk.walletConfig?.lnPay,
            walletConfigHasCashuPay: !!this.#ndk.walletConfig?.cashuPay,
        });

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
        console.log(
            `[${new Date().toISOString()}] [ReactiveWalletStore] Wallet status changed to: ${status}`,
        );
        this.status = status;
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
            this.wallet.off("status_changed", this.#handleStatusChange);
        }
        this.wallet = undefined;
        this.balance = 0;
        this.status = NDKWalletStatus.INITIAL;
        this.#currentWalletEventId = undefined;

        // Clear wallet from NDK
        this.#ndk.wallet = undefined;
    }
}

export function createReactiveWallet(ndk: NDK, sessionManager: NDKSessionManager): ReactiveWalletStore {
    return new ReactiveWalletStore(ndk, sessionManager);
}
