import { NDKRelaySet, type NDKFilter, type NDKRelay, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { NDKSync, type NegotiationProgress } from "@nostr-dev-kit/sync";
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { getContext } from 'svelte';

export interface NegentropySyncConfig {
    filters: NDKFilter | NDKFilter[];
    relayUrls?: string[];
}

export interface RelayNegotiationState {
    phase: string;
    round: number;
    needCount: number;
    haveCount: number;
    lastUpdate: number;
}

export interface RelayProgress {
    url: string;
    status: 'pending' | 'syncing' | 'completed' | 'error';
    eventCount: number;
    error?: string;
    negotiation?: RelayNegotiationState;
}

/**
 * Creates a reactive Negentropy sync state manager
 *
 * Tracks sync progress across multiple relays with detailed negotiation visibility,
 * providing real-time updates on sync status, relay progress, event counts, velocity,
 * ETA, and per-relay negotiation details including round numbers and phase.
 *
 * @param config - Function returning configuration with filters and optional relay URLs
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with comprehensive sync state and control functions
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
 *   <div>Progress: {sync.progress}% | Velocity: {sync.velocity} events/s</div>
 *   {#if sync.estimatedTimeRemaining !== null}
 *     <div>ETA: {sync.estimatedTimeRemaining}s</div>
 *   {/if}
 *   {#if sync.syncing}
 *     <div>Syncing {sync.completedRelays}/{sync.totalRelays} relays</div>
 *     {#each sync.relays as relay}
 *       <div>
 *         {relay.url}: {relay.status}
 *         {#if relay.negotiation}
 *           (Round {relay.negotiation.round} - {relay.negotiation.phase})
 *         {/if}
 *       </div>
 *     {/each}
 *   {/if}
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
        subscription: null as NDKSubscription | null,
        syncStartTime: 0,
        eventsAtStart: 0
    });

    const progress = $derived(
        state.totalRelays > 0
            ? Math.round((state.completedRelays / state.totalRelays) * 100)
            : 0
    );

    const relays = $derived(Array.from(state.relayProgress.values()));

    const velocity = $derived(() => {
        if (!state.syncing || state.syncStartTime === 0) return 0;
        const elapsed = (Date.now() - state.syncStartTime) / 1000; // seconds
        if (elapsed === 0) return 0;
        const eventsSynced = state.totalEvents - state.eventsAtStart;
        return Math.round(eventsSynced / elapsed);
    });

    const estimatedTimeRemaining = $derived(() => {
        if (!state.syncing || velocity() === 0) return null;
        const relaysRemaining = state.totalRelays - state.completedRelays;
        if (relaysRemaining === 0) return 0;

        // Estimate based on average time per relay so far
        const elapsed = (Date.now() - state.syncStartTime) / 1000;
        const avgTimePerRelay = state.completedRelays > 0
            ? elapsed / state.completedRelays
            : 0;

        return Math.round(avgTimePerRelay * relaysRemaining);
    });

    const activeNegotiations = $derived(
        Array.from(state.relayProgress.values())
            .filter(r => r.status === 'syncing' && r.negotiation)
    );

    async function startSync(): Promise<NDKSubscription> {
        const { filters, relayUrls } = config();
        const sync = new NDKSync(resolvedNDK);

        // Reset state
        state.syncing = true;
        state.completedRelays = 0;
        state.totalEvents = 0;
        state.relayProgress.clear();
        state.errors.clear();
        state.syncStartTime = Date.now();
        state.eventsAtStart = 0;

        // Determine relays to sync
        let relaySet;
        if (relayUrls) {
            relaySet = NDKRelaySet.fromRelayUrls(relayUrls, resolvedNDK);
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
            onNegotiationProgress: (relay: NDKRelay, progress: NegotiationProgress) => {
                const relayProgress = state.relayProgress.get(relay.url);
                if (relayProgress) {
                    relayProgress.status = 'syncing';
                    relayProgress.negotiation = {
                        phase: progress.phase,
                        round: progress.round,
                        needCount: progress.needCount,
                        haveCount: progress.haveCount,
                        lastUpdate: progress.timestamp
                    };
                    state.relayProgress.set(relay.url, relayProgress);
                }
            },
            onRelaySynced: (relay: NDKRelay, eventCount: number) => {
                const progress = state.relayProgress.get(relay.url);
                if (progress) {
                    progress.status = 'completed';
                    progress.eventCount = eventCount;
                    progress.negotiation = undefined; // Clear negotiation state
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
                    progress.negotiation = undefined; // Clear negotiation state
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
        get velocity() {
            return velocity();
        },
        get estimatedTimeRemaining() {
            return estimatedTimeRemaining();
        },
        get activeNegotiations() {
            return activeNegotiations;
        },
        startSync,
        stopSync
    };
}
