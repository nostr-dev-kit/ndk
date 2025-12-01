import type { NDKEvent, NDKFilter, NDKSubscription, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKKind, NDKNutzap } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../ndk-svelte.svelte.js";
import { validateCallback } from "../utils/validate-callback.js";
import { validateZap } from "../zaps/validation.js";
import { getZapAmount, type ZapMethod } from "../zaps/utils.js";

export { validateNip57Zap, validateNip61Zap, validateZap } from "../zaps/validation.js";
export { getZapAmount, getZapSender, getZapComment, getZapMethod, hasZappedBy, type ZapMethod } from "../zaps/utils.js";

export interface ZapConfig {
    /**
     * Target to get zaps for (event or user)
     */
    target: NDKEvent | NDKUser;

    /**
     * Only return validated zaps
     * @default false
     */
    validated?: boolean;

    /**
     * Filter by zap method
     */
    method?: ZapMethod;

    /**
     * Limit number of zaps returned
     */
    limit?: number;
}

export interface ZapSubscription {
    /**
     * All zap events (both NIP-57 and NIP-61)
     */
    get events(): NDKEvent[];

    /**
     * Total number of zaps
     */
    get count(): number;

    /**
     * Total amount zapped in sats
     */
    get totalAmount(): number;

    /**
     * Whether subscription has reached end of stored events
     */
    get eosed(): boolean;

    /**
     * NIP-57 lightning zaps only (kind 9735)
     */
    get lightningZaps(): NDKEvent[];

    /**
     * NIP-61 nutzaps only (kind 9321)
     */
    get nutzaps(): NDKNutzap[];

    /**
     * Stop the subscription
     */
    stop(): void;

    /**
     * Start the subscription
     */
    start(): void;

    /**
     * Clear all events
     */
    clear(): void;
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
export function createZapSubscription(
    ndk: NDKSvelte,
    config: () => ZapConfig | undefined,
): ZapSubscription {
    validateCallback(config, "$zaps", "config");

    let _events = $state<NDKEvent[]>([]);
    let _eosed = $state(false);
    const eventMap = new Map<string, NDKEvent>();
    let subscription: NDKSubscription | undefined;

    // Derive config and filter from callback
    const derivedConfig = $derived(config());

    const filter = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg) return undefined;

        const { target, method, limit } = cfg;

        // Determine which kinds to subscribe to
        let kinds: number[];
        if (method === "nip57") {
            kinds = [NDKKind.Zap];
        } else if (method === "nip61") {
            kinds = [NDKKind.Nutzap];
        } else {
            kinds = [NDKKind.Zap, NDKKind.Nutzap];
        }

        // Use target's filter() method and merge with kinds
        const targetFilter = target.filter();
        return {
            ...targetFilter,
            kinds,
            limit,
        } as NDKFilter;
    });

    function handleEvent(event: NDKEvent) {
        const key = event.deduplicationKey();

        // Skip if we already have this event
        if (eventMap.has(key)) {
            const existing = eventMap.get(key);
            if (existing) {
                const existingTime = existing.created_at || 0;
                const newTime = event.created_at || 0;
                if (existingTime >= newTime) {
                    return;
                }
            }
        }

        eventMap.set(key, event);
        updateEvents();
    }

    function handleEvents(events: NDKEvent[]) {
        for (const event of events) {
            const key = event.deduplicationKey();

            if (!eventMap.has(key)) {
                eventMap.set(key, event);
            } else {
                const existing = eventMap.get(key);
                if (existing) {
                    const existingTime = existing.created_at || 0;
                    const newTime = event.created_at || 0;
                    if (newTime > existingTime) {
                        eventMap.set(key, event);
                    }
                }
            }
        }
        updateEvents();
    }

    function updateEvents() {
        let events = Array.from(eventMap.values());
        events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        _events = events;
    }

    function start() {
        if (subscription || !filter) return;

        subscription = ndk.subscribe(filter, {
            closeOnEose: false,
            onEvent: handleEvent,
            onEvents: handleEvents,
            onEose: () => {
                _eosed = true;
            },
        });
    }

    function stop() {
        subscription?.stop();
        subscription = undefined;
    }

    function restart() {
        stop();
        eventMap.clear();
        _events = [];
        _eosed = false;
        start();
    }

    function clear() {
        eventMap.clear();
        _events = [];
        _eosed = false;
    }

    // Restart subscription when filter changes
    $effect(() => {
        const f = filter;
        if (!f) {
            stop();
            return;
        }
        restart();
    });

    // Process and filter events
    const processedEvents = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg) return [];

        let events = _events;

        // Apply validation filter if requested
        if (cfg.validated) {
            events = events.filter((e) => validateZap(e, cfg.target));
        }

        return events;
    });

    const lightningZaps = $derived.by(() => {
        return processedEvents.filter((e) => e.kind === NDKKind.Zap);
    });

    const nutzaps = $derived.by(() => {
        return processedEvents
            .filter((e) => e.kind === NDKKind.Nutzap)
            .map((e) => NDKNutzap.from(e))
            .filter((n): n is NDKNutzap => n !== undefined);
    });

    const totalAmount = $derived.by(() => {
        return processedEvents.reduce((sum, event) => sum + getZapAmount(event), 0);
    });

    return {
        get events() {
            return processedEvents;
        },
        get count() {
            return processedEvents.length;
        },
        get totalAmount() {
            return totalAmount;
        },
        get eosed() {
            return _eosed;
        },
        get lightningZaps() {
            return lightningZaps;
        },
        get nutzaps() {
            return nutzaps;
        },
        stop,
        start,
        clear,
    };
}
