import type { Table } from "dexie";
import type { CacheHandler } from "../lru-cache";
import type debug from "debug";
import type { LRUCache } from "typescript-lru-cache";
import { RelayStatus } from "../db";

export async function relayInfoWarmUp(
    cacheHandler: CacheHandler<RelayStatus>,
    relayStatus: Table<RelayStatus>,
) {
    await relayStatus.each((entry) => {
        cacheHandler.set(entry.url, {
            url: entry.url,
            updatedAt: entry.updatedAt,
            lastConnectedAt: entry.lastConnectedAt,
            dontConnectBefore: entry.dontConnectBefore,
        }, false);
    });
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
