import type { NDKConstructorParams, NDKEvent, NDKFilter, NDKUser } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";
import type { SessionManagerOptions } from "@nostr-dev-kit/sessions";
import { LocalStorage, NDKSessionManager } from "@nostr-dev-kit/sessions";
import * as ndkSvelteGuardrails from "./ai-guardrails/constructor.js";
import { createFetchProfile } from "./profile.svelte.js";
import type { ReactivePaymentsStore } from "./stores/payments.svelte.js";
import { createReactivePayments } from "./stores/payments.svelte.js";
import type { ReactivePoolStore } from "./stores/pool.svelte.js";
import { createReactivePool } from "./stores/pool.svelte.js";
import type { ReactiveSessionsStore } from "./stores/sessions.svelte.js";
import { createReactiveSessions } from "./stores/sessions.svelte.js";
import type { ReactiveWalletStore } from "./stores/wallet.svelte.js";
import { createReactiveWallet } from "./stores/wallet.svelte.js";
import type { ReactiveWoTStore } from "./stores/wot.svelte.js";
import { createReactiveWoT } from "./stores/wot.svelte.js";
import type { SubscribeConfig, Subscription } from "./subscribe.svelte.js";
import { createSubscription } from "./subscribe.svelte.js";
import { createFetchUser } from "./user.svelte.js";

export interface NDKSvelteParams extends NDKConstructorParams {
    /**
     * Enable session management and wallet functionality
     * - false (default): No sessions, no wallet, no auto-login
     * - true: Enable sessions with default settings (follows, mutes, wallet)
     * - SessionManagerOptions: Enable sessions with custom settings
     *
     * @example
     * ```ts
     * // No sessions (default)
     * const ndk = new NDKSvelte({ explicitRelayUrls: [...] });
     *
     * // Sessions with defaults
     * const ndk = new NDKSvelte({ session: true });
     *
     * // Sessions with custom settings
     * const ndk = new NDKSvelte({
     *   session: {
     *     follows: true,
     *     wallet: false
     *   }
     * });
     * ```
     */
    session?: boolean | SessionManagerOptions;
}

/**
 * NDK Svelte 5 - Reactive NDK instance
 *
 * Extends NDK with Svelte 5 reactive stores and features.
 * All reactive stores are prefixed with $ to indicate they contain reactive state.
 *
 * @example
 * ```ts
 * import { NDKSvelte } from '@nostr-dev-kit/svelte';
 *
 * const ndk = new NDKSvelte({
 *   explicitRelayUrls: ['wss://relay.damus.io']
 * });
 * ndk.connect();
 *
 * // Core NDK methods (no $)
 * ndk.pool.relays
 * ndk.fetchUser(...)
 * ndk.subscribe({ kinds: [1] }, opts, { onEvent: ... })  // Callback-based
 *
 * // Reactive Svelte layer (with $)
 * const session = ndk.$sessions.current;
 * const score = ndk.$wot.getScore(pubkey);
 * const balance = ndk.$wallet.balance;
 * const notes = ndk.$subscribe({ kinds: [1], limit: 50 });
 * ```
 */
export class NDKSvelte extends NDK {
    // Reactive stores with $ prefix (Svelte convention for reactive state)
    $sessions?: ReactiveSessionsStore;
    $wot?: ReactiveWoTStore;
    $wallet?: ReactiveWalletStore;
    $payments!: ReactivePaymentsStore;
    $pool!: ReactivePoolStore;

    // Private reactive state for active user
    #activeUser = $state<NDKUser | undefined>(undefined);

    constructor(params: NDKSvelteParams = {}) {
        super(params);

        // Register NDKSvelte guardrails
        this.aiGuardrails?.register("ndkSvelte", {
            constructing: ndkSvelteGuardrails.constructing,
        });

        // Announce construction to guardrails
        (this.aiGuardrails as any)?.ndkSvelte?.constructing(params);

        // Only create session manager if explicitly requested
        if (params.session) {
            const sessionOptions: SessionManagerOptions =
                params.session === true
                    ? {
                          storage: new LocalStorage(),
                          autoSave: true,
                          fetches: {
                              follows: true,
                              mutes: true,
                              wallet: true,
                          },
                      }
                    : {
                          storage: new LocalStorage(),
                          autoSave: true,
                          ...params.session,
                      };

            const sessionManager = new NDKSessionManager(this, sessionOptions);

            // Initialize session-dependent stores
            this.$wallet = createReactiveWallet(this, sessionManager);
            this.$sessions = createReactiveSessions(sessionManager);
            this.$wot = createReactiveWoT(this, this.$sessions);
        }

        // Initialize stores that don't require sessions
        this.$payments = createReactivePayments();
        this.$pool = createReactivePool(this);

        // Sync active user from NDK to reactive state
        // Listen to activeUser:change event to update reactive state
        this.on("activeUser:change", (user) => {
            this.#activeUser = user;
        });

        // Initialize with current active user if already set
        this.#activeUser = this.activeUser;
    }

    /**
     * Create a reactive subscription
     *
     * Returns a reactive Subscription object that updates automatically as events arrive.
     * The $ prefix indicates this returns reactive Svelte state.
     * For callback-based subscriptions, use the base subscribe() method.
     *
     * All config properties are reactive - subscription automatically restarts when filters
     * or NDK options (relayUrls, pool, etc.) change, and re-processes events when wrapper
     * options (wot, etc.) change.
     *
     * @example
     * ```ts
     * // Reactive config - automatically restarts when kind or relays change
     * let kind = $state(1);
     * let selectedRelays = $state(['wss://relay.damus.io']);
     *
     * const notes = ndk.$subscribe(() => ({
     *   filters: [{ kinds: [kind], limit: 50 }],
     *   relayUrls: selectedRelays
     * }));
     *
     * // Reactive access in templates
     * {#each notes.events as note}
     *   <div>{note.content}</div>
     * {/each}
     * ```
     */
    $subscribe<T extends NDKEvent = NDKEvent>(config: () => SubscribeConfig | undefined): Subscription<T> {
        return createSubscription<T>(this, config);
    }

    /**
     * Reactively fetch a user by identifier
     *
     * Returns a reactive proxy to the user that updates when the identifier changes.
     * Use it directly as if it were an NDKUser - all property access is reactive.
     *
     * @example
     * ```ts
     * const identifier = $derived($page.params.id);
     * const user = ndk.$fetchUser(() => identifier);
     *
     * // In template
     * {#if user}
     *   <div>{user.npub}</div>
     * {/if}
     * ```
     */
    $fetchUser(identifier: () => string | undefined) {
        return createFetchUser(this, identifier);
    }

    /**
     * Reactively fetch a user profile by pubkey
     *
     * Returns a reactive proxy to the profile that updates when the pubkey changes.
     * Use it directly as if it were an NDKUserProfile - all property access is reactive.
     *
     * @example
     * ```ts
     * const user = ndk.$fetchUser(() => identifier);
     * const profile = ndk.$fetchProfile(() => user?.pubkey);
     *
     * // In template
     * {#if profile}
     *   <h1>{profile.name}</h1>
     * {/if}
     * ```
     */
    $fetchProfile(pubkey: () => string | undefined) {
        return createFetchProfile(this, pubkey);
    }

    /**
     * Reactively access the current active user
     *
     * Returns a reactive value that updates when the active user changes.
     * The active user is set when:
     * - A signer is assigned to NDK
     * - A read-only user session is created (via sessions manager)
     * - activeUser is set directly on the NDK instance
     *
     * @example
     * ```ts
     * const currentUser = ndk.$currentUser;
     *
     * // In template
     * {#if currentUser}
     *   <div>Logged in as {currentUser.npub}</div>
     * {/if}
     * ```
     */
    get $currentUser() {
        return this.#activeUser;
    }
}
