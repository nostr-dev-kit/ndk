import type { NDKFilter, NDKRelay, NDKSubscription } from "@nostr-dev-kit/ndk";
import { NDKSync } from "@nostr-dev-kit/sync";
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { getContext } from 'svelte';

export interface NegentropySyncConfig {
    filters: NDKFilter | NDKFilter[];
    relayUrls?: string[];
}

export interface RelayProgress {
    url: string;
    status: 'pending' | 'syncing' | 'completed' | 'error';
    eventCount: number;
    error?: string;
}

/**
 * Creates a reactive Negentropy sync state manager
 *
 * Tracks sync progress across multiple relays, providing real-time updates
 * on sync status, relay progress, event counts, and errors.
 *
 * @param config - Function returning configuration with filters and optional relay URLs
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with sync state and startSync function
 *
 * @example
 * ```svelte
 * <script>
 *   const sync = createNegentropySync(() => ({
 *     filters: { kinds: [1], limit: 100 }
 *   }));
 *
 *   async function handleSync() {
 *     await sync.startSync();
 *   }
 * </script>
 *
 * <div>
 *   Progress: {sync.progress}%
 *   {#if sync.syncing}Syncing {sync.completedRelays}/{sync.totalRelays} relays{/if}
 * </div>
 * ```
 */
export function createNegentropySync(
    config: () => NegentropySyncConfig,
    ndk?: NDKSvelte
) {
    const resolvedNDK = ndk || getContext<NDKSvelte>('ndk');

    const state = $state({
        syncing: false,
        totalRelays: 0,
        completedRelays: 0,
        totalEvents: 0,
        relayProgress: new Map<string, RelayProgress>(),
        errors: new Map<string, Error>(),
        subscription: null as NDKSubscription | null
    });

    const progress = $derived(
        state.totalRelays > 0
            ? Math.round((state.completedRelays / state.totalRelays) * 100)
            : 0
    );

    const relays = $derived(Array.from(state.relayProgress.values()));

    async function startSync(): Promise<NDKSubscription> {
        const { filters, relayUrls } = config();
        const sync = new NDKSync(resolvedNDK);

        // Reset state
        state.syncing = true;
        state.completedRelays = 0;
        state.totalEvents = 0;
        state.relayProgress.clear();
        state.errors.clear();

        // Determine relays to sync
        let relaySet;
        if (relayUrls) {
            await resolvedNDK.pool.ensureRelay(relayUrls[0]);
            const relays = relayUrls.map(url => resolvedNDK.pool.relays.get(url)!).filter(Boolean);
            const { NDKRelaySet } = await import("@nostr-dev-kit/ndk");
            relaySet = new NDKRelaySet(new Set(relays), resolvedNDK);
        }

        const allRelays = relaySet
            ? Array.from(relaySet.relays)
            : Array.from(resolvedNDK.pool?.relays?.values() || []);

        state.totalRelays = allRelays.length;

        // Initialize relay progress
        for (const relay of allRelays) {
            state.relayProgress.set(relay.url, {
                url: relay.url,
                status: 'pending',
                eventCount: 0
            });
        }

        // Start sync and subscribe
        const subscription = await sync.syncAndSubscribe(filters, {
            relaySet,
            onRelaySynced: (relay: NDKRelay, eventCount: number) => {
                const progress = state.relayProgress.get(relay.url);
                if (progress) {
                    progress.status = 'completed';
                    progress.eventCount = eventCount;
                    state.relayProgress.set(relay.url, progress);
                }
                state.completedRelays++;
                state.totalEvents += eventCount;
            },
            onRelayError: (relay: NDKRelay, error: Error) => {
                const progress = state.relayProgress.get(relay.url);
                if (progress) {
                    progress.status = 'error';
                    progress.error = error.message;
                    state.relayProgress.set(relay.url, progress);
                }
                state.errors.set(relay.url, error);
                state.completedRelays++;
            },
            onSyncComplete: () => {
                state.syncing = false;
            }
        });

        state.subscription = subscription;
        return subscription;
    }

    function stopSync(): void {
        if (state.subscription) {
            state.subscription.stop();
            state.subscription = null;
        }
        state.syncing = false;
    }

    return {
        get syncing() {
            return state.syncing;
        },
        get totalRelays() {
            return state.totalRelays;
        },
        get completedRelays() {
            return state.completedRelays;
        },
        get totalEvents() {
            return state.totalEvents;
        },
        get progress() {
            return progress;
        },
        get relays() {
            return relays;
        },
        get errors() {
            return state.errors;
        },
        get subscription() {
            return state.subscription;
        },
        startSync,
        stopSync
    };
}
