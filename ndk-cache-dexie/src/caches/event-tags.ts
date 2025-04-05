import type debug from "debug";
import type { Table } from "dexie";
import type { LRUCache } from "typescript-lru-cache";
import type { EventTag } from "../db";
import type { CacheHandler } from "../lru-cache";

export type EventTagCacheEntry = string;

export async function eventTagsWarmUp(cacheHandler: CacheHandler<EventTagCacheEntry>, eventTags: Table<EventTag>) {
    const array = await eventTags.limit(cacheHandler.maxSize).toArray();
    for (const event of array) {
        cacheHandler.add(event.tagValue, event.eventId, false);
    }
}

export const eventTagsDump = (eventTags: Table<EventTag>, debug: debug.IDebugger) => {
    return async (dirtyKeys: Set<string>, cache: LRUCache<string, EventTagCacheEntry>) => {
        const entries = [];

        for (const tagValue of dirtyKeys) {
            const eventIds = cache.get(tagValue);
            if (eventIds) {
                for (const eventId of eventIds) entries.push({ tagValue, eventId });
            }
        }

        if (entries.length > 0) {
            debug(`Saving ${entries.length} events cache entries to database`);
            await eventTags.bulkPut(entries);
        }

        dirtyKeys.clear();
    };
};
