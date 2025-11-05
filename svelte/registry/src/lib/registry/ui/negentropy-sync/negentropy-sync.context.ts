import type { RelayProgress } from '../../builders/negentropy-sync/index.js';

/**
 * Context shared between NegentrogySync components
 */
export interface NegentropySyncContext {
    /** Whether sync is currently in progress */
    syncing: boolean;

    /** Total number of relays to sync */
    totalRelays: number;

    /** Number of relays that have completed syncing */
    completedRelays: number;

    /** Total number of events synced across all relays */
    totalEvents: number;

    /** Sync progress percentage (0-100) */
    progress: number;

    /** Individual relay progress information */
    relays: RelayProgress[];

    /** Map of relay URLs to errors */
    errors: Map<string, Error>;

    /** Events per second velocity (0 if not syncing or no data) */
    velocity: number;

    /** Estimated time remaining in seconds (null if not calculable) */
    estimatedTimeRemaining: number | null;

    /** List of relays currently in active negotiation */
    activeNegotiations: RelayProgress[];
}

export const NEGENTROPY_SYNC_CONTEXT_KEY = Symbol('negentropy-sync');
