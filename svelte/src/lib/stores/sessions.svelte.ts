import type { Hexpubkey, NDKEvent, NDKKind, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKKind as Kind } from "@nostr-dev-kit/ndk";
import type { NDKSession, NDKSessionManager, SessionStartOptions } from "@nostr-dev-kit/sessions";

/**
 * Reactive wrapper around NDKSessionManager
 *
 * Provides Svelte 5 reactive access to session state using $state runes.
 * Wraps the framework-agnostic ndk-sessions package.
 *
 * This store is purely focused on session state - wallet logic is handled
 * by ReactiveWalletStore which subscribes to the same session manager.
 */
export class ReactiveSessionsStore {
    #manager: NDKSessionManager;

    // Reactive state synced from Zustand store
    // Using Record instead of Map to avoid Proxy issues with $state
    sessions = $state<Record<Hexpubkey, NDKSession>>({});
    activePubkey = $state<Hexpubkey | undefined>(undefined);

    constructor(sessionManager: NDKSessionManager) {
        this.#manager = sessionManager;

        // Sync Zustand state to Svelte reactive state
        this.#manager.subscribe((state) => {
            // Convert Map to Record
            const sessionsObj: Record<Hexpubkey, NDKSession> = {};
            state.sessions.forEach((session, pubkey) => {
                sessionsObj[pubkey] = session;
            });
            this.sessions = sessionsObj;
            this.activePubkey = state.activePubkey;

            // Sync signer to NDK
            if (state.activePubkey) {
                const signer = state.signers.get(state.activePubkey);
                if (signer && state.ndk) {
                    state.ndk.signer = signer;
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
        return this.sessions[this.activePubkey];
    }

    /**
     * Get current active user
     */
    get currentUser(): NDKUser | undefined {
        return this.#manager.activeUser;
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
     * Get wallet event (kind 17375) for current session
     */
    get walletEvent(): NDKEvent | null | undefined {
        return this.getSessionEvent(Kind.CashuWallet as NDKKind);
    }

    /**
     * Get all sessions as array
     */
    get all(): NDKSession[] {
        return Object.values(this.sessions);
    }

    /**
     * Login with a signer or user
     * - With signer: Full access to sign and publish events
     * - With user: Read-only access to view profile, follows, etc.
     *
     * @example
     * ```ts
     * // Full access with signer
     * await ndk.$sessions.login(signer, { setActive: true });
     *
     * // Read-only with user
     * const user = ndk.getUser({ pubkey: "hex..." });
     * await ndk.$sessions.login(user);
     * ```
     */
    async login(userOrSigner: NDKUser | NDKSigner, options?: { setActive?: boolean }): Promise<Hexpubkey> {
        return await this.#manager.login(userOrSigner, options);
    }

    /**
     * Add a session without setting it as active
     * - With signer: Full access session
     * - With user: Read-only session
     */
    async add(userOrSigner: NDKUser | NDKSigner): Promise<Hexpubkey> {
        return await this.#manager.login(userOrSigner, { setActive: false });
    }

    /**
     * Logout (remove) a session
     */
    logout(pubkey?: Hexpubkey): void {
        const targetPubkey = pubkey ?? this.activePubkey;
        if (!targetPubkey) return;

        this.#manager.logout(targetPubkey);

        // Update local state immediately
        delete this.sessions[targetPubkey];
        if (this.activePubkey === targetPubkey) {
            this.activePubkey = undefined;
        }

        // If this was the last session, clear storage completely
        if (Object.keys(this.sessions).length === 0) {
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
        const pubkeys = Object.keys(this.sessions);
        for (const pubkey of pubkeys) {
            this.#manager.logout(pubkey);
        }

        // Update local state immediately
        this.sessions = {};
        this.activePubkey = undefined;

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
        return this.sessions[pubkey];
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
export function createReactiveSessions(sessionManager: NDKSessionManager): ReactiveSessionsStore {
    return new ReactiveSessionsStore(sessionManager);
}
