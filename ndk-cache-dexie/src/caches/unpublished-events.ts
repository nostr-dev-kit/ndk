import { NDKEvent, NDKEventId, NDKRelay } from "@nostr-dev-kit/ndk";
import { UnpublishedEvent } from "../db";
import type debug from "debug";
import type { Table } from "dexie";
import { LRUCache } from "typescript-lru-cache";
import { CacheHandler } from "../lru-cache";
import NDKCacheAdapterDexie from "..";

/**
 * The threshold
 */
const WRITE_STATUS_THRESHOLD = 3;

export async function unpublishedEventsWarmUp(
    cacheHandler: CacheHandler<UnpublishedEvent>,
    unpublishedEvents: Table<UnpublishedEvent>
) {
    await unpublishedEvents.each((unpublishedEvent) => {
        cacheHandler.set(unpublishedEvent.event.id!, unpublishedEvent, false);
    })
}

export function unpublishedEventsDump(
    unpublishedEvents: Table<UnpublishedEvent>,
    debug: debug.IDebugger
) {
    return async (dirtyKeys: Set<string>, cache: LRUCache<NDKEventId, UnpublishedEvent>) => {
        const entries: UnpublishedEvent[] = [];

        for (const eventId of dirtyKeys) {
            const entry = cache.get(eventId);
            if (entry) {
                entries.push({...entry, id: entry.event.id! });
            }
        }

        if (entries.length > 0) {
            debug(`Saving ${entries.length} unpublished events cache entries to database`);
            await unpublishedEvents.bulkPut(entries);
        }

        dirtyKeys.clear();
    };
}

export function addUnpublishedEvent(this: NDKCacheAdapterDexie, event: NDKEvent, relays: WebSocket["url"][]): void {
    const r: UnpublishedEvent["relays"] = {};
    relays.forEach(url => r[url] = false);
    this.unpublishedEvents.set( event.id!, { event: event.rawEvent(), relays: r } )

    const onPublished = (relay: NDKRelay) => {
        const url = relay.url;

        const existingEntry = this.unpublishedEvents.get(event.id);

        if (!existingEntry) {
            event.off("publushed", onPublished);
            return;
        }

        existingEntry.relays[url] = true;
        this.unpublishedEvents.set(event.id, existingEntry);

        let successWrites = Object.values(existingEntry.relays).filter(v => v).length;
        let unsuccessWrites = Object.values(existingEntry.relays).length - successWrites;

        if (successWrites >= WRITE_STATUS_THRESHOLD || unsuccessWrites === 0) {
            // this.debug(`Removing ${event.id} from cache`, { successWrites, unsuccessWrites });
            this.unpublishedEvents.delete(event.id);
            event.off("published", onPublished);
        // } else {
            // this.debug(`Keeping ${event.id} in cache`, { successWrites, unsuccessWrites });
        }
    }

    event.on("published", onPublished);
}