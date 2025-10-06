import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import {
    NDKWoT,
    type WoTFilterOptions as NDKWoTFilterOptions,
    type WoTRankOptions as NDKWoTRankOptions,
    rankByWoT,
    type WoTBuildOptions,
} from "@nostr-dev-kit/wot";
import type { ReactiveSessionsStore } from "./sessions.svelte.js";

export interface WoTLoadOptions {
    /** Maximum depth to traverse (hops from root user) */
    maxDepth?: number;
    /** Maximum number of follows to process per user */
    maxFollows?: number;
    /** Timeout for building the graph in ms */
    timeout?: number;
}

export type WoTFilterOptions = NDKWoTFilterOptions;
export type WoTRankOptions = NDKWoTRankOptions;

/**
 * Reactive wrapper around NDK WoT (Web of Trust)
 *
 * Provides Svelte 5 reactive access to WoT data and filtering
 */
export class ReactiveWoTStore {
    #ndk: NDK;
    #sessions: ReactiveSessionsStore;
    #wot: NDKWoT | null = null;

    loaded = $state(false);
    autoFilterEnabled = $state(false);
    #autoFilterOptions = $state<WoTFilterOptions | undefined>(undefined);

    constructor(ndk: NDK, sessions: ReactiveSessionsStore) {
        this.#ndk = ndk;
        this.#sessions = sessions;
    }

    /**
     * Load WoT data for the current user
     */
    async load(options: WoTLoadOptions = {}): Promise<void> {
        const currentPubkey = this.#sessions.currentUser?.pubkey;
        if (!currentPubkey) {
            throw new Error("Cannot load WoT: no user logged in");
        }

        this.#wot = new NDKWoT(this.#ndk, currentPubkey);

        const buildOptions: WoTBuildOptions = {
            depth: options.maxDepth || 3,
            maxFollows: options.maxFollows,
            timeout: options.timeout,
        };

        await this.#wot.load(buildOptions);
        this.loaded = true;
    }

    /**
     * Enable automatic filtering on subscriptions
     */
    enableAutoFilter(options?: WoTFilterOptions): void {
        this.autoFilterEnabled = true;
        this.#autoFilterOptions = options;
    }

    /**
     * Disable automatic filtering
     */
    disableAutoFilter(): void {
        this.autoFilterEnabled = false;
        this.#autoFilterOptions = undefined;
    }

    /**
     * Get WoT score for a pubkey (0-1, higher = closer)
     */
    getScore(pubkey: string): number {
        if (!this.#wot) return 0;
        return this.#wot.getScore(pubkey);
    }

    /**
     * Get WoT distance (depth/hops) for a pubkey
     */
    getDistance(pubkey: string): number | null {
        if (!this.#wot) return null;
        return this.#wot.getDistance(pubkey);
    }

    /**
     * Check if pubkey is in WoT
     */
    includes(pubkey: string, options?: { maxDepth?: number }): boolean {
        if (!this.#wot) return false;
        return this.#wot.includes(pubkey, options);
    }

    /**
     * Check if an event should be filtered based on WoT
     */
    shouldFilterEvent(event: NDKEvent): boolean {
        if (!this.#wot || !this.autoFilterEnabled) return false;

        const { maxDepth, minScore, includeUnknown = false } = this.#autoFilterOptions || {};

        const inWoT = this.includes(event.pubkey, { maxDepth });
        if (!inWoT) {
            return !includeUnknown; // Filter if not in WoT and not including unknown
        }

        if (minScore !== undefined) {
            const score = this.getScore(event.pubkey);
            return score < minScore; // Filter if score too low
        }

        return false; // Don't filter
    }

    /**
     * Rank events by WoT
     */
    rankEvents<T extends NDKEvent>(events: T[], options?: WoTRankOptions): T[] {
        if (!this.#wot) return events;
        return rankByWoT(this.#wot, events as NDKEvent[], options) as T[];
    }
}

export function createReactiveWoT(ndk: NDK, sessions: ReactiveSessionsStore): ReactiveWoTStore {
    return new ReactiveWoTStore(ndk, sessions);
}

export type { ReactiveWoTStore, WoTFilterOptions, WoTRankOptions, WoTLoadOptions };
