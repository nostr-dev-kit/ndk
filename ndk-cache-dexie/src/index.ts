import type {
    Hexpubkey,
    NDKCacheAdapter,
    NDKFilter,
    NDKSubscription,
    NDKUserProfile,
} from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKRelay, profileFromEvent } from "@nostr-dev-kit/ndk";
import createDebug from "debug";
import { Event, matchFilters } from "nostr-tools";
import { LRUCache } from "typescript-lru-cache";

import { createDatabase, db } from "./db";

export { db } from "./db";

interface NDKCacheAdapterDexieOptions {
    /**
     * The name of the database to use
     */
    dbName?: string;

    /**
     * Debug instance to use for logging
     */
    debug?: debug.IDebugger;

    /**
     * The number of seconds to store events in Dexie (IndexedDB) before they expire
     * Defaults to 3600 seconds (1 hour)
     */
    expirationTime?: number;

    /**
     * Number of profiles to keep in an LRU cache
     */
    profileCacheSize?: number | "disabled";
}

export default class NDKCacheAdapterDexie implements NDKCacheAdapter {
    public debug: debug.Debugger;
    private expirationTime;
    readonly locking;
    public profiles?: LRUCache<Hexpubkey, NDKUserProfile>;
    public dirtyProfiles: Set<Hexpubkey> = new Set();

    constructor(opts: NDKCacheAdapterDexieOptions = {}) {
        createDatabase(opts.dbName || "ndk");
        this.debug = opts.debug || createDebug("ndk:dexie-adapter");
        this.locking = true;
        this.expirationTime = opts.expirationTime || 3600;

        if (opts.profileCacheSize !== "disabled") {
            this.profiles = new LRUCache({
                maxSize: opts.profileCacheSize || 100000,
            });

            setInterval(() => {
                this.dumpProfiles();
            }, 1000 * 10);

            this.warmUpProfilesLRU();
        }
    }

    private async warmUpProfilesLRU() {
        if (!this.profiles) return;

        db.users.each((user) => {
            this.profiles!.set(user.pubkey, user.profile);
        });
    }

    public async query(subscription: NDKSubscription): Promise<void> {
        const events = await db.events.toArray();

        for (const event of events) {
            let rawEvent;

            try {
                rawEvent = JSON.parse(event.event) as Event;
            } catch (e) {
                console.log("failed to parse event", e);
                continue;
            }

            if (matchFilters(subscription.filters, rawEvent) == false) continue;

            const ndkEvent = new NDKEvent(undefined, rawEvent);
            const relay = event.relay ? new NDKRelay(event.relay) : undefined;
            subscription.eventReceived(ndkEvent, relay, true);
        }
    }

    public async fetchProfile(pubkey: Hexpubkey) {
        if (!this.profiles) return null;

        let profile = this.profiles.get(pubkey);

        if (!profile) {
            const user = await db.users.get({ pubkey });
            if (user) {
                profile = user.profile;
                this.profiles.set(pubkey, profile);
            }
        }

        return profile;
    }

    public saveProfile(pubkey: Hexpubkey, profile: NDKUserProfile) {
        if (!this.profiles) return;

        this.profiles.set(pubkey, profile);

        this.dirtyProfiles.add(pubkey);
    }

    public async setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void> {
        if (event.kind === 0) {
            if (!this.profiles) return;

            try {
                const profile: NDKUserProfile = profileFromEvent(event);
                this.saveProfile(event.pubkey, profile);
            } catch {}
        } else {
            let addEvent = true;

            if (event.isParamReplaceable()) {
                const replaceableId = `${event.kind}:${event.pubkey}:${event.tagId()}`;
                const existingEvent = await db.events.where({ id: replaceableId }).first();
                if (
                    existingEvent &&
                    event.created_at &&
                    existingEvent.createdAt > event.created_at
                ) {
                    addEvent = false;
                }
            }

            if (addEvent) {
                db.events.put({
                    id: event.tagId(),
                    pubkey: event.pubkey,
                    content: event.content,
                    kind: event.kind!,
                    createdAt: event.created_at!,
                    relay: relay?.url,
                    event: JSON.stringify(event.rawEvent()),
                });

                // Don't cache contact lists as tags since it's expensive
                // and there is no use case for it
                if (event.kind !== 3) {
                    event.tags.forEach((tag) => {
                        if (tag[0].length !== 1) return;

                        db.eventTags.put({
                            id: `${event.id}:${tag[0]}:${tag[1]}`,
                            eventId: event.id,
                            tag: tag[0],
                            value: tag[1],
                            tagValue: tag[0] + tag[1],
                        });
                    });
                }
            }
        }
    }

    private async dumpProfiles(): Promise<void> {
        const profiles = [];

        if (!this.profiles) return;

        for (const pubkey of this.dirtyProfiles) {
            const profile = this.profiles.get(pubkey);

            if (!profile) continue;

            profiles.push({
                pubkey,
                profile,
                createdAt: Date.now(),
            });
        }

        if (profiles.length) {
            this.debug(`Saving ${profiles.length} profiles to database`);
            await db.users.bulkPut(profiles);
        }

        this.dirtyProfiles.clear();
    }
}
