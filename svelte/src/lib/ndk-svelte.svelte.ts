import type { NDKConstructorParams, NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";
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

    constructor(params: NDKConstructorParams = {}) {
        super(params);

        // Initialize reactive stores
        this.$sessions = createReactiveSessions(this);
        this.$wot = createReactiveWoT(this, this.$sessions);
        this.$wallet = createReactiveWallet();
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
     * const notes = ndk.$subscribe({ kinds: [1], limit: 50 });
     *
     * // Reactive access in templates
     * {#each notes.events as note}
     *   <div>{note.content}</div>
     * {/each}
     * ```
     */
    $subscribe<T extends NDKEvent = NDKEvent>(
        filters: NDKFilter | NDKFilter[] | (() => NDKFilter | NDKFilter[] | undefined),
        opts?: SubscribeOptions,
    ): Subscription<T> {
        return createSubscription<T>(this, filters, opts);
    }
}
