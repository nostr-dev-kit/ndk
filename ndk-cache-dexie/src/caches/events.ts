import type { Table } from "dexie";
import type { CacheHandler } from "../lru-cache";
import type debug from "debug";
import type { Event } from "../db";
import type { LRUCache } from "typescript-lru-cache";

export type EventCacheEntry = Event;

export async function eventsWarmUp(
    cacheHandler: CacheHandler<EventCacheEntry>,
    events: Table<Event>
) {
    const array = await events.limit(cacheHandler.maxSize).toArray();
    for (const event of array) {
        cacheHandler.set(event.id, event, false);
    }
}

export const eventsDump = (events: Table<Event>, debug: debug.IDebugger) => {
    return async (dirtyKeys: Set<string>, cache: LRUCache<string, EventCacheEntry>) => {
        const entries: EventCacheEntry[] = [];

        for (const event of dirtyKeys) {
            const entry = cache.get(event);
            if (entry) entries.push(entry);
        }

        if (entries.length > 0) {
            debug(`Saving ${entries.length} events cache entries to database`);
            await events.bulkPut(entries);
        }

        dirtyKeys.clear();
    };
};
