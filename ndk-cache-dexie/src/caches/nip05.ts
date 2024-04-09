import type { Table } from "dexie";
import type { CacheHandler } from "../lru-cache";
import type debug from "debug";
import type { Nip05 } from "../db";
import type { LRUCache } from "typescript-lru-cache";

type Nip05CacheEntry = {
    profile: string | null;
    fetchedAt: number;
};

export const nip05WarmUp = (
    nip05s: Table<Nip05>
): ((cacheHandler: CacheHandler<Nip05CacheEntry>, debug: debug.IDebugger) => Promise<void>) => {
    return async (
        cacheHandler: CacheHandler<Nip05CacheEntry>,
        debug: debug.IDebugger
    ): Promise<void> => {
        await nip05s.each((nip05) => {
            cacheHandler.set(
                nip05.nip05,
                { profile: nip05.profile, fetchedAt: nip05.fetchedAt },
                false
            );
        });

        // Optional: Log warm-up completion or cache size
        setTimeout(() => {
            debug(`Warmed up ${cacheHandler.size()} NIP-05 cache entries`);
        }, 2500);
    };
};

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
