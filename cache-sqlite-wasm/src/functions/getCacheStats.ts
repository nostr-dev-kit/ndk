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

    return this.postWorkerMessage<CacheStats>({
        type: "getCacheStats",
    });
}
