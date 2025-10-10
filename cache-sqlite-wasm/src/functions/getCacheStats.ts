import type { NDKCacheAdapterSqliteWasm } from "../index";
import type { SQLDatabase } from "../types";

export interface CacheStats {
    eventsByKind: Record<number, number>;
    totalEvents: number;
    totalProfiles: number;
    totalEventTags: number;
    totalDecryptedEvents: number;
    totalUnpublishedEvents: number;
    cacheData: number;
    eventRelays: number;
}

export async function getCacheStats(this: NDKCacheAdapterSqliteWasm): Promise<CacheStats> {
    await this.ensureInitialized();

    if (this.useWorker) {
        return this.postWorkerMessage<CacheStats>({
            type: "getCacheStats",
        });
    }

    if (!this.db) {
        throw new Error("Database not initialized");
    }

    return getCacheStatsSync(this.db);
}

export function getCacheStatsSync(db: SQLDatabase): CacheStats {
    // Get events grouped by kind
    const eventsByKindResult = db.exec(`
        SELECT kind, COUNT(*) as count
        FROM events
        WHERE deleted = 0
        GROUP BY kind
        ORDER BY kind
    `);

    const eventsByKind: Record<number, number> = {};
    if (eventsByKindResult[0]) {
        for (const row of eventsByKindResult[0].values) {
            eventsByKind[row[0] as number] = row[1] as number;
        }
    }

    // Get total counts for each table
    const totalEventsResult = db.exec(`SELECT COUNT(*) FROM events WHERE deleted = 0`);
    const totalProfilesResult = db.exec(`SELECT COUNT(*) FROM profiles`);
    const totalEventTagsResult = db.exec(`SELECT COUNT(*) FROM event_tags`);
    const totalDecryptedEventsResult = db.exec(`SELECT COUNT(*) FROM decrypted_events`);
    const totalUnpublishedEventsResult = db.exec(`SELECT COUNT(*) FROM unpublished_events`);
    const cacheDataResult = db.exec(`SELECT COUNT(*) FROM cache_data`);
    const eventRelaysResult = db.exec(`SELECT COUNT(*) FROM event_relays`);

    return {
        eventsByKind,
        totalEvents: (totalEventsResult[0]?.values[0]?.[0] as number) || 0,
        totalProfiles: (totalProfilesResult[0]?.values[0]?.[0] as number) || 0,
        totalEventTags: (totalEventTagsResult[0]?.values[0]?.[0] as number) || 0,
        totalDecryptedEvents: (totalDecryptedEventsResult[0]?.values[0]?.[0] as number) || 0,
        totalUnpublishedEvents: (totalUnpublishedEventsResult[0]?.values[0]?.[0] as number) || 0,
        cacheData: (cacheDataResult[0]?.values[0]?.[0] as number) || 0,
        eventRelays: (eventRelaysResult[0]?.values[0]?.[0] as number) || 0,
    };
}
