import type { NDKConstructorParams, NDKFilter, NDKRelay, NDKUser, NDKUserProfile, Hexpubkey } from "@nostr-dev-kit/ndk";
import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import type { SessionManagerOptions } from "@nostr-dev-kit/sessions";
import { LocalStorage, NDKSessionManager } from "@nostr-dev-kit/sessions";
import * as ndkSvelteGuardrails from "./ai-guardrails/constructor.js";
import * as subscribeGuardrails from "./ai-guardrails/subscribe.js";
import { createFetchEvents } from "./event.svelte.js";
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
import type { MetaSubscribeConfig, MetaSubscription } from "./meta-subscribe.svelte.js";
import { createMetaSubscription } from "./meta-subscribe.svelte.js";
import type { ZapConfig, ZapSubscription } from "./zaps.svelte.js";
import { createZapSubscription } from "./zaps.svelte.js";

/**
 * Reactive follows list with add/remove methods
 */
class ReactiveFollows extends Array<Hexpubkey> {
    #sessions?: ReactiveSessionsStore;

    constructor(follows: Hexpubkey[], sessions?: ReactiveSessionsStore) {
        super(...follows);
        this.#sessions = sessions;
    }

    /**
     * Add one or more follows (publishes once to network)
     * @param pubkeys - Single pubkey or array of pubkeys to follow
     * @returns true if any new follows were added, false if all were already followed
     */
    async add(pubkeys: Hexpubkey | Hexpubkey[]): Promise<boolean> {
        const user = this.#sessions?.currentUser;
        if (!user) throw new Error("No active user");
        if (!user.ndk) throw new Error("No NDK instance found");

        user.ndk.assertSigner();

        const pubkeysArray = Array.isArray(pubkeys) ? pubkeys : [pubkeys];
        const followSet = this.#sessions?.follows ?? new Set();

        // Check if any pubkeys are new
        const newPubkeys = pubkeysArray.filter(pk => !followSet.has(pk));
        if (newPubkeys.length === 0) return false;

        // Add all new pubkeys to the follow set
        for (const pubkey of newPubkeys) {
            followSet.add(pubkey);
        }

        // Publish once with updated follow list
        const event = new NDKEvent(user.ndk, { kind: 3 } as any);
        for (const pubkey of followSet) {
            event.tags.push(["p", pubkey]);
        }

        await event.publish();
        return true;
    }

    /**
     * Remove one or more follows (publishes once to network)
     * @param pubkeys - Single pubkey or array of pubkeys to unfollow
     * @returns Set of relays where published, or false if none were following
     */
    async remove(pubkeys: Hexpubkey | Hexpubkey[]): Promise<Set<NDKRelay> | boolean> {
        const user = this.#sessions?.currentUser;
        if (!user) throw new Error("No active user");
        if (!user.ndk) throw new Error("No NDK instance found");

        user.ndk.assertSigner();

        const pubkeysArray = Array.isArray(pubkeys) ? pubkeys : [pubkeys];
        const followSet = this.#sessions?.follows ?? new Set();

        // Check if any pubkeys are currently followed
        const toRemove = pubkeysArray.filter(pk => followSet.has(pk));
        if (toRemove.length === 0) return false;

        // Remove pubkeys from the follow set
        for (const pubkey of toRemove) {
            followSet.delete(pubkey);
        }

        // Publish once with updated follow list
        const event = new NDKEvent(user.ndk, { kind: 3 } as any);
        for (const pubkey of followSet) {
            event.tags.push(["p", pubkey]);
        }

        return await event.publish();
    }
}

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
     * const ndk = createNDK({ explicitRelayUrls: [...] });
     *
     * // Sessions with defaults
     * const ndk = createNDK({ session: true });
     *
     * // Sessions with custom settings
     * const ndk = createNDK({
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
 * const ndk = createNDK({
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
 * const notes = ndk.$subscribe(() => ({ filters: [{ kinds: [1], limit: 50 }] }));
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

        // Register subscribe guardrails
        this.aiGuardrails?.register("ndkSvelteSubscribe", {
            subscribing: subscribeGuardrails.subscribing,
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
     * // Shorthand: Return filter directly (automatically wrapped)
     * const notes = ndk.$subscribe(() => ({ kinds: [1], limit: 50 }));
     *
     * // Reactive access in templates
     * {#each notes.events as note}
     *   <div>{note.content}</div>
     * {/each}
     * ```
     *
     * @example
     * ```ts
     * // Shorthand: Return array of filters (automatically wrapped)
     * const events = ndk.$subscribe(() => [
     *   { kinds: [1], authors: [pubkey1] },
     *   { kinds: [1], authors: [pubkey2] }
     * ]);
     * ```
     *
     * @example
     * ```ts
     * // Full config - use when you need additional options
     * let kind = $state(1);
     * let selectedRelays = $state(['wss://relay.damus.io']);
     *
     * const notes = ndk.$subscribe(() => ({
     *   filters: [{ kinds: [kind], limit: 50 }],
     *   relayUrls: selectedRelays,
     *   wot: { minScore: 0.5 }
     * }));
     * ```
     *
     * @example
     * ```ts
     * // Conditional subscription - return undefined to prevent subscription
     * let selectedRelay = $state<string | undefined>();
     * let isEnabled = $state(false);
     *
     * const notes = ndk.$subscribe(() => {
     *   // No subscription until both conditions are met
     *   if (!selectedRelay || !isEnabled) return undefined;
     *
     *   return {
     *     filters: [{ kinds: [1], limit: 20 }],
     *     relayUrls: [selectedRelay]
     *   };
     * });
     * ```
     */
    $subscribe<T extends NDKEvent = NDKEvent>(config: () => SubscribeConfig | NDKFilter | NDKFilter[] | undefined): Subscription<T> {
        // Announce to guardrails for validation
        (this.aiGuardrails as any)?.ndkSvelteSubscribe?.subscribing(config);

        return createSubscription<T>(this, config);
    }

    /**
     * Create a reactive meta-subscription
     *
     * Returns events pointed to by e-tags and a-tags, rather than the matching events themselves.
     * Perfect for showing reposted content, commented articles, zapped notes, etc.
     *
     * @example
     * ```ts
     * // Show content reposted by people you follow
     * const feed = ndk.$metaSubscribe(() => ({
     *   filters: [{ kinds: [6, 16], authors: $follows }],
     *   sort: 'tag-time'
     * }));
     *
     * {#each feed.events as event}
     *   {@const pointers = feed.eventsTagging(event)}
     *   <Note {event}>
     *     <span>Reposted by {pointers.length} people</span>
     *   </Note>
     * {/each}
     * ```
     *
     * @example
     * ```ts
     * // Show articles commented on by your follows
     * const articles = ndk.$metaSubscribe(() => ({
     *   filters: [{ kinds: [1111], "#K": ["30023"], authors: $follows }],
     *   sort: 'count'
     * }));
     *
     * {#each articles.events as article}
     *   {@const comments = articles.eventsTagging(article)}
     *   <ArticleCard {article}>
     *     <span>{comments.length} comments</span>
     *   </ArticleCard>
     * {/each}
     * ```
     */
    $metaSubscribe<T extends NDKEvent = NDKEvent>(config: () => MetaSubscribeConfig | NDKFilter | NDKFilter[] | undefined): MetaSubscription<T> {
        return createMetaSubscription<T>(this, config);
    }


    /**
     * Reactively fetch multiple events
     *
     * Returns a reactive array of events that updates when the filters change.
     * Supports all NDKSubscriptionOptions (relayUrls, pool, closeOnEose, groupable, cacheUsage, etc.)
     *
     * All config properties are reactive - fetch automatically re-runs when filters
     * or NDK options (relayUrls, pool, etc.) change.
     *
     * @param config - Callback returning config or filters or undefined
     *
     * @example
     * ```ts
     * // Shorthand: Return filter directly (automatically wrapped)
     * const pubkey = $state('hex...');
     * const events = ndk.$fetchEvents(() => ({
     *   kinds: [1],
     *   authors: [pubkey],
     *   limit: 10
     * }));
     *
     * // In template
     * {#each events as event}
     *   <div>{event.content}</div>
     * {/each}
     * ```
     *
     * @example
     * ```ts
     * // Shorthand: Return array of filters (automatically wrapped)
     * const events = ndk.$fetchEvents(() => [
     *   { kinds: [1], authors: [pubkey1] },
     *   { kinds: [1], authors: [pubkey2] }
     * ]);
     * ```
     *
     * @example
     * ```ts
     * import type { NDKArticle } from "@nostr-dev-kit/ndk";
     *
     * // Full config - use when you need additional options
     * let selectedRelays = $state(['wss://relay.damus.io']);
     *
     * const articles = ndk.$fetchEvents<NDKArticle>(() => ({
     *   filters: [{ kinds: [30023], limit: 10 }],
     *   relayUrls: selectedRelays,
     *   closeOnEose: true
     * }));
     *
     * // In template
     * {#each articles as article}
     *   <h2>{article.title}</h2>
     *   <div>{article.content}</div>
     * {/each}
     * ```
     *
     * @example
     * ```ts
     * // Conditional fetch - return undefined to prevent fetching
     * const events = ndk.$fetchEvents(() => {
     *   if (!shouldFetch) return undefined;
     *   return {
     *     filters: [{ kinds: [1], authors: [pubkey] }],
     *     relayUrls: selectedRelays
     *   };
     * });
     * ```
     */
    $fetchEvents<T extends NDKEvent = NDKEvent>(
        config: () => import("./event.svelte").FetchEventsConfig | NDKFilter | NDKFilter[] | undefined,
    ): T[] {
        return createFetchEvents<T>(this, config);
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

    /**
     * Alias for $currentUser
     *
     * @example
     * ```ts
     * const user = ndk.$activeUser;
     * ```
     */
    get $activeUser() {
        return this.#activeUser;
    }

    /**
     * Reactively access the current active user's pubkey
     *
     * Returns a reactive value that updates when the active user changes.
     * Returns undefined if no user is active.
     *
     * @example
     * ```ts
     * const pubkey = ndk.$currentPubkey;
     *
     * // In template
     * {#if pubkey}
     *   <div>Pubkey: {pubkey}</div>
     * {/if}
     * ```
     */
    get $currentPubkey() {
        return this.#activeUser?.pubkey;
    }

    /**
     * Reactively access the current active session
     *
     * Returns a reactive value that updates when the active session changes.
     * Returns undefined if sessions are not enabled or no session is active.
     *
     * @example
     * ```ts
     * const currentSession = ndk.$currentSession;
     *
     * // In template
     * {#if currentSession}
     *   <div>Session: {currentSession.pubkey}</div>
     * {/if}
     * ```
     */
    get $currentSession() {
        return this.$sessions?.current;
    }

    /**
     * Reactively access the current session's follow list
     *
     * Returns a reactive array (extends Array) of hex pubkeys that the current user follows.
     * Returns an empty array if sessions are not enabled or no session is active.
     * Automatically updates when the session's follow list changes.
     *
     * Includes add() and remove() methods to modify the follow list and publish to the network.
     *
     * **Difference from `ndk.$sessions.follows`:**
     * - `ndk.$follows` - Reactive array (best for templates and subscriptions)
     * - `ndk.$sessions.follows` - FollowsProxy with Set-like interface (best for Set operations like `has()`, `size`)
     *
     * Both update reactively and both have `add()`/`remove()` methods that publish to the network.
     *
     * @example
     * ```ts
     * // Iterate over follows in a template
     * {#each ndk.$follows as pubkey}
     *   <UserCard {pubkey} />
     * {/each}
     * ```
     *
     * @example
     * ```ts
     * // Use directly in subscriptions (as an array)
     * const feed = ndk.$subscribe(() => ({
     *   filters: [{ kinds: [1], authors: ndk.$follows, limit: 50 }]
     * }));
     * ```
     *
     * @example
     * ```ts
     * // Check count
     * const followCount = ndk.$follows.length;
     * ```
     *
     * @example
     * ```ts
     * // Add/remove follows (publishes to network)
     * await ndk.$follows.add(pubkey);
     * await ndk.$follows.remove(pubkey);
     * ```
     *
     * @example
     * ```ts
     * // Array methods work
     * const firstTen = ndk.$follows.slice(0, 10);
     * const filtered = ndk.$follows.filter(pk => someCondition(pk));
     * ```
     */
    get $follows(): ReactiveFollows {
        const followsArray = Array.from(this.$sessions?.follows ?? []);
        return new ReactiveFollows(followsArray, this.$sessions);
    }

    /**
     * Create a reactive zap subscription
     *
     * Returns an object with reactive getters for zap events on a target (event or user).
     * Supports both NIP-57 (kind 9735) and NIP-61 (kind 9321) zaps.
     *
     * @example
     * ```svelte
     * <script lang="ts">
     *   // Subscribe to all zaps for an event
     *   const zaps = ndk.$zaps(() => ({ target: event }));
     * </script>
     *
     * <div>
     *   {zaps.totalAmount} sats from {zaps.count} zaps
     * </div>
     *
     * {#each zaps.events as zap}
     *   <div>{getZapAmount(zap)} sats</div>
     * {/each}
     * ```
     *
     * @example
     * ```svelte
     * <script lang="ts">
     *   // Only validated NIP-57 lightning zaps
     *   const lightningZaps = ndk.$zaps(() => ({
     *     target: event,
     *     validated: true,
     *     method: 'nip57'
     *   }));
     * </script>
     *
     * {#each lightningZaps.events as zap}
     *   <div>{getZapSender(zap).npub()} zapped {getZapAmount(zap)} sats</div>
     * {/each}
     * ```
     *
     * @example
     * ```svelte
     * <script lang="ts">
     *   // Conditional subscription
     *   let showZaps = $state(false);
     *
     *   const zaps = ndk.$zaps(() => {
     *     if (!showZaps) return undefined;
     *     return { target: event, validated: true };
     *   });
     * </script>
     * ```
     */
    $zaps(config: () => ZapConfig | undefined): ZapSubscription {
        return createZapSubscription(this, config);
    }
}

/**
 * Type helper for NDKSvelte with session stores guaranteed to exist
 */
export type NDKSvelteWithSession = NDKSvelte & {
    $sessions: ReactiveSessionsStore;
    $wot: ReactiveWoTStore;
    $wallet: ReactiveWalletStore;
};

/**
 * Create an NDKSvelte instance with type-safe session stores
 *
 * When session is enabled, TypeScript guarantees that $wallet, $sessions, and $wot exist.
 * This eliminates the need for optional chaining and provides better type safety.
 *
 * @example
 * ```typescript
 * // With sessions - stores are guaranteed to exist
 * const ndk = createNDK({
 *   explicitRelayUrls: ['wss://relay.damus.io'],
 *   session: true
 * });
 * ndk.$wallet.balance; // ✅ No optional chaining needed
 * ndk.$sessions.follows; // ✅ TypeScript knows these exist
 * ```
 *
 * @example
 * ```typescript
 * // Without sessions - stores are optional
 * const ndk = createNDK({
 *   explicitRelayUrls: ['wss://relay.damus.io']
 * });
 * ndk.$wallet?.balance; // ⚠️ Must use optional chaining
 * ```
 */
export function createNDK(
    params: Omit<NDKSvelteParams, 'session'> & {
        session: true | SessionManagerOptions
    }
): NDKSvelteWithSession;

export function createNDK(
    params?: NDKSvelteParams
): NDKSvelte;

export function createNDK(params: NDKSvelteParams = {}): NDKSvelte {
    return new NDKSvelte(params);
}
