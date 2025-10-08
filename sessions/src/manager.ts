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
 * const sessions = new NDKSessionManager(ndk);
 * await sessions.login(signer, { profile: true, follows: true });
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
     * await sessions.login(signer, { setActive: true });
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
                state.startSession(pubkey, this.options.fetches);
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
