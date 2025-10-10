import type debug from "debug";
import type { Table } from "dexie";
import type { LRUCache } from "typescript-lru-cache";
import type { Lnurl } from "../db";
import type { CacheHandler } from "../lru-cache";

export type ZapperCacheEntry = {
    document: string | null;
    fetchedAt: number;
};

export async function zapperWarmUp(cacheHandler: CacheHandler<ZapperCacheEntry>, lnurls: Table<Lnurl>) {
    const array = await lnurls.limit(cacheHandler.maxSize).toArray();
    for (const lnurl of array) {
        cacheHandler.set(lnurl.pubkey, { document: lnurl.document, fetchedAt: lnurl.fetchedAt }, false);
    }
}

export const zapperDump = (lnurls: Table<Lnurl>, debug: debug.IDebugger) => {
    return async (dirtyKeys: Set<string>, cache: LRUCache<string, ZapperCacheEntry>) => {
        const entries = [];

        for (const pubkey of dirtyKeys) {
            const entry = cache.get(pubkey);
            if (entry) {
                entries.push({
                    pubkey,
                    ...entry,
                });
            }
        }

        if (entries.length) {
            debug(`Saving ${entries.length} zapper cache entries to database`);
            await lnurls.bulkPut(entries);
        }

        dirtyKeys.clear();
    };
};
