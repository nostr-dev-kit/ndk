import type { NDKEvent, NDKFilter, NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte.js";
import type { SubscribeConfig } from "./subscribe.svelte.js";
import { validateCallback } from "./utils/validate-callback.js";

export type MetaSubscribeSortOption = "time" | "count" | "tag-time" | "unique-authors";

export interface MetaSubscribeConfig extends Omit<SubscribeConfig, "dedupeKey"> {
    /**
     * How to sort the pointed-to events
     * - 'time': Sort by event.created_at (newest first)
     * - 'count': Sort by number of pointers (most pointed-to first)
     * - 'tag-time': Sort by most recently tagged (newest pointer first)
     * - 'unique-authors': Sort by number of unique authors pointing to it (most diverse first)
     */
    sort?: MetaSubscribeSortOption;
}

export interface MetaSubscription<T extends NDKEvent = NDKEvent> {
    // Reactive reads
    get events(): T[];
    get count(): number;
    get eosed(): boolean;

    /**
     * Map of tagId -> pointer events
     * The key is the event.tagId() of the pointed-to event
     * The value is an array of events that point to it
     */
    get pointedBy(): Map<string, NDKEvent[]>;

    /**
     * Helper to get the events that are tagging/pointing to a specific event
     * @param event The event to get pointers for
     * @returns Array of events that point to this event (via e-tag or a-tag)
     */
    eventsTagging(event: NDKEvent): NDKEvent[];

    // Methods
    start(): void;
    stop(): void;
    clear(): void;
}

/**
 * Create a reactive meta-subscription
 *
 * Instead of returning events that match the filter, returns the events they point to
 * via e-tags and a-tags. Perfect for showing reposted content, commented articles, etc.
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
export function createMetaSubscription<T extends NDKEvent = NDKEvent>(
    ndk: NDKSvelte,
    config: () => MetaSubscribeConfig | NDKFilter | NDKFilter[] | undefined,
): MetaSubscription<T> {
    validateCallback(config, '$metaSubscribe', 'config');

    let _events = $state<T[]>([]);
    let _eosed = $state(false);
    let _pointedBy = $state<Map<string, NDKEvent[]>>(new Map());

    // Map to track pointed-to events by their tagId
    const targetEventMap = new Map<string, T>();

    // Map to track pointer events by the tagId they point to
    const pointersByTarget = new Map<string, NDKEvent[]>();

    let subscription: import("@nostr-dev-kit/ndk").NDKSubscription | undefined;
    let currentFilters: NDKFilter[];
    let currentNdkOpts: NDKSubscriptionOptions;
    let currentSort: MetaSubscribeSortOption;

    // Derive reactive config
    const derivedConfig = $derived.by(() => {
        const rawConfig = config();
        if (!rawConfig) return rawConfig;

        // If config has 'filters' property, use it as-is
        if ('filters' in rawConfig) {
            return rawConfig;
        }

        // Check if this is an array (array of filters)
        if (Array.isArray(rawConfig)) {
            return { filters: rawConfig as NDKFilter[] } as MetaSubscribeConfig;
        }

        // Check if this looks like a filter object
        const filterProps = ['kinds', 'authors', 'ids', 'since', 'until', 'limit', '#e', '#p', '#a', '#d', '#t', 'search'];
        const hasFilterProp = filterProps.some(prop => prop in rawConfig);

        if (hasFilterProp) {
            return { filters: rawConfig as NDKFilter } as MetaSubscribeConfig;
        }

        return rawConfig;
    });

    // Extract filters
    const derivedFilters = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg?.filters) return [];
        return Array.isArray(cfg.filters) ? cfg.filters : [cfg.filters];
    });

    // Extract NDK subscription options
    const derivedNdkOpts = $derived.by(() => {
        const cfg = derivedConfig;
        if (!cfg) return {};

        const { filters, sort, ...ndkOpts } = cfg;
        return ndkOpts as NDKSubscriptionOptions;
    });

    // Extract sort option
    const derivedSort = $derived.by(() => {
        const cfg = derivedConfig;
        return cfg && 'sort' in cfg ? (cfg.sort ?? 'time') : 'time';
    });

    // Restart subscription when filters or NDK options change
    $effect(() => {
        const newFilters = derivedFilters;
        const newNdkOpts = derivedNdkOpts;

        if (newFilters.length === 0) {
            stop();
            return;
        }

        const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(newFilters);
        const optsChanged = JSON.stringify(currentNdkOpts) !== JSON.stringify(newNdkOpts);

        if (filtersChanged || optsChanged || !subscription) {
            currentFilters = newFilters;
            currentNdkOpts = newNdkOpts;
            restart();
        }
    });

    // Re-sort when sort option changes (without restarting subscription)
    $effect(() => {
        const newSort = derivedSort;

        if (currentSort !== newSort && subscription) {
            currentSort = newSort;
            updateEvents();
        } else if (!subscription) {
            currentSort = newSort;
        }
    });

    /**
     * Extract e-tags and a-tags from pointer events and fetch all pointed-to events in batch
     */
    async function handlePointerEvents(pointerEvents: NDKEvent[]) {
        // Collect all references from all pointer events
        const allReferences = new Set<string>();
        const pointersByRef = new Map<string, NDKEvent[]>();

        for (const pointerEvent of pointerEvents) {
            // Get all e-tags and a-tags
            const eTags = pointerEvent.getMatchingTags("e");
            const aTags = pointerEvent.getMatchingTags("a");

            // Collect references
            for (const eTag of eTags) {
                if (eTag[1]) {
                    allReferences.add(eTag[1]);
                    const pointers = pointersByRef.get(eTag[1]) || [];
                    pointers.push(pointerEvent);
                    pointersByRef.set(eTag[1], pointers);
                }
            }

            for (const aTag of aTags) {
                if (aTag[1]) {
                    allReferences.add(aTag[1]);
                    const pointers = pointersByRef.get(aTag[1]) || [];
                    pointers.push(pointerEvent);
                    pointersByRef.set(aTag[1], pointers);
                }
            }
        }

        if (allReferences.size === 0) {
            return;
        }

        // Build filters for fetching all referenced events
        const filters: NDKFilter[] = [];
        const ids: string[] = [];
        const addresses: string[] = [];

        for (const ref of allReferences) {
            // Check if it's a NIP-33 address (kind:pubkey:d-tag)
            if (ref.includes(':')) {
                addresses.push(ref);
            } else {
                ids.push(ref);
            }
        }

        if (ids.length > 0) {
            filters.push({ ids });
        }

        if (addresses.length > 0) {
            // Group addresses by author (pubkey)
            const byAuthor = new Map<string, { kinds: Set<number>; dTags: Set<string> }>();

            for (const addr of addresses) {
                const [kindStr, pubkey, dTag] = addr.split(':');
                const kind = parseInt(kindStr);
                if (!isNaN(kind) && pubkey && dTag) {
                    if (!byAuthor.has(pubkey)) {
                        byAuthor.set(pubkey, { kinds: new Set(), dTags: new Set() });
                    }
                    const entry = byAuthor.get(pubkey)!;
                    entry.kinds.add(kind);
                    entry.dTags.add(dTag);
                }
            }

            // Create one filter per author
            for (const [pubkey, { kinds, dTags }] of byAuthor) {
                filters.push({
                    kinds: Array.from(kinds),
                    authors: [pubkey],
                    "#d": Array.from(dTags)
                });
            }
        }

        // Fetch all referenced events in one go
        try {
            const events = await ndk.guardrailOff().fetchEvents(filters);

            // Match fetched events to their pointers
            for (const event of events) {
                const tagId = event.tagId();
                const pointers = pointersByRef.get(tagId);

                if (pointers) {
                    handleTargetEvent(event as T, pointers);
                }
            }

            updateEvents();
        } catch {
            // Silently ignore fetch errors
        }
    }

    /**
     * Single pointer event handler (for relay events)
     */
    async function handlePointerEvent(pointerEvent: NDKEvent) {
        await handlePointerEvents([pointerEvent]);
    }

    /**
     * Handle a pointed-to event and update the maps
     */
    function handleTargetEvent(targetEvent: T, pointers: NDKEvent[]) {
        const tagId = targetEvent.tagId();

        // Add or update the target event
        targetEventMap.set(tagId, targetEvent);

        // Track the pointers - dedupe by id
        const existingPointers = pointersByTarget.get(tagId) || [];
        const existingIds = new Set(existingPointers.map(p => p.id));
        const newPointers = pointers.filter(p => !existingIds.has(p.id));

        if (newPointers.length > 0) {
            pointersByTarget.set(tagId, [...existingPointers, ...newPointers]);
        }
    }

    /**
     * Update the reactive events array and pointedBy map based on current sort
     */
    function updateEvents() {
        let events = Array.from(targetEventMap.values());

        // Sort based on the current sort option
        switch (currentSort) {
            case 'time':
                // Sort by event creation time (newest first)
                events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
                break;

            case 'count':
                // Sort by number of pointers (most pointed-to first)
                events.sort((a, b) => {
                    const aCount = pointersByTarget.get(a.tagId())?.length || 0;
                    const bCount = pointersByTarget.get(b.tagId())?.length || 0;
                    return bCount - aCount;
                });
                break;

            case 'tag-time':
                // Sort by most recently tagged (newest pointer first)
                events.sort((a, b) => {
                    const aPointers = pointersByTarget.get(a.tagId()) || [];
                    const bPointers = pointersByTarget.get(b.tagId()) || [];
                    const aMaxTime = Math.max(...aPointers.map(p => p.created_at || 0), 0);
                    const bMaxTime = Math.max(...bPointers.map(p => p.created_at || 0), 0);
                    return bMaxTime - aMaxTime;
                });
                break;

            case 'unique-authors':
                // Sort by number of unique authors pointing to it (most diverse first)
                events.sort((a, b) => {
                    const aPointers = pointersByTarget.get(a.tagId()) || [];
                    const bPointers = pointersByTarget.get(b.tagId()) || [];
                    const aUniqueAuthors = new Set(aPointers.map(p => p.pubkey)).size;
                    const bUniqueAuthors = new Set(bPointers.map(p => p.pubkey)).size;
                    return bUniqueAuthors - aUniqueAuthors;
                });
                break;
        }

        _events = events;
        _pointedBy = new Map(pointersByTarget);
    }

    function start() {
        if (subscription) return;

        subscription = ndk.subscribe(currentFilters, {
            ...currentNdkOpts,
            closeOnEose: false,
            onEvents: (cachedEvents) => {
                // Batch process cached pointer events
                handlePointerEvents(cachedEvents);
            },
            onEvent: (event) => {
                // Each event we receive is a "pointer" event
                // We need to extract its tags and fetch the pointed-to events
                handlePointerEvent(event);
            },
            onEose: () => {
                _eosed = true;
            },
        });
    }

    function stop() {
        subscription?.stop();
        subscription = undefined;
    }

    let isRestarting = false;

    function restart() {
        if (isRestarting) return;
        isRestarting = true;

        stop();
        targetEventMap.clear();
        pointersByTarget.clear();
        _events = [];
        _pointedBy = new Map();
        _eosed = false;
        start();

        queueMicrotask(() => {
            isRestarting = false;
        });
    }

    function clear() {
        targetEventMap.clear();
        pointersByTarget.clear();
        _events = [];
        _pointedBy = new Map();
        _eosed = false;
    }

    return {
        get events() {
            return _events;
        },
        get count() {
            return _events.length;
        },
        get eosed() {
            return _eosed;
        },
        get pointedBy() {
            return _pointedBy;
        },
        eventsTagging(event: NDKEvent): NDKEvent[] {
            return _pointedBy.get(event.tagId()) || [];
        },
        start,
        stop,
        clear,
    };
}
