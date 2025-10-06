import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKEvent, NDKKind, NDKSigner, NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { LoginOptions, NDKSession, SessionStartOptions } from "@nostr-dev-kit/sessions";
import { LocalStorage, NDKSessionManager } from "@nostr-dev-kit/sessions";

/**
 * Reactive wrapper around NDKSessionManager
 *
 * Provides Svelte 5 reactive access to session state using $state runes.
 * Wraps the framework-agnostic ndk-sessions package.
 */
export class ReactiveSessionsStore {
    #manager: NDKSessionManager;
    #ndk: NDK;

    // Reactive state synced from Zustand store
    sessions = $state<Map<Hexpubkey, NDKSession>>(new Map());
    activePubkey = $state<Hexpubkey | undefined>(undefined);

    constructor(ndk: NDK) {
        this.#ndk = ndk;
        this.#manager = new NDKSessionManager(ndk, {
            storage: new LocalStorage(),
            autoSave: true,
        });

        // Sync Zustand state to Svelte reactive state
        this.#manager.subscribe((state) => {
            this.sessions = new Map(state.sessions);
            this.activePubkey = state.activePubkey;

            // Sync signer to NDK
            if (state.activePubkey) {
                const signer = state.signers.get(state.activePubkey);
                if (signer) {
                    ndk.signer = signer;
                }
            }
        });

        // Restore sessions on init
        this.#manager.restore().catch((error) => {
            console.error("[ndk-svelte5] Failed to restore sessions:", error);
        });
    }

    /**
     * Get current active session
     */
    get current(): NDKSession | undefined {
        if (!this.activePubkey) return undefined;
        return this.sessions.get(this.activePubkey);
    }

    /**
     * Get current active user
     */
    get currentUser(): NDKUser | undefined {
        return this.#manager.activeUser;
    }

    /**
     * Get current user profile
     */
    get profile(): NDKUserProfile | undefined {
        return this.current?.profile;
    }

    /**
     * Get follows set for current session
     */
    get follows(): Set<Hexpubkey> {
        return this.current?.followSet ?? new Set();
    }

    /**
     * Get muted IDs for current session
     */
    get mutes(): Map<string, string> {
        return this.current?.muteSet ?? new Map();
    }

    /**
     * Get muted words for current session
     */
    get mutedWords(): Set<string> {
        return this.current?.mutedWords ?? new Set();
    }

    /**
     * Get blocked relays for current session
     */
    get blockedRelays(): Set<string> {
        return this.current?.blockedRelays ?? new Set();
    }

    /**
     * Get user's relay list for current session
     */
    get relayList(): Map<string, { read: boolean; write: boolean }> {
        return this.current?.relayList ?? new Map();
    }

    /**
     * Get session event by kind for current session
     */
    getSessionEvent(kind: NDKKind): NDKEvent | null | undefined {
        return this.current?.events.get(kind);
    }

    /**
     * Get all sessions as array
     */
    get all(): NDKSession[] {
        return Array.from(this.sessions.values());
    }

    /**
     * Login with a signer or user
     * - With signer: Full access to sign and publish events
     * - With user: Read-only access to view profile, follows, etc.
     *
     * @example
     * ```ts
     * // Full access with signer
     * await ndk.sessions.login(signer, {
     *   profile: true,
     *   follows: true,
     *   setActive: true
     * });
     *
     * // Read-only with user
     * const user = ndk.getUser({ pubkey: "hex..." });
     * await ndk.sessions.login(user, {
     *   profile: true,
     *   follows: true
     * });
     * ```
     */
    async login(userOrSigner: NDKUser | NDKSigner, options?: LoginOptions): Promise<Hexpubkey> {
        return await this.#manager.login(userOrSigner, options);
    }

    /**
     * Add a session without setting it as active
     * - With signer: Full access session
     * - With user: Read-only session
     */
    async add(userOrSigner: NDKUser | NDKSigner, options?: SessionStartOptions): Promise<Hexpubkey> {
        return await this.#manager.login(userOrSigner, { ...options, setActive: false });
    }

    /**
     * Logout (remove) a session
     */
    logout(pubkey?: Hexpubkey): void {
        const targetPubkey = pubkey ?? this.activePubkey;
        this.#manager.logout(targetPubkey);

        // If this was the last session, clear storage completely
        if (this.sessions.size === 0) {
            this.#manager.clear().catch((error) => {
                console.error("[ndk-svelte5] Failed to clear sessions from storage:", error);
            });
        }
    }

    /**
     * Logout all sessions
     */
    logoutAll(): void {
        // Clear all sessions from the manager
        const pubkeys = Array.from(this.sessions.keys());
        for (const pubkey of pubkeys) {
            this.#manager.logout(pubkey);
        }
        // Clear persisted sessions from storage
        this.#manager.clear().catch((error) => {
            console.error("[ndk-svelte5] Failed to clear sessions from storage:", error);
        });
    }

    /**
     * Switch to a different session
     */
    switch(pubkey: Hexpubkey | null): void {
        this.#manager.switchTo(pubkey);
    }

    /**
     * Get a specific session
     */
    get(pubkey: Hexpubkey): NDKSession | undefined {
        return this.sessions.get(pubkey);
    }

    /**
     * Start fetching data for a session
     */
    start(pubkey: Hexpubkey, options: SessionStartOptions): void {
        this.#manager.startSession(pubkey, options);
    }

    /**
     * Stop fetching data for a session
     */
    stop(pubkey: Hexpubkey): void {
        this.#manager.stopSession(pubkey);
    }

    /**
     * Check if a session is read-only (no signer available)
     * @param pubkey - Optional pubkey to check. If not provided, checks active session
     * @returns true if the session has no signer (read-only), false if it has a signer
     */
    isReadOnly(pubkey?: Hexpubkey): boolean {
        return this.#manager.isReadOnly(pubkey);
    }
}

/**
 * Create reactive sessions store
 */
export function createReactiveSessions(ndk: NDK): ReactiveSessionsStore {
    return new ReactiveSessionsStore(ndk);
}

export type { ReactiveSessionsStore };
