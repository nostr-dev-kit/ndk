import type { NDKCacheAdapterSqliteWasm } from "../index";

export interface CacheStats {
    eventsByKind: Record<number, number>;
    totalEvents: number;
    totalProfiles: number;
    totalEventTags: number;
    totalDecryptedEvents: number;
    totalUnpublishedEvents: number;
    cacheData: number;
}

/**
 * Retrieves cache statistics from the SQLite WASM database via worker.
 */
export async function getCacheStats(this: NDKCacheAdapterSqliteWasm): Promise<CacheStats> {
    await this.ensureInitialized();

    // If in degraded mode, return empty stats
    if (this.degradedMode) {
        return {
            eventsByKind: {},
            totalEvents: 0,
            totalProfiles: 0,
            totalEventTags: 0,
            totalDecryptedEvents: 0,
            totalUnpublishedEvents: 0,
            cacheData: 0,
        };
    }

    return this.postWorkerMessage<CacheStats>({
        type: "getCacheStats",
    });
}
