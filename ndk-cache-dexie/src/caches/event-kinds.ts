import type { Table } from "dexie";
import type { CacheHandler } from "../lru-cache";
import type debug from "debug";
import type { EventKind } from "../db";
import type { LRUCache } from "typescript-lru-cache";

export type EventKindCacheEntry = string;

export async function eventKindsWarmUp(
    cacheHandler: CacheHandler<EventKindCacheEntry>,
    eventKinds: Table<EventKind>,
) {
    const array = await eventKinds.limit(cacheHandler.maxSize).toArray();
    for (const event of array) {
        cacheHandler.add(event.kind, event.eventId, false);
    }
}

export const eventKindsDump = (eventKinds: Table<EventKind>, debug: debug.IDebugger) => {
    return async (dirtyKeys: Set<string>, cache: LRUCache<string, EventKindCacheEntry>) => {
        const entries = [];

        for (const kind of dirtyKeys) {
            const eventIds = cache.get(kind);
            if (eventIds) {
                for (const eventId of eventIds)
                    entries.push({ kind, eventId });
            }
        }

        if (entries.length > 0) {
            debug(`Saving ${entries.length} events cache entries to database`);
            await eventKinds.bulkPut(entries);
        }

        dirtyKeys.clear();
    };
};
