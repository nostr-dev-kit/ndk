import NDK from "@nostr-dev-kit/ndk";
import type { NDKConstructorParams, NDKFilter, NDKEvent } from "@nostr-dev-kit/ndk";
import { createReactiveSessions } from "./stores/sessions.svelte.js";
import { createReactiveWoT } from "./stores/wot.svelte.js";
import { createReactiveWallet } from "./stores/wallet.svelte.js";
import { createReactivePayments } from "./stores/payments.svelte.js";
import { createReactivePool } from "./stores/pool.svelte.js";
import { createReactiveSubscription } from "./subscribe.svelte.js";
import type { SubscribeOptions, Subscription } from "./subscribe.svelte.js";
import type { ReactiveSessionsStore } from "./stores/sessions.svelte.js";
import type { ReactiveWoTStore } from "./stores/wot.svelte.js";
import type { ReactiveWalletStore } from "./stores/wallet.svelte.js";
import type { ReactivePaymentsStore } from "./stores/payments.svelte.js";
import type { ReactivePoolStore } from "./stores/pool.svelte.js";

/**
 * NDK Svelte 5 - Reactive NDK instance
 *
 * Extends NDK with Svelte 5 reactive stores and features.
 * All stores are namespaced under the ndk instance for discoverability.
 *
 * @example
 * ```ts
 * import { createNDK } from '@nostr-dev-kit/svelte';
 *
 * const ndk = createNDK({
 *   relays: ['wss://relay.damus.io']
 * });
 *
 * // Access reactive stores
 * const session = ndk.sessions.current;
 * const score = ndk.wot.getScore(pubkey);
 *
 * // Reactive subscriptions
 * const notes = ndk.subscribe({ kinds: [1], limit: 50 });
 *
 * // Profiles via cache (core NDK functionality)
 * const user = ndk.getUser({ pubkey });
 * await user.fetchProfile();
 * {user.profile?.name}
 * ```
 */
export class NDKSvelte extends NDK {
    // Reactive stores namespaced under ndk
    sessions!: ReactiveSessionsStore;
    wot!: ReactiveWoTStore;
    wallet!: ReactiveWalletStore;
    payments!: ReactivePaymentsStore;
    poolStats!: ReactivePoolStore;

    constructor(params: NDKConstructorParams = {}) {
        super(params);

        // Initialize reactive stores
        this.sessions = createReactiveSessions(this);
        this.wot = createReactiveWoT(this, this.sessions);
        this.wallet = createReactiveWallet(this);
        this.payments = createReactivePayments(this);
        this.poolStats = createReactivePool(this);
    }

    /**
     * Create a reactive subscription
     *
     * Shadows NDK.subscribe() to return a reactive Subscription object
     * instead of NDKSubscription.
     *
     * @example
     * ```ts
     * const notes = ndk.subscribe({ kinds: [1], limit: 50 });
     *
     * // Reactive access in templates
     * {#each notes.events as note}
     *   <div>{note.content}</div>
     * {/each}
     * ```
     */
    subscribe<T extends NDKEvent = NDKEvent>(
        filters: NDKFilter | NDKFilter[] | (() => NDKFilter | NDKFilter[] | undefined),
        opts?: SubscribeOptions
    ): Subscription<T> {
        return createReactiveSubscription<T>(this, filters, opts);
    }
}
