import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import { AuthManager } from "./auth-manager";
import { PersistenceManager } from "./persistence-manager";
import type { SessionStorage } from "./storage/types";
import type { SessionStore } from "./store";
import { createSessionStore } from "./store";
import type { LoginOptions, NDKSession, SessionStartOptions } from "./types";
import { debounce } from "./utils";

export interface SessionManagerOptions {
    /**
     * Storage backend for persisting sessions
     */
    storage?: SessionStorage;

    /**
     * Automatically save sessions on state changes (default: true)
     */
    autoSave?: boolean;

    /**
     * Debounce time for auto-save in milliseconds (default: 500)
     */
    saveDebounceMs?: number;

    /**
     * What to fetch for all sessions (on login and restore)
     */
    fetches?: SessionStartOptions;
}

/**
 * NDK Session Manager
 *
 * Manages user sessions with multi-account support and optional persistence.
 * Refactored to follow Single Responsibility Principle with separate managers
 * for authentication and persistence.
 *
 * @example
 * ```typescript
 * const ndk = new NDK({ explicitRelayUrls: ['wss://relay.damus.io'] });
 * await ndk.connect();
 *
 * const sessions = new NDKSessionManager(ndk, {
 *     fetches: { follows: true }
 * });
 * await sessions.login(signer);
 *
 * console.log('Active user:', sessions.activeUser);
 * ```
 */
export class NDKSessionManager {
    private store: ReturnType<typeof createSessionStore>;
    private options: SessionManagerOptions;
    private authManager: AuthManager;
    private persistenceManager: PersistenceManager;
    private unsubscribe?: () => void;

    constructor(ndk: NDK, options: SessionManagerOptions = {}) {
        this.store = createSessionStore();
        this.options = {
            autoSave: options.autoSave ?? true,
            saveDebounceMs: options.saveDebounceMs ?? 500,
            ...options,
        };

        // Initialize store with NDK
        this.store.getState().init(ndk);

        // Initialize managers
        this.authManager = new AuthManager(this.store.getState(), () => this.store.getState());
        this.persistenceManager = new PersistenceManager(this.options.storage, () => this.store.getState());

        // Setup auto-save if enabled
        if (this.options.autoSave && this.options.storage) {
            this.setupAutoSave();
        }
    }

    /**
     * Get the current store state
     */
    getCurrentState() {
        return this.store.getState();
    }

    /**
     * Get all sessions
     */
    getSessions(): Map<Hexpubkey, NDKSession> {
        return this.getCurrentState().sessions;
    }

    /**
     * Get a specific session
     */
    getSession(pubkey: Hexpubkey): NDKSession | undefined {
        return this.getCurrentState().sessions.get(pubkey);
    }

    /**
     * Get the active session
     */
    get activeSession(): NDKSession | undefined {
        const { activePubkey, sessions } = this.getCurrentState();
        return activePubkey ? sessions.get(activePubkey) : undefined;
    }

    /**
     * Get the active user
     */
    get activeUser(): NDKUser | undefined {
        const session = this.activeSession;
        const state = this.getCurrentState();
        if (!session || !state.ndk) return undefined;

        return state.ndk.getUser({ pubkey: session.pubkey });
    }

    /**
     * Get the active pubkey
     */
    get activePubkey(): Hexpubkey | undefined {
        return this.getCurrentState().activePubkey;
    }

    /**
     * Check if a session is read-only (no signer available)
     */
    isReadOnly(pubkey?: Hexpubkey): boolean {
        const targetPubkey = pubkey ?? this.getCurrentState().activePubkey;
        if (!targetPubkey) return true;
        return !this.getCurrentState().signers.has(targetPubkey);
    }

    /**
     * Login with a signer or user
     *
     * @example
     * ```typescript
     * const signer = new NDKPrivateKeySigner(nsec);
     * await sessions.login(signer);
     * ```
     */
    async login(userOrSigner: NDKUser | NDKSigner, options: { setActive?: boolean } = {}): Promise<Hexpubkey> {
        const loginOptions: LoginOptions = {
            ...this.options.fetches,
            setActive: options.setActive,
        };
        return this.authManager.login(userOrSigner, loginOptions);
    }

    /**
     * Logout (remove) a session
     *
     * @param pubkey - Session to logout. If not provided, logs out active session.
     */
    logout(pubkey?: Hexpubkey): void {
        this.authManager.logout(pubkey);
    }

    /**
     * Switch to a different session
     */
    switchTo(pubkey: Hexpubkey | null): void {
        this.authManager.switchTo(pubkey);
    }

    /**
     * Start fetching data for a session
     */
    startSession(pubkey: Hexpubkey, options: SessionStartOptions): void {
        this.getCurrentState().startSession(pubkey, options);
    }

    /**
     * Stop fetching data for a session
     */
    stopSession(pubkey: Hexpubkey): void {
        this.getCurrentState().stopSession(pubkey);
    }

    /**
     * Enable wallet fetching for a session
     *
     * @param pubkey - Session to enable wallet for. If not provided, uses active session.
     *
     * @example
     * ```typescript
     * // User wants to use wallet features
     * sessions.enableWallet(userPubkey);
     * ```
     */
    enableWallet(pubkey?: Hexpubkey): void {
        const targetPubkey = pubkey ?? this.getCurrentState().activePubkey;
        if (!targetPubkey) return;

        const state = this.getCurrentState();
        const session = state.sessions.get(targetPubkey);
        if (!session) return;

        // Update preference
        state.updatePreferences(targetPubkey, { walletEnabled: true });

        // If wallet is not already being fetched, restart the session with wallet enabled
        const currentSubscription = session.subscription;
        if (currentSubscription) {
            // Stop current subscription and restart with wallet
            state.stopSession(targetPubkey);
            state.startSession(targetPubkey, { ...this.options.fetches, wallet: true });
        } else {
            // No active subscription, just update preference
            // Will be used when session starts
        }
    }

    /**
     * Disable wallet fetching for a session
     *
     * @param pubkey - Session to disable wallet for. If not provided, uses active session.
     *
     * @example
     * ```typescript
     * // User wants to disable wallet features
     * sessions.disableWallet(userPubkey);
     * ```
     */
    disableWallet(pubkey?: Hexpubkey): void {
        const targetPubkey = pubkey ?? this.getCurrentState().activePubkey;
        if (!targetPubkey) return;

        const state = this.getCurrentState();
        const session = state.sessions.get(targetPubkey);
        if (!session) return;

        // Update preference
        state.updatePreferences(targetPubkey, { walletEnabled: false });

        // If session is running, restart without wallet
        const currentSubscription = session.subscription;
        if (currentSubscription) {
            state.stopSession(targetPubkey);
            state.startSession(targetPubkey, { ...this.options.fetches, wallet: false });
        }
    }

    /**
     * Check if wallet fetching is enabled for a session
     *
     * @param pubkey - Session to check. If not provided, uses active session.
     * @returns true if wallet fetching is enabled
     *
     * @example
     * ```typescript
     * if (!sessions.isWalletEnabled()) {
     *   // Show UI prompt to enable wallet
     * }
     * ```
     */
    isWalletEnabled(pubkey?: Hexpubkey): boolean {
        const targetPubkey = pubkey ?? this.getCurrentState().activePubkey;
        if (!targetPubkey) return false;

        const session = this.getCurrentState().sessions.get(targetPubkey);
        return session?.preferences?.walletEnabled ?? false;
    }

    /**
     * Subscribe to state changes
     *
     * @example
     * ```typescript
     * const unsubscribe = sessions.subscribe((state) => {
     *   console.log('Active pubkey:', state.activePubkey);
     * });
     * ```
     */
    subscribe(callback: (state: SessionStore) => void): () => void {
        return this.store.subscribe(callback);
    }

    /**
     * Restore sessions from storage
     */
    async restore(): Promise<void> {
        await this.persistenceManager.restore();

        // Start fetching data for all restored sessions
        if (this.options.fetches) {
            const state = this.getCurrentState();
            for (const pubkey of state.sessions.keys()) {
                const session = state.sessions.get(pubkey);
                if (!session) continue;

                // Respect saved wallet preference, or fall back to default
                const walletEnabled = session.preferences?.walletEnabled ?? this.options.fetches.wallet ?? false;

                const fetches = {
                    ...this.options.fetches,
                    wallet: walletEnabled,
                };

                state.startSession(pubkey, fetches);
            }
        }
    }

    /**
     * Persist sessions to storage
     */
    async persist(): Promise<void> {
        return this.persistenceManager.persist();
    }

    /**
     * Clear all sessions from storage
     */
    async clear(): Promise<void> {
        return this.persistenceManager.clear();
    }

    /**
     * Cleanup and stop all subscriptions
     */
    destroy(): void {
        const state = this.getCurrentState();

        // Stop all session subscriptions
        for (const pubkey of state.sessions.keys()) {
            state.stopSession(pubkey);
        }

        // Unsubscribe from state changes
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    private setupAutoSave(): void {
        const debouncedPersist = debounce(() => {
            this.persistenceManager.persist().catch((error) => {
                console.error("Failed to auto-save sessions:", error);
            });
        }, this.options.saveDebounceMs!);

        this.unsubscribe = this.store.subscribe(() => {
            debouncedPersist();
        });
    }
}
