import type { Table } from "dexie";
import type { User } from "../db";
import type { CacheHandler, WarmUpFunction } from "../lru-cache";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { LRUCache } from "typescript-lru-cache";
export { db } from "../db.js";

export function profilesWarmUp(users: Table<User>): WarmUpFunction<NDKUserProfile> {
    return async (
        cacheHandler: CacheHandler<NDKUserProfile>,
        debug: debug.IDebugger
    ): Promise<void> => {
        users.each((user) => {
            cacheHandler.set(user.pubkey, user.profile, false);
        });

        // hack
        setTimeout(() => {
            debug(`Warmed up ${cacheHandler.size()} profiles`);
        }, 2500);
    };
}

export const profilesDump = (users: Table<User>, debug: debug.IDebugger) => {
    return async (dirtyKeys: Set<string>, cache: LRUCache<string, NDKUserProfile>) => {
        const profiles = [];

        for (const pubkey of dirtyKeys) {
            const profile = cache.get(pubkey);
            if (profile) {
                profiles.push({
                    pubkey,
                    profile,
                    createdAt: Date.now(),
                });
            }
        }

        if (profiles.length) {
            debug(`Saving ${profiles.length} profiles to database`);
            await users.bulkPut(profiles);
        }

        dirtyKeys.clear();
    };
};
