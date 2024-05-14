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
    NDKCacheRelayInfo,
} from "@nostr-dev-kit/ndk";
import createDebug from "debug";
import { matchFilter } from "nostr-tools";
import { RelayStatus, createDatabase, db, type Event } from "./db.js";
import { CacheHandler } from "./lru-cache.js";
import { profilesDump, profilesWarmUp } from "./caches/profiles.js";
import { ZapperCacheEntry, zapperDump, zapperWarmUp } from "./caches/zapper.js";
import { Nip05CacheEntry, nip05Dump, nip05WarmUp } from "./caches/nip05.js";
import { EventCacheEntry, eventsDump, eventsWarmUp } from "./caches/events.js";
import { EventTagCacheEntry, eventTagsDump, eventTagsWarmUp } from "./caches/event-tags.js";
import { relayInfoDump, relayInfoWarmUp } from "./caches/relay-info.js";

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
    eventTagsCacheSize?: number;
}

export default class NDKCacheAdapterDexie implements NDKCacheAdapter {
    public debug: debug.Debugger;
    private expirationTime;
    readonly locking = true;
    public ready = false;
    public profiles: CacheHandler<NDKUserProfile>;
    public zappers: CacheHandler<ZapperCacheEntry>;
    public nip05s: CacheHandler<Nip05CacheEntry>;
    public events: CacheHandler<EventCacheEntry>;
    public eventTags: CacheHandler<EventTagCacheEntry>;
    public relayInfo: CacheHandler<RelayStatus>;
    private warmedUp: boolean = false;
    private warmUpPromise: Promise<any>;
    public devMode = false;
    public _onReady?: () => void;

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
            maxSize: opts.eventCacheSize || 150000,
            dump: eventsDump(db.events, this.debug),
            debug: this.debug,
        });
        this.events.addIndex<Event["pubkey"]>("pubkey")

        this.eventTags = new CacheHandler<EventTagCacheEntry>({
            maxSize: opts.eventTagsCacheSize || 100000,
            dump: eventTagsDump(db.eventTags, this.debug),
            debug: this.debug,
        });

        this.relayInfo = new CacheHandler<RelayStatus>({
            maxSize: 500,
            debug: this.debug,
            dump: relayInfoDump(db.relayStatus, this.debug),
        });

        const startTime = Date.now();
        this.warmUpPromise = Promise.allSettled([
            profilesWarmUp(this.profiles, db.users),
            zapperWarmUp(this.zappers, db.lnurl),
            nip05WarmUp(this.nip05s, db.nip05),
            eventsWarmUp(this.events, db.events),
            eventTagsWarmUp(this.eventTags, db.eventTags),
            relayInfoWarmUp(this.relayInfo, db.relayStatus),
        ]);
        this.warmUpPromise.then(() => {
            const endTime = Date.now();
            this.warmedUp = true;
            this.ready = true;
            this.debug("Warm up completed, time", endTime - startTime, "ms");

            // call the onReady callback if it's set
            if (this._onReady) this._onReady();
        });
    }

    public onReady(callback: () => void) {
        this._onReady = callback;
    }

    public async query(subscription: NDKSubscription): Promise<void> {
        // ensure we have warmed up before processing the filter
        if (!this.warmedUp) {
            const startTime = Date.now();
            await this.warmUpPromise;
            this.debug("froze query for", Date.now() - startTime, "ms");
        }

        const startTime = Date.now();
        subscription.filters.map((filter) => this.processFilter(filter, subscription))
        const dur = Date.now() - startTime;
        if (dur > 100) this.debug("query took", dur, "ms", subscription.filter);
    }

    public async fetchProfile(pubkey: Hexpubkey) {
        if (!this.profiles) return null;

        let profile = await this.profiles.getWithFallback(pubkey, db.users);

        return profile || null;
    }

    public async getProfiles(fn: (pubkey: Hexpubkey, profile: NDKUserProfile) => boolean): Promise<Map<Hexpubkey, NDKUserProfile> | undefined> {
        if (!this.profiles) return;
        return this.profiles.getAllWithFilter(fn);
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

    private processFilter(filter: NDKFilter, subscription: NDKSubscription): void {
        const _filter = { ...filter };
        delete _filter.limit;
        const filterKeys = Object.keys(_filter || {}).sort();
        // const times: Record<string, { start: number, duration: number }> = {};
        let exit = false;

        try {
            // start with NIP-33 query
            if (this.byNip33Query(filterKeys, filter, subscription)) return; // exit = true;

            // Continue with author
            if (this.byAuthors(filter, subscription)) return; // exit = true;

            // Continue with ids
            if (this.byIdsQuery(filter, subscription)) return; // exit = true;

            // By tags
            if (this.byTags(filter, subscription)) return; // exit = true;
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
        }
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

                    this.eventTags.add(tag[0] + tag[1], event.tagId());
                });
            }
        }
    }

    public updateRelayStatus(url: string, info: NDKCacheRelayInfo): void {
        const val = { url, updatedAt: Date.now(), ...info };
        this.relayInfo.set(url, val);
    }

    public getRelayStatus(url: string): NDKCacheRelayInfo | undefined {
        const a = this.relayInfo.get(url);
        if (a) {
            return {
                lastConnectedAt: a.lastConnectedAt,
                dontConnectBefore: a.dontConnectBefore,
            }
        }
    }

    /**
     * Searches by authors
     */
    private byAuthors(
        filter: NDKFilter,
        subscription: NDKSubscription
    ): boolean {
        if (!filter.authors) return false;

        let total = 0;

        for (const pubkey of filter.authors) {
            // const eventsFromDb = await db.events.where({ pubkey }).toArray();
            let events = Array.from(this.events.getFromIndex("pubkey", pubkey));

            const prev = events.length;

            // reduce by kind if needed
            if (filter.kinds)
                events = events.filter(e => filter.kinds!.includes(e.kind!));

            foundEvents(subscription, events, filter);
            total += events.length;
        }

        return true;
    }

    /**
     * Searches by ids
     */
    private byIdsQuery(
        filter: NDKFilter,
        subscription: NDKSubscription
    ): boolean {
        if (filter.ids) {
            for (const id of filter.ids) {
                const event = this.events.get(id);
                if (event) foundEvent(subscription, event, event.relay);
            }

            return true;
        }

        return false;
    }

    /**
     * Searches by NIP-33
     */
    private byNip33Query(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): boolean {
        const f = ["#d", "authors", "kinds"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        if (hasAllKeys && filter.kinds && filter.authors) {
            for (const kind of filter.kinds) {
                const replaceableKind = kind >= 30000 && kind < 40000;

                if (!replaceableKind) continue;

                for (const author of filter.authors) {
                    for (const dTag of filter["#d"]!) {
                        const replaceableId = `${kind}:${author}:${dTag}`;
                        const event = this.events.get(replaceableId);
                        if (event)
                            foundEvent(subscription, event, event.relay);
                    }
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Searches by tags and optionally filters by tags
     */
    private byTags(
        filter: NDKFilter,
        subscription: NDKSubscription
    ): boolean {
        const tagFilters = Object.entries(filter)
            .filter(([filter]) => filter.startsWith("#") && filter.length === 2)
            .map(([filter, values]) => [filter[1], values]);
        if (tagFilters.length === 0) return false;

        // Go through all the tags (#e, #p, etc)
        for (const [tag, values] of tagFilters) {
            // Go throgh each value in the filter
            for (const value of values as string[]) {
                const tagValue = tag + value;

                // Get all events with this tag
                const eventIds = this.eventTags.getSet(tagValue);
                if (!eventIds) continue;

                // Go through each event that came back
                eventIds.forEach((id) => {
                    const event = this.events.get(id);
                    if (!event) return;

                    if (!filter.kinds || filter.kinds.includes(event.kind!)) {
                        foundEvent(subscription, event, event.relay);
                    }
                });
            }
        }

        return true;
    }
}

export function checkEventMatchesFilter(
    event: Event,
    filter: NDKFilter,
): NDKEvent | undefined {
    let deserializedEvent: NostrEvent;

    try {
        deserializedEvent = deserialize(event.event);

        // Make sure all passed filters match the event
        if (!matchFilter(filter, deserializedEvent as any))
            return;
    } catch (e) {
        console.log("failed to parse event", e);
        return;
    }

    const ndkEvent = new NDKEvent(undefined, deserializedEvent);
    const relay = event.relay ? new NDKRelay(event.relay) : undefined;
    ndkEvent.relay = relay;

    return ndkEvent;
}

export function foundEvents(
    subscription: NDKSubscription,
    events: Event[],
    filter?: NDKFilter
) {
    for (const event of events) {
        foundEvent(subscription, event, event.relay, filter);
    }
}

export function foundEvent(
    subscription: NDKSubscription,
    event: Event,
    relayUrl: WebSocket["url"] | undefined,
    filter?: NDKFilter
) {
    try {
        const deserializedEvent = deserialize(event.event);

        if (filter && !matchFilter(filter, deserializedEvent as any)) return;

        const ndkEvent = new NDKEvent(undefined, deserializedEvent);
        const relay = relayUrl ? subscription.pool.getRelay(relayUrl) : undefined;
        ndkEvent.relay = relay;
        subscription.eventReceived(ndkEvent, relay, true);
    } catch (e) {
        console.error("failed to deserialize event", e);
    }
}