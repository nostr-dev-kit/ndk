import type { NDKConstructorParams, NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";
import { LocalStorage, NDKSessionManager } from "@nostr-dev-kit/sessions";
import type { SessionManagerOptions } from "@nostr-dev-kit/sessions";
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
import type { SubscribeOptions, Subscription } from "./subscribe.svelte.js";
import { createSubscription } from "./subscribe.svelte.js";
import { createFetchUser } from "./user.svelte.js";
import { createFetchProfile } from "./profile.svelte.js";

export interface NDKSvelteParams extends NDKConstructorParams {
    /**
     * Session manager options
     */
    sessionOptions?: SessionManagerOptions;
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
    $sessions!: ReactiveSessionsStore;
    $wot!: ReactiveWoTStore;
    $wallet!: ReactiveWalletStore;
    $payments!: ReactivePaymentsStore;
    $pool!: ReactivePoolStore;

    constructor(params: NDKSvelteParams = {}) {
        super(params);

        // Create session manager with options from params
        const sessionManager = new NDKSessionManager(this, {
            storage: new LocalStorage(),
            autoSave: true,
            fetches: {
                follows: true,
                mutes: true,
                wallet: true,
            },
            ...params.sessionOptions,
        });

        // Initialize reactive stores
        // Both stores subscribe independently to session manager
        this.$wallet = createReactiveWallet(this, sessionManager);
        this.$sessions = createReactiveSessions(sessionManager);
        this.$wot = createReactiveWoT(this, this.$sessions);
        this.$payments = createReactivePayments();
        this.$pool = createReactivePool(this);
    }

    /**
     * Create a reactive subscription
     *
     * Returns a reactive Subscription object that updates automatically as events arrive.
     * The $ prefix indicates this returns reactive Svelte state.
     * For callback-based subscriptions, use the base subscribe() method.
     *
     * @example
     * ```ts
     * const notes = ndk.$subscribe(() => ({ kinds: [1], limit: 50 }));
     *
     * // Reactive access in templates
     * {#each notes.events as note}
     *   <div>{note.content}</div>
     * {/each}
     * ```
     */
    $subscribe<T extends NDKEvent = NDKEvent>(
        filters: () => NDKFilter | NDKFilter[] | undefined,
        opts?: SubscribeOptions,
    ): Subscription<T> {
        return createSubscription<T>(this, filters, opts);
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
}
