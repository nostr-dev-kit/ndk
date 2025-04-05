import type debug from "debug";
import type { Table } from "dexie";
import type { LRUCache } from "typescript-lru-cache";
import type { RelayStatus } from "../db";
import type { CacheHandler } from "../lru-cache";

export async function relayInfoWarmUp(cacheHandler: CacheHandler<RelayStatus>, relayStatus: Table<RelayStatus>) {
    const array = await relayStatus.limit(cacheHandler.maxSize).toArray();
    for (const entry of array) {
        cacheHandler.set(
            entry.url,
            {
                url: entry.url,
                updatedAt: entry.updatedAt,
                lastConnectedAt: entry.lastConnectedAt,
                dontConnectBefore: entry.dontConnectBefore,
            },
            false,
        );
    }
}

export const relayInfoDump = (relayStatus: Table<RelayStatus>, debug: debug.IDebugger) => {
    return async (dirtyKeys: Set<string>, cache: LRUCache<string, RelayStatus>) => {
        const entries = [];

        for (const url of dirtyKeys) {
            const info = cache.get(url);
            if (info) {
                entries.push({
                    url,
                    updatedAt: info.updatedAt,
                    lastConnectedAt: info.lastConnectedAt,
                    dontConnectBefore: info.dontConnectBefore,
                });
            }
        }

        if (entries.length > 0) {
            debug(`Saving ${entries.length} relay status cache entries to database`);
            await relayStatus.bulkPut(entries);
        }

        dirtyKeys.clear();
    };
};
