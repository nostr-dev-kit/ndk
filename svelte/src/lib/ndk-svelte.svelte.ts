import type { NDKConstructorParams, NDKEvent, NDKFilter, NDKRelay, NDKUser, NDKUserProfile, Hexpubkey } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";
import type { SessionManagerOptions } from "@nostr-dev-kit/sessions";
import { LocalStorage, NDKSessionManager } from "@nostr-dev-kit/sessions";
import * as ndkSvelteGuardrails from "./ai-guardrails/constructor.js";
import * as subscribeGuardrails from "./ai-guardrails/subscribe.js";
import { createFetchProfile } from "./profile.svelte.js";
import { createFetchEvent, createFetchEvents } from "./event.svelte.js";
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
import { createFetchUser } from "./user.svelte.js";

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
     * Add a follow (publishes to network)
     */
    async add(pubkey: Hexpubkey): Promise<boolean> {
        const user = this.#sessions?.currentUser;
        if (!user) throw new Error("No active user");
        const followSet = this.#sessions?.follows ?? new Set();
        return await user.follow(pubkey, followSet);
    }

    /**
     * Remove a follow (publishes to network)
     */
    async remove(pubkey: Hexpubkey): Promise<Set<NDKRelay> | boolean> {
        const user = this.#sessions?.currentUser;
        if (!user) throw new Error("No active user");
        const followSet = this.#sessions?.follows ?? new Set();
        return await user.unfollow(pubkey, followSet);
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
    $fetchUser(identifier: () => string | undefined): NDKUser | undefined {
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
    $fetchProfile(pubkey: () => string | undefined): NDKUserProfile | undefined {
        return createFetchProfile(this, pubkey);
    }

    /**
     * Reactively fetch a single event
     *
     * Returns a reactive proxy to the event that updates when the identifier/filter changes.
     * Use it directly as if it were an NDKEvent - all property access is reactive.
     *
     * **Event Wrapping (Default: Enabled)**
     * - Events are automatically wrapped in their kind-specific classes (e.g., NDKArticle for kind 30023)
     * - Invalid events that fail wrapper validation are silently dropped, returning undefined
     * - This protects your app from receiving malformed events
     * - To disable wrapping, pass `{ wrap: false }` as the second argument
     *
     * @param idOrFilter - Callback returning event ID (bech32), filter, or undefined
     * @param options - Optional fetch options. Use `{ wrap: false }` to disable automatic wrapping and validation
     *
     * @example
     * ```ts
     * // Fetch by event ID (bech32 format)
     * const eventId = $derived($page.params.id);
     * const event = ndk.$fetchEvent(() => eventId); // "note1..." or "nevent1..."
     *
     * // In template
     * {#if event}
     *   <div>{event.content}</div>
     * {/if}
     * ```
     *
     * @example
     * ```ts
     * import type { NDKArticle } from "@nostr-dev-kit/ndk";
     *
     * // Type the result as NDKArticle to access article-specific properties
     * const article = ndk.$fetchEvent<NDKArticle>(() => naddr);
     *
     * // In template
     * {#if article}
     *   <h1>{article.title}</h1>
     *   <div>{article.content}</div>
     * {/if}
     * ```
     *
     * @example
     * ```ts
     * // Disable automatic wrapping
     * const event = ndk.$fetchEvent(() => eventId, { wrap: false });
     * ```
     *
     * @example
     * ```ts
     * // Fetch by filter
     * const event = ndk.$fetchEvent(() => ({
     *   kinds: [0],
     *   authors: [pubkey],
     *   limit: 1
     * }));
     * ```
     *
     * @example
     * ```ts
     * // Conditional fetch - return undefined to prevent fetching
     * const event = ndk.$fetchEvent(() => {
     *   if (!eventId) return undefined;
     *   return eventId;
     * });
     * ```
     */
    $fetchEvent<T extends NDKEvent = NDKEvent>(
        idOrFilter: () => string | NDKFilter | NDKFilter[] | undefined,
        options?: import("./event.svelte").FetchEventOptions,
    ): T | undefined {
        return createFetchEvent<T>(this, idOrFilter, options);
    }

    /**
     * Reactively fetch multiple events
     *
     * Returns a reactive array of events that updates when the filters change.
     *
     * **Event Wrapping (Default: Enabled)**
     * - Events are automatically wrapped in their kind-specific classes (e.g., NDKArticle for kind 30023)
     * - Invalid events that fail wrapper validation are silently dropped from the results
     * - This protects your app from receiving malformed events
     * - To disable wrapping, pass `{ wrap: false }` as the second argument
     *
     * @param filters - Callback returning filters or undefined
     * @param options - Optional fetch options. Use `{ wrap: false }` to disable automatic wrapping and validation
     *
     * @example
     * ```ts
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
     * import type { NDKArticle } from "@nostr-dev-kit/ndk";
     *
     * // Type the result as NDKArticle[] to access article-specific properties
     * const articles = ndk.$fetchEvents<NDKArticle>(() => ({
     *   kinds: [30023],
     *   authors: [pubkey],
     *   limit: 10
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
     * // Disable automatic wrapping
     * const events = ndk.$fetchEvents(() => ({ kinds: [1] }), { wrap: false });
     * ```
     *
     * @example
     * ```ts
     * // Conditional fetch - return undefined to prevent fetching
     * const events = ndk.$fetchEvents(() => {
     *   if (!shouldFetch) return undefined;
     *   return { kinds: [1], authors: [pubkey] };
     * });
     * ```
     */
    $fetchEvents<T extends NDKEvent = NDKEvent>(
        filters: () => NDKFilter | NDKFilter[] | undefined,
        options?: import("./event.svelte").FetchEventOptions,
    ): T[] {
        return createFetchEvents<T>(this, filters, options);
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
     * Returns a reactive array of hex pubkeys that the current user follows.
     * Returns an empty array if sessions are not enabled or no session is active.
     * Automatically updates when the session's follow list changes.
     *
     * Includes add() and remove() methods to modify the follow list and publish to the network.
     *
     * @example
     * ```ts
     * const follows = ndk.$follows;
     *
     * // In template
     * {#each follows as pubkey}
     *   <UserCard {pubkey} />
     * {/each}
     * ```
     *
     * @example
     * ```ts
     * // Use in subscriptions
     * const feed = ndk.$subscribe(() => ({
     *   filters: [{ kinds: [1], authors: ndk.$follows, limit: 50 }]
     * }));
     * ```
     *
     * @example
     * ```ts
     * // Add/remove follows
     * await ndk.$follows.add(pubkey);
     * await ndk.$follows.remove(pubkey);
     * ```
     */
    get $follows(): ReactiveFollows {
        const followsArray = Array.from(this.$sessions?.follows ?? []);
        return new ReactiveFollows(followsArray, this.$sessions);
    }
}
