import type debug from "debug";
import type { Table } from "dexie";
import type { LRUCache } from "typescript-lru-cache";
import type { Nip05 } from "../db";
import type { CacheHandler } from "../lru-cache";

export type Nip05CacheEntry = {
    profile: string | null;
    fetchedAt: number;
};

export async function nip05WarmUp(cacheHandler: CacheHandler<Nip05CacheEntry>, nip05s: Table<Nip05>) {
    const array = await nip05s.limit(cacheHandler.maxSize).toArray();
    for (const nip05 of array) {
        cacheHandler.set(nip05.nip05, nip05, false);
    }
}

export const nip05Dump = (nip05s: Table<Nip05>, debug: debug.IDebugger) => {
    return async (dirtyKeys: Set<string>, cache: LRUCache<string, Nip05CacheEntry>) => {
        const entries = [];

        for (const nip05 of dirtyKeys) {
            const entry = cache.get(nip05);
            if (entry) {
                entries.push({
                    nip05,
                    ...entry,
                });
            }
        }

        if (entries.length) {
            debug(`Saving ${entries.length} NIP-05 cache entries to database`);
            await nip05s.bulkPut(entries);
        }

        dirtyKeys.clear();
    };
};
