import { NDKEvent, NDKRelay, deserialize, profileFromEvent } from "@nostr-dev-kit/ndk";
import type {
    Hexpubkey,
    NDKCacheAdapter,
    NDKFilter,
    NDKSubscription,
    NDKUserProfile,
    NDKLnUrlData,
    ProfilePointer,
    NostrEvent,
} from "@nostr-dev-kit/ndk";
import createDebug from "debug";
import { matchFilter } from "nostr-tools";
import { createDatabase, db, type Event } from "./db";
import { CacheHandler } from "./lru-cache";
import { profilesDump, profilesWarmUp } from "./caches/profiles";
import { ZapperCacheEntry, zapperDump, zapperWarmUp } from "./caches/zapper";
import { Nip05CacheEntry, nip05Dump, nip05WarmUp } from "./caches/nip05";
import { EventCacheEntry, eventsDump, eventsWarmUp } from "./caches/events";

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
    profileCacheSize?: number;
    zapperCacheSize?: number;
    nip05CacheSize?: number;
    eventCacheSize?: number;
}

export default class NDKCacheAdapterDexie implements NDKCacheAdapter {
    public debug: debug.Debugger;
    private expirationTime;
    readonly locking = true;
    public profiles: CacheHandler<NDKUserProfile>;
    public zappers: CacheHandler<ZapperCacheEntry>;
    public nip05s: CacheHandler<Nip05CacheEntry>;
    public events: CacheHandler<EventCacheEntry>;
    private warmedUp: boolean = false;
    private warmUpPromise: Promise<any>;

    constructor(opts: NDKCacheAdapterDexieOptions = {}) {
        createDatabase(opts.dbName || "ndk");
        this.debug = opts.debug || createDebug("ndk:dexie-adapter");
        this.expirationTime = opts.expirationTime || 3600;

        this.profiles = new CacheHandler<NDKUserProfile>({
            maxSize: opts.profileCacheSize || 100000,
            dump: profilesDump(db.users, this.debug),
            debug: this.debug,
        });

        this.zappers = new CacheHandler<ZapperCacheEntry>({
            maxSize: opts.zapperCacheSize || 200,
            dump: zapperDump(db.lnurl, this.debug),
            debug: this.debug,
        });


        this.nip05s = new CacheHandler<Nip05CacheEntry>({
            maxSize: opts.nip05CacheSize || 1000,
            dump: nip05Dump(db.nip05, this.debug),
            debug: this.debug,
        });


        this.events = new CacheHandler<EventCacheEntry>({
            maxSize: opts.eventCacheSize || 50000,
            dump: eventsDump(db.events, this.debug),
            debug: this.debug,
        });

        const startTime = Date.now();
        this.warmUpPromise = Promise.allSettled([
            profilesWarmUp(this.profiles, db.users),
            zapperWarmUp(this.zappers, db.lnurl),
            nip05WarmUp(this.nip05s, db.nip05),
            eventsWarmUp(this.events, db.events),
        ]);
        this.warmUpPromise.then(() => {
            const endTime = Date.now();
            this.warmedUp = true;
            this.debug("Warm up completed, time", endTime - startTime, "ms");
        });
    }

    public async query(subscription: NDKSubscription): Promise<void> {
        // ensure we have warmed up before processing the filter
        if (!this.warmedUp) await this.warmUpPromise;

        await Promise.allSettled(
            subscription.filters.map((filter) => this.processFilter(filter, subscription))
        );
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

        return profile || null;
    }

    public saveProfile(pubkey: Hexpubkey, profile: NDKUserProfile) {
        this.profiles.set(pubkey, profile);
    }

    public async loadNip05(
        nip05: string,
        maxAgeForMissing: number = 3600
    ): Promise<ProfilePointer | null | "missing"> {
        const cache = this.nip05s?.get(nip05);

        if (cache) {
            if (cache.profile === null) {
                // If the profile has been marked as missing and is older than the max age for missing, return missing
                if (cache.fetchedAt + maxAgeForMissing * 1000 < Date.now()) return "missing";

                // Otherwise, return null
                return null;
            }

            try {
                return JSON.parse(cache.profile);
            } catch (e) {
                return "missing";
            }
        }

        const nip = await db.nip05.get({ nip05 });

        if (!nip) return "missing";

        const now = Date.now();

        // If the document is older than the max age, return missing
        if (nip.profile === null) {
            // If the document has been marked as missing and is older than the max age for missing, return missing
            if (nip.fetchedAt + maxAgeForMissing * 1000 < now) return "missing";

            // Otherwise, return null
            return null;
        }

        try {
            return JSON.parse(nip.profile);
        } catch (e) {
            return "missing";
        }
    }

    public async saveNip05(nip05: string, profile: ProfilePointer | null): Promise<void> {
        try {
            const document = profile ? JSON.stringify(profile) : null;

            this.nip05s.set(nip05, { profile: document, fetchedAt: Date.now() });
        } catch (error) {
            console.error("Failed to save NIP-05 profile for nip05:", nip05, error);
        }
    }

    public async loadUsersLNURLDoc?(
        pubkey: Hexpubkey,
        maxAgeInSecs: number = 86400,
        maxAgeForMissing: number = 3600
    ): Promise<NDKLnUrlData | null | "missing"> {
        const cache = this.zappers?.get(pubkey);
        if (cache) {
            if (cache.document === null) {
                // If the document has been marked as missing and is older than the max age for missing, return missing
                if (cache.fetchedAt + maxAgeForMissing * 1000 < Date.now()) return "missing";

                // Otherwise, return null
                return null;
            }

            try {
                return JSON.parse(cache.document);
            } catch (e) {
                return "missing";
            }
        }

        const lnurl = await db.lnurl.get({ pubkey });

        if (!lnurl) return "missing";

        const now = Date.now();

        // If the document is older than the max age, return missing
        if (lnurl.fetchedAt + maxAgeInSecs * 1000 < now) return "missing";
        if (lnurl.document === null) {
            // If the document has been marked as missing and is older than the max age for missing, return missing
            if (lnurl.fetchedAt + maxAgeForMissing * 1000 < now) return "missing";

            // Otherwise, return null
            return null;
        }

        try {
            return JSON.parse(lnurl.document);
        } catch (e) {
            return "missing";
        }
    }

    public async saveUsersLNURLDoc(pubkey: Hexpubkey, doc: NDKLnUrlData | null): Promise<void> {
        try {
            const document = doc ? JSON.stringify(doc) : null;
            this.zappers?.set(pubkey, { document, fetchedAt: Date.now() });
        } catch (error) {
            console.error("Failed to save LNURL document for pubkey:", pubkey, error);
        }
    }

    private async processFilter(filter: NDKFilter, subscription: NDKSubscription): Promise<void> {
        // console.log("processFilter", JSON.stringify(filter));
        const _filter = { ...filter };
        delete _filter.limit;
        const filterKeys = Object.keys(_filter || {}).sort();

        try {
            await Promise.allSettled([
                this.byKindAndAuthor(filterKeys, filter, subscription),
                this.byAuthors(filterKeys, filter, subscription),
                this.byKinds(filterKeys, filter, subscription),
                this.byIdsQuery(filterKeys, filter, subscription),
                this.byNip33Query(filterKeys, filter, subscription),
                this.byTagsAndOptionallyKinds(filterKeys, filter, subscription),
            ]);
        } catch (error) {
            console.error(error);
        }
    }

    public async deleteEvent(event: NDKEvent): Promise<void> {
        this.events.delete(event.tagId());
        await db.events.where({ id: event.tagId() }).delete();
    }

    public async setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void> {
        if (event.kind === 0) {
            if (!this.profiles) return;

            try {
                const profile: NDKUserProfile = profileFromEvent(event);
                this.saveProfile(event.pubkey, profile);
            } catch {
                this.debug(`Failed to save profile for pubkey: ${event.pubkey}`);
            }
        } else {
            let addEvent = true;

            if (event.isParamReplaceable()) {
                const existingEvent = await this.events.get(event.tagId());
                if (
                    existingEvent &&
                    event.created_at &&
                    existingEvent.createdAt > event.created_at
                ) {
                    addEvent = false;
                }
            }

            if (addEvent) {
                this.events.set(event.tagId(), {
                    id: event.tagId(),
                    pubkey: event.pubkey,
                    content: event.content,
                    kind: event.kind!,
                    createdAt: event.created_at!,
                    relay: relay?.url,
                    event: event.serialize(true, true)
                });

                // Don't cache contact lists as tags since it's expensive
                // and there is no use case for it
                if (event.kind !== 3) {
                    event.tags.forEach((tag) => {
                        if (tag[0].length !== 1) return;

                        // console.log("saving event as tagged with tag", tag, "and value", tag[1]);

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

    /**
     * Searches by authors
     */
    private async byAuthors(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["authors"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        let found = undefined;

        if (hasAllKeys && filter.authors) {
            for (const pubkey of filter.authors) {
                const events = await db.events.where({ pubkey }).toArray();
                foundEvents(subscription, events);
                found ??= events.length > 0;
            }
        }
        return found ?? false;
    }

    /**
     * Searches by kinds
     */
    private async byKinds(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["kinds"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        let found = undefined;

        if (hasAllKeys && filter.kinds) {
            for (const kind of filter.kinds) {
                const events = await db.events.where({ kind }).toArray();
                foundEvents(subscription, events);
                found ??= events.length > 0;
            }
        }
        return found ?? false;
    }

    /**
     * Searches by ids
     */
    private async byIdsQuery(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["ids"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        if (hasAllKeys && filter.ids) {
            for (const id of filter.ids) {
                const event = await this.events.getWithFallback(id, db.events);
                if (!event) continue;

                foundEvent(subscription, event, event.relay);
            }

            return true;
        }

        return false;
    }

    /**
     * Searches by NIP-33
     */
    private async byNip33Query(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["#d", "authors", "kinds"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        if (hasAllKeys && filter.kinds && filter.authors) {
            for (const kind of filter.kinds) {
                const replaceableKind = kind >= 30000 && kind < 40000;

                if (!replaceableKind) continue;

                for (const author of filter.authors) {
                    for (const dTag of filter["#d"]!) {
                        const replaceableId = `${kind}:${author}:${dTag}`;
                        const event = await this.events.getWithFallback(replaceableId, db.events);
                        if (!event) continue;

                        foundEvent(subscription, event, event.relay);
                    }
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Searches by kind & author
     */
    private async byKindAndAuthor(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["authors", "kinds"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));
        let found = undefined;

        if (!hasAllKeys) return false;

        if (filter.kinds && filter.authors) {
            for (const kind of filter.kinds) {
                for (const author of filter.authors) {
                    const events = await db.events.where({ kind, pubkey: author }).toArray();
                    foundEvents(subscription, events);
                    found ??= events.length > 0;
                }
            }
        }
        return found ?? false;
    }

    /**
     * Searches by tags and optionally filters by tags
     */
    private async byTagsAndOptionallyKinds(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        // console.log("byTagsAndOptionallyKinds", filterKeys, filter);
        const hasTagFilter = filterKeys.some((k) => k.startsWith("#") && k.length === 2);
        // console.log("hasTagFilter", hasTagFilter, filterKeys);
        if (!hasTagFilter) return false;

        const events = await this.filterByTag(filterKeys, filter);
        // console.log("events", events.length);
        const kinds = filter.kinds as number[];

        for (const event of events) {
            if (!kinds?.includes(event.kind!)) continue;

            subscription.eventReceived(event, undefined, true);
        }

        return false;
    }

    private async filterByTag(filterKeys: string[], filter: NDKFilter): Promise<NDKEvent[]> {
        const retEvents: NDKEvent[] = [];

        for (const filterKey of filterKeys) {
            if (filterKey.length !== 2) continue;
            const tag = filterKey.slice(1);
            // const values = filter[filterKey] as string[];
            const values: string[] = [];
            for (const [key, value] of Object.entries(filter)) {
                if (key === filterKey) values.push(value as string);
            }

            for (const value of values) {
                const startTime = Date.now();
                const eventTags = await db.eventTags.where({ tagValue: tag + value }).toArray();
                const endTime = Date.now();
                console.log("query time", endTime - startTime, JSON.stringify(filter), eventTags.length);
                if (!eventTags.length) continue;

                if (filter.kinds?.includes(9735))
                    console.log("found event tags", JSON.stringify(filter), eventTags);

                const eventIds = eventTags.map((t) => t.eventId);

                // console.log("eventIds", eventIds);

                const events = await this.events.getManyWithFallback(eventIds, db.events);
                console.log("events", events.length);
                for (const event of events) {
                    let deserializedEvent: NostrEvent;

                    try {
                        deserializedEvent = deserialize(event.event);

                        // Make sure all passed filters match the event
                        if (!matchFilter(filter, deserializedEvent as any)) {
                            // console.log("failed to match filter", filter, deserializedEvent);
                            continue;
                        }
                    } catch (e) {
                        console.log("failed to parse event", e);
                        continue;
                    }

                    const ndkEvent = new NDKEvent(undefined, deserializedEvent);
                    const relay = event.relay ? new NDKRelay(event.relay) : undefined;
                    ndkEvent.relay = relay;
                    retEvents.push(ndkEvent);
                }
            }
        }

        return retEvents;
    }
}

export function foundEvents(
    subscription: NDKSubscription,
    events: Event[]
) {
    for (const event of events) {
        foundEvent(subscription, event, event.relay);
    }
}

export function foundEvent(
    subscription: NDKSubscription,
    event: Event,
    relayUrl: WebSocket["url"] | undefined
) {
    try {
        const ndk = subscription.ndk;
        const e = NDKEvent.deserialize(ndk, event.event);
        const relay = relayUrl ? ndk.pool.getRelay(relayUrl) : undefined;
        subscription.eventReceived(e, relay, true);
    } catch (e) {
    }
}