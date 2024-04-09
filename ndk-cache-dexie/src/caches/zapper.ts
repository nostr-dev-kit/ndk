import { Table } from "dexie";
import { CacheHandler } from "../lru-cache";
import debug from "debug";
import type { Lnurl } from "../db";
import { LRUCache } from "typescript-lru-cache";

type ZapperCacheEntry = {
    document: string | null;
    fetchedAt: number;
};

export const zapperWarmUp = (
    lnurls: Table<Lnurl>
): ((cacheHandler: CacheHandler<ZapperCacheEntry>, debug: debug.IDebugger) => Promise<void>) => {
    return async (
        cacheHandler: CacheHandler<ZapperCacheEntry>,
        debug: debug.IDebugger
    ): Promise<void> => {
        await lnurls.each((lnurl) => {
            cacheHandler.set(
                lnurl.pubkey,
                { document: lnurl.document, fetchedAt: lnurl.fetchedAt },
                false
            );
        });

        // Optional: Log warm-up completion or cache size
        setTimeout(() => {
            debug(`Warmed up ${cacheHandler.size()} zapper cache entries`);
        }, 2500);
    };
};

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
