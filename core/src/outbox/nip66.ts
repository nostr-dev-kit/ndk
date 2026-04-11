import createDebug from "debug";
import type { NDK } from "../ndk/index.js";
import { normalizeRelayUrl } from "../utils/normalize-url.js";

const d = createDebug("ndk:nip66");

export interface NIP66Options {
    /** Relay URLs to fetch NIP-66 monitor data from */
    monitorRelays: string[];
    /** Maximum age of cached monitor data in ms. Default: 14400000 (4 hours) */
    maxAge?: number;
    /** Minimum alive relay count to trust the data. Default: 100 */
    minAliveThreshold?: number;
}

/**
 * NIP-66 relay liveness filter.
 *
 * Fetches relay monitor data (kind 30166) and filters dead relays
 * from candidate sets before outbox relay selection.
 *
 * **Graceful degradation (P7):**
 * - If alive set has <minAliveThreshold relays, filtering is skipped (pass-through)
 * - If data is older than maxAge, filtering is skipped
 * - If refresh() fails, stale data is kept; if no data at all, pass-through
 * - .onion relays always pass through (monitors can't reach them)
 */
export class NIP66LivenessFilter {
    private aliveRelays = new Set<string>();
    private fetchedAt = 0;
    private refreshPromise: Promise<void> | null = null;
    private readonly maxAge: number;
    private readonly minAliveThreshold: number;

    constructor(
        private ndk: NDK,
        private options: NIP66Options,
    ) {
        this.maxAge = options.maxAge ?? 14_400_000; // 4 hours
        this.minAliveThreshold = options.minAliveThreshold ?? 100;
    }

    /**
     * Fetch/refresh monitor data (kind 30166 events).
     * Safe to call frequently — skips if data is still fresh.
     */
    async refresh(): Promise<void> {
        // Skip if data is fresh
        if (this.fetchedAt > 0 && Date.now() - this.fetchedAt < this.maxAge) {
            return;
        }

        // Deduplicate concurrent refresh calls
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = this._doRefresh();
        try {
            await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }

    private async _doRefresh(): Promise<void> {
        try {
            const events = await this.ndk.fetchEvents(
                { kinds: [30166 as any] },
                {
                    closeOnEose: true,
                    groupable: false,
                    relayUrls: this.options.monitorRelays,
                },
            );

            const alive = new Set<string>();
            for (const event of events) {
                // kind 30166: the "d" tag contains the relay URL
                const dTag = event.tags.find((t) => t[0] === "d");
                if (dTag?.[1]) {
                    try {
                        alive.add(normalizeRelayUrl(dTag[1]));
                    } catch {
                        // skip malformed URLs
                    }
                }
            }

            if (alive.size > 0) {
                this.aliveRelays = alive;
                this.fetchedAt = Date.now();
                d("Refreshed NIP-66 data: %d alive relays", alive.size);
            } else {
                d("NIP-66 refresh returned 0 relays, keeping stale data");
            }
        } catch (err) {
            d("NIP-66 refresh failed: %O", err);
            // Keep stale data; if no data at all, pass-through in filterAlive()
        }
    }

    /**
     * Whether the current data is considered valid for filtering.
     */
    private isDataValid(): boolean {
        if (this.aliveRelays.size < this.minAliveThreshold) return false;
        if (this.fetchedAt === 0) return false;
        if (Date.now() - this.fetchedAt > this.maxAge) return false;
        return true;
    }

    /**
     * Filter a set of relay URLs, removing dead relays.
     *
     * Returns input unchanged if data is stale/insufficient (P7 graceful degradation).
     * .onion relays always pass through.
     */
    filterAlive(relayUrls: Iterable<string>): Set<string> {
        const input = new Set(relayUrls);

        if (!this.isDataValid()) {
            return input;
        }

        const result = new Set<string>();
        for (const url of input) {
            // .onion relays always pass through — monitors can't reach them
            if (url.includes(".onion")) {
                result.add(url);
                continue;
            }
            if (this.aliveRelays.has(url)) {
                result.add(url);
            }
        }

        return result;
    }
}
