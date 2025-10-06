import type { Table } from "dexie";
import type { LRUCache } from "typescript-lru-cache";
import type { Profile } from "../db";
import type { CacheHandler } from "../lru-cache";

export { db } from "../db.js";

import createDebug from "debug";

const d = createDebug("ndk:dexie-adapter:profiles");

export async function profilesWarmUp(cacheHandler: CacheHandler<Profile>, profiles: Table<Profile>): Promise<void> {
    const array = await profiles.limit(cacheHandler.maxSize).toArray();
    for (const user of array) {
        const obj = user;
        cacheHandler.set(user.pubkey, obj, false);
    }

    d("Loaded %d profiles from database", cacheHandler.size());
}

export const profilesDump = (profiles: Table<Profile>, debug: debug.IDebugger) => {
    return async (dirtyKeys: Set<string>, cache: LRUCache<string, Profile>) => {
        const entries = [];

        for (const pubkey of dirtyKeys) {
            const entry = cache.get(pubkey);
            if (entry) {
                entries.push(entry);
            }
        }

        if (entries.length) {
            debug(`Saving ${entries.length} users to database`);

            await profiles.bulkPut(entries);
        }

        dirtyKeys.clear();
    };
};
