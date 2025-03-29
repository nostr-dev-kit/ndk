import {
    NDKCacheAdapter,
    NDKEvent,
    NDKFilter,
    NDKSubscription,
    NDKUserProfile,
    Hexpubkey,
    NDKCacheEntry,
    NDKRelay,
    deserialize,
    NDKEventId,
    NDKKind,
    matchFilter,
    profileFromEvent,
} from "@nostr-dev-kit/ndk";
import { LRUCache } from "typescript-lru-cache";
import * as SQLite from "expo-sqlite";
import { migrations } from "./migrations.js";

export type NDKSqliteEventRecord = {
    id: string;
    created_at: number;
    pubkey: string;
    event: string;
    kind: number;
    relay: string;
};

export type NDKSqliteProfileRecord = {
    pubkey: string;
    name: string;
    about: string;
    picture: string;
    banner: string;
    nip05: string;
    lud16: string;
    lud06: string;
    display_name: string;
    website: string;
    catched_at: number;
    created_at: number;
};

/**
 * This is an entry with a loaded event that we can listen on for publication event to update
 * our internal state.
 */
type LoadedUnpublishedEvent = {
    event: NDKEvent;
    relays: WebSocket["url"][];
    lastTryAt: number;
};

/**
 * This represents an entry in the database for an unpublished event.
 */
type UnpublishedEventRecord = {
    id: string;
    event: string;
    relays: string; // JSON string of {[url: string]: boolean}
    last_try_at: number;
};

type PendingCallback = (...arg: any) => any;

function filterForCache(subscription: NDKSubscription) {
    if (!subscription.cacheUnconstrainFilter) return subscription.filters;

    const filterCopy = subscription.filters.map((filter) => ({ ...filter }));

    // remove the keys that are in the cacheUnconstrainFilter
    return filterCopy.filter((filter) => {
        for (const key of subscription.cacheUnconstrainFilter) {
            delete filter[key];
        }
        return Object.keys(filter).length > 0;
    });
}

export class NDKCacheAdapterSqlite implements NDKCacheAdapter {
    readonly dbName: string;
    public db: SQLite.SQLiteDatabase;
    locking: boolean = false;
    ready: boolean = false;
    private pendingCallbacks: PendingCallback[] = [];
    public profileCache?: LRUCache<string, NDKCacheEntry<NDKUserProfile>>;
    private unpublishedEventIds: Set<string> = new Set();

    /**
     * This tracks the events we have written to the database along with their timestamp.
     */
    private knownEventTimestamps: Map<string, number> = new Map();

    private writeBuffer: { query: string; params: any[] }[] = [];
    private bufferFlushTimeout: number = 100; // milliseconds
    private bufferFlushTimer: NodeJS.Timeout | null = null;

    constructor(dbName: string, maxProfiles: number | false = false) {
        this.dbName = dbName ?? "ndk-cache";
        if (maxProfiles) {
            this.profileCache = new LRUCache({ maxSize: maxProfiles });
        }
        this.db = SQLite.openDatabaseSync(this.dbName);
    }

    /**
     * Initialize the cache adapter.
     *
     * This should be called before using it.
     */
    public async initialize() {
        let { user_version: schemaVersion } = this.db.getFirstSync(`PRAGMA user_version;`) as {
            user_version: number;
        };

        if (!schemaVersion) {
            schemaVersion = 0;

            // set the schema version
            await this.db.execAsync(`PRAGMA user_version = ${schemaVersion};`);
            await this.db.execAsync(`PRAGMA journal_mode = WAL;`);
        }

        if (!schemaVersion || Number(schemaVersion) < migrations.length) {
            await this.db.withTransactionAsync(async () => {
                for (let i = Number(schemaVersion); i < migrations.length; i++) {
                    try {
                        await migrations[i].up(this.db);
                    } catch (e) {
                        console.error("error running migration", e);
                        throw e;
                    }
                    await this.db.execAsync(`PRAGMA user_version = ${i + 1};`);
                }

                // set the schema version
                await this.db.execAsync(`PRAGMA user_version = ${migrations.length};`);
            });
        }

        this.ready = true;
        this.locking = true;

        // load all the event timestamps
        const events = this.db.getAllSync(`SELECT id, created_at FROM events`) as {
            id: string;
            created_at: number;
        }[];
        for (const event of events) {
            this.knownEventTimestamps.set(event.id, event.created_at);
        }

        await this.loadUnpublishedEvents();

        Promise.all(
            this.pendingCallbacks.map((f) => {
                try {
                    return f();
                } catch (e) {
                    console.error("error calling cache adapter pending callback", e);
                }
            })
        );
    }

    onReady(callback: () => any) {
        if (this.ready) {
            return callback();
        } else {
            this.pendingCallbacks.unshift(callback);
        }
    }

    /**
     * Runs the function only if the cache adapter is ready, if it's not ready,
     * it ignores the function.
     */
    ifReady(callback: () => any) {
        if (this.ready) return callback();
    }

    query(subscription: NDKSubscription): NDKEvent[] {
        if (!this.ready) return [];

        const cacheFilters = filterForCache(subscription);
        const results = new Map<NDKEventId, NDKEvent>();

        const addResults = (events: NDKEvent[]) => {
            for (const event of events) {
                results.set(event.id, event);
            }
        };

        // Process filters from the subscription
        for (const filter of cacheFilters) {
            const hasHashtagFilter = Object.keys(filter).some(
                (key) => key.startsWith("#") && key.length === 2
            );

            if (hasHashtagFilter) {
                for (const key in filter) {
                    if (key.startsWith("#") && key.length === 2) {
                        const tag = key[1];
                        const events = this.db.getAllSync(
                            `SELECT * FROM events INNER JOIN event_tags ON events.id = event_tags.event_id WHERE event_tags.tag = ? AND event_tags.value IN (${filter[key].map(() => "?").join(",")}) ORDER BY created_at DESC`,
                            [tag, ...filter[key]]
                        ) as NDKSqliteEventRecord[];
                        if (events.length > 0)
                            addResults(foundEvents(subscription, events, filter));
                        break;
                    }
                }
            } else if (filter.authors && filter.kinds) {
                const events = this.db.getAllSync(
                    `SELECT * FROM events WHERE pubkey IN (${filter.authors.map(() => "?").join(",")}) AND kind IN (${filter.kinds.map(() => "?").join(",")}) ORDER BY created_at DESC`,
                    [...filter.authors, ...filter.kinds]
                ) as NDKSqliteEventRecord[];
                if (events.length > 0) addResults(foundEvents(subscription, events, filter));
            } else if (filter.authors) {
                const events = this.db.getAllSync(
                    `SELECT * FROM events WHERE pubkey IN (${filter.authors.map(() => "?").join(",")}) ORDER BY created_at DESC`,
                    filter.authors
                ) as NDKSqliteEventRecord[];
                if (events.length > 0) addResults(foundEvents(subscription, events, filter));
            } else if (filter.kinds) {
                const events = this.db.getAllSync(
                    `SELECT * FROM events WHERE kind IN (${filter.kinds.map(() => "?").join(",")}) ORDER BY created_at DESC`,
                    filter.kinds
                ) as NDKSqliteEventRecord[];
                if (events.length > 0) addResults(foundEvents(subscription, events, filter));
            } else if (filter.ids) {
                const events = this.db.getAllSync(
                    `SELECT * FROM events WHERE id IN (${filter.ids.map(() => "?").join(",")}) ORDER BY created_at DESC`,
                    filter.ids
                ) as NDKSqliteEventRecord[];
                if (events.length > 0) addResults(foundEvents(subscription, events, filter));
            }
        }

        const ret = Array.from(results.values());

        return ret;
    }

    private async flushWriteBuffer() {
        if (this.writeBuffer.length === 0) return;

        const bufferCopy = [...this.writeBuffer];
        this.writeBuffer = [];

        await this.db.withTransactionAsync(async () => {
            for (const [index, { query, params }] of bufferCopy.entries()) {
                try {
                    await this.db.runAsync(query, params);
                } catch (e) {
                    console.error("error executing buffered write", e, query, params);
                }
            }
        });

        // null out the timer
        this.bufferFlushTimer = null;

        // check if there are any more operations in the buffer
        if (this.writeBuffer.length > 0) {
            // console.log(`[${Date.now()}] [SQLITE] Buffer has ${this.writeBuffer.length} operations, starting new timer`);
            this.bufferFlushTimer = setTimeout(
                () => this.flushWriteBuffer(),
                this.bufferFlushTimeout
            );
        }
    }

    private bufferWrite(query: string, params: any[]) {
        this.writeBuffer.push({ query, params });

        if (!this.bufferFlushTimer) {
            this.bufferFlushTimer = setTimeout(
                () => this.flushWriteBuffer(),
                this.bufferFlushTimeout
            );
        }
    }

    async setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void> {
        this.onReady(async () => {
            const referenceId = event.isReplaceable() ? event.tagAddress() : event.id;
            const existingEvent = this.knownEventTimestamps.get(referenceId);
            if (existingEvent && existingEvent >= event.created_at!) return;

            this.knownEventTimestamps.set(referenceId, event.created_at!);

            if (event.isReplaceable()) {
                try {
                    this.bufferWrite(`DELETE FROM events WHERE id = ?;`, [referenceId]);
                    this.bufferWrite(`DELETE FROM event_tags WHERE event_id = ?;`, [referenceId]);
                } catch (e) {
                    console.error("error deleting event", e, referenceId);
                }
            }

            // this.bufferKinds.set(event.kind!, (this.bufferKinds.get(event.kind!) || 0) + 1);
            this.bufferWrite(
                `INSERT INTO events (id, created_at, pubkey, event, kind, relay) VALUES (?, ?, ?, ?, ?, ?);`,
                [
                    referenceId,
                    event.created_at!,
                    event.pubkey,
                    event.serialize(true, true),
                    event.kind!,
                    relay?.url || "",
                ]
            );

            const filterTags: [string, string][] = event.tags
                .filter((tag) => tag[0].length === 1)
                .map((tag) => [tag[0], tag[1]]);
            if (filterTags.length < 10) {
                for (const tag of filterTags) {
                    this.bufferWrite(
                        `INSERT INTO event_tags (event_id, tag, value) VALUES (?, ?, ?);`,
                        [event.id, tag[0], tag[1]]
                    );
                }
            }

            if (event.kind === NDKKind.EventDeletion) {
                this.deleteEventIds(
                    event.tags.filter((tag) => tag[0] === "e").map((tag) => tag[1])
                );
            } else if (event.kind === NDKKind.Metadata) {
                const profile = profileFromEvent(event);
                if (profile) {
                    this.saveProfile(event.pubkey, profile);
                }
            }
        });
    }

    async deleteEventIds(eventIds: NDKEventId[]): Promise<void> {
        this.onReady(async () => {
            this.bufferWrite(
                `DELETE FROM events WHERE id IN (${eventIds.map(() => "?").join(",")});`,
                eventIds
            );
            this.bufferWrite(
                `DELETE FROM event_tags WHERE event_id IN (${eventIds.map(() => "?").join(",")});`,
                eventIds
            );
        });
    }

    fetchProfileSync(pubkey: Hexpubkey): NDKCacheEntry<NDKUserProfile> | null {
        const cached = this.profileCache?.get(pubkey);
        if (cached) return cached;

        if (!this.ready) return null;

        let result: NDKSqliteProfileRecord | null = null;

        try {
            result = this.db.getFirstSync(
                `SELECT name, about, picture, banner, nip05, lud16, lud06, display_name, website, catched_at, created_at FROM profiles WHERE pubkey = ?;`,
                [pubkey]
            ) as NDKSqliteProfileRecord;
        } catch (e) {
            console.error("error fetching profile", e, { pubkey });
            return null;
        }

        if (result) {
            try {
                const profile = {
                    name: result.name,
                    about: result.about,
                    picture: result.picture,
                    banner: result.banner,
                    nip05: result.nip05,
                    lud16: result.lud16,
                    lud06: result.lud06,
                    displayName: result.display_name,
                    website: result.website,
                    created_at: result.created_at,
                };
                const entry = { ...profile, fetchedAt: result.catched_at };
                if (this.profileCache) {
                    this.profileCache.set(pubkey, entry);
                }
                return entry;
            } catch (e) {
                console.error("failed to parse profile", result);
            }
        }

        return null;
    }

    async fetchProfile(pubkey: Hexpubkey): Promise<NDKCacheEntry<NDKUserProfile> | null> {
        const cached = this.profileCache?.get(pubkey);
        if (cached) {
            return cached;
        }

        return await this.ifReady(async () => {
            const result = (await this.db.getFirstAsync(
                `
                SELECT 
                    name, 
                    about, 
                    picture, 
                    banner, 
                    nip05, 
                    lud16, 
                    lud06, 
                    display_name, 
                    website, 
                    catched_at, 
                    created_at 
                FROM profiles WHERE pubkey = ?;`,
                [pubkey]
            )) as {
                name: string;
                about: string;
                picture: string;
                banner: string;
                nip05: string;
                lud16: string;
                lud06: string;
                display_name: string;
                website: string;
                catched_at: number;
                created_at: number;
            };

            if (result) {
                try {
                    const profile = {
                        name: result.name,
                        about: result.about,
                        picture: result.picture,
                        banner: result.banner,
                        nip05: result.nip05,
                        lud16: result.lud16,
                        lud06: result.lud06,
                        displayName: result.display_name,
                        website: result.website,
                        created_at: result.created_at,
                    };
                    const entry = { ...profile, fetchedAt: result.catched_at };
                    if (this.profileCache) {
                        this.profileCache.set(pubkey, entry);
                    }
                    return entry;
                } catch (e) {
                    console.error("failed to parse profile", result);
                }
            }

            return null;
        });
    }

    async saveProfile(pubkey: Hexpubkey, profile: NDKUserProfile): Promise<void> {
        this.onReady(async () => {
            // check if the profile we have is newer based on created_at
            const existingProfile = await this.fetchProfile(pubkey);
            if (
                existingProfile?.created_at &&
                profile.created_at &&
                existingProfile.created_at >= profile.created_at
            ) {
                return;
            }

            const now = Date.now();
            const entry = { ...profile, fetchedAt: now };
            if (this.profileCache) {
                this.profileCache.set(pubkey, entry);
            }

            this.bufferWrite(
                `INSERT OR REPLACE INTO profiles (
                pubkey, 
                name, 
                about, 
                picture, 
                banner, 
                nip05, 
                lud16, 
                lud06, 
                display_name, 
                website, 
                catched_at, 
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    pubkey,
                    profile.name,
                    profile.about,
                    profile.picture,
                    profile.banner,
                    profile.nip05,
                    profile.lud16,
                    profile.lud06,
                    profile.displayName,
                    profile.website,
                    now,
                    profile.created_at,
                ]
            );
        });
    }

    private _unpublishedEvents: LoadedUnpublishedEvent[] = [];

    private _addUnpublishedEvent(event: NDKEvent, relays: WebSocket["url"][], lastTryAt: number) {
        if (this.unpublishedEventIds.has(event.id)) return;
        this.unpublishedEventIds.add(event.id);
        this._unpublishedEvents.push({ event, relays, lastTryAt });

        const onPublished = (relay: NDKRelay) => {
            this.discardUnpublishedEvent(event.id);
            event.off("published", onPublished);
        };

        event.on("published", onPublished);
    }

    addUnpublishedEvent(event: NDKEvent, relayUrls: WebSocket["url"][]): void {
        if (this.unpublishedEventIds.has(event.id)) return;
        this._addUnpublishedEvent(event, relayUrls, Date.now());

        this.setEvent(event, []);
        this.onReady(async () => {
            const relayStatus: { [key: string]: boolean } = {};
            relayUrls.forEach((url) => (relayStatus[url] = false));

            try {
                // console.log(`[${Date.now()}] [SQLITE] write unpublished event`, event.kind);
                this.db.runAsync(
                    `INSERT INTO unpublished_events (id, event, relays, last_try_at) VALUES (?, ?, ?, ?);`,
                    [event.id, event.serialize(true, true), JSON.stringify(relayStatus), Date.now()]
                );
            } catch (e) {
                console.error("error adding unpublished event", e);
            }
        });
    }

    async getUnpublishedEvents(): Promise<
        { event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]
    > {
        return await this.onReady(async () => {
            const call = () => this._unpublishedEvents;

            if (!this.ready) {
                return new Promise((resolve, reject) => {
                    this.pendingCallbacks.push(() => resolve(call()));
                });
            } else {
                return call();
            }
        });
    }

    /**
     * This loads the unpublished events from the database into _unpublishedEvents.
     *
     * This should be called during initialization.
     */
    private loadUnpublishedEvents() {
        const events = this.db.getAllSync(
            `SELECT * FROM unpublished_events`
        ) as UnpublishedEventRecord[];
        for (const event of events) {
            const deserializedEvent = new NDKEvent(undefined, deserialize(event.event));
            const relays = JSON.parse(event.relays);
            this._addUnpublishedEvent(deserializedEvent, Object.keys(relays), event.last_try_at);
        }
    }

    discardUnpublishedEvent(eventId: NDKEventId): void {
        this.unpublishedEventIds.delete(eventId);
        this.onReady(() => {
            // console.log(`[${Date.now()}] [SQLITE] delete unpublished event`, eventId);
            this.db.runAsync(`DELETE FROM unpublished_events WHERE id = ?;`, [eventId]);
        });
    }

    async saveWot(wot: Map<Hexpubkey, number>) {
        this.onReady(async () => {
            this.db.runSync(`DELETE FROM wot;`);
            for (const [pubkey, value] of wot) {
                this.db.runSync(`INSERT INTO wot (pubkey, wot) VALUES (?, ?);`, [pubkey, value]);
            }
        });
    }

    async fetchWot(): Promise<Map<Hexpubkey, number>> {
        return await this.onReady(async () => {
            const wot = (await this.db.getAllAsync(`SELECT * FROM wot`)) as {
                pubkey: string;
                wot: number;
            }[];
            return new Map(wot.map((wot) => [wot.pubkey, wot.wot]));
        });
    }

    clear() {
        this.onReady(() => {
            this.db.runSync(`DELETE FROM wot;`);
            this.db.runSync(`DELETE FROM profiles;`);
            this.db.runSync(`DELETE FROM events;`);
            this.db.runSync(`DELETE FROM event_tags;`);
            this.db.runSync(`DELETE FROM unpublished_events;`);
            this.db.runSync(`DELETE FROM decrypted_events;`);
        });
    }

    /**
     * Get an event from the database by ID.
     *
     * @param id - The ID of the event to get.
     * @returns The event, or null if it doesn't exist.
     */
    public getEventId(id: NDKEventId): NDKEvent | null {
        const row = this.db.getFirstSync(`SELECT event FROM events WHERE id = ?;`, [id]) as {
            event: string;
        };
        return row ? new NDKEvent(undefined, deserialize(row.event)) : null;
    }

    /**
     * This function runs a query and returns parsed events.
     * @param query The query to run.
     * @param params The parameters to pass to the query.
     * @param filterFn An optional filter function to filter events before deserializing them.
     * @returns
     */
    public getEvents(
        query: string,
        params: any[],
        filterFn: (record: NDKSqliteEventRecord) => boolean
    ) {
        let res = this.db.getAllSync(query, params) as NDKSqliteEventRecord[];

        if (filterFn) {
            res = res.filter(filterFn);
        }

        // deserialize the events
        return res.map((record) => {
            try {
                const deserializedEvent = deserialize(record.event);
                return new NDKEvent(undefined, deserializedEvent);
            } catch (e) {
                console.error("failed to deserialize event", e, record);
                return null;
            }
        });
    }

    /**
     * Get a decrypted event from the database by ID.
     * 
     * @param eventId - The ID of the decrypted event to get.
     * @returns The decrypted event, or null if it doesn't exist.
     */
    public getDecryptedEvent(eventId: NDKEventId): NDKEvent | null {
        if (!this.ready) return null;

        try {
            const row = this.db.getFirstSync(
                `SELECT event FROM decrypted_events WHERE event_id = ?;`,
                [eventId]
            ) as { event: string } | undefined;

            if (!row) return null;

            return new NDKEvent(undefined, deserialize(row.event));
        } catch (e) {
            console.error("Error getting decrypted event", e, { eventId });
            return null;
        }
    }

    /**
     * Store a decrypted event in the database.
     * 
     * @param event - The decrypted event to store.
     */
    public addDecryptedEvent(event: NDKEvent): void {
        this.onReady(() => {
            const now = Date.now();

            this.bufferWrite(
                `INSERT OR REPLACE INTO decrypted_events (
                    event_id, 
                    event, 
                    decrypted_at
                ) VALUES (?, ?, ?);`,
                [
                    event.id,
                    event.serialize(true, true),
                    now
                ]
            );
        });
    }
}

export function foundEvents(
    subscription: NDKSubscription,
    records: NDKSqliteEventRecord[],
    filter?: NDKFilter
): NDKEvent[] {
    const result: NDKEvent[] = [];
    let now: number | undefined;

    for (const record of records) {
        const event = foundEvent(subscription, record, record.relay, filter);
        if (event) {
            // check the event is not expired
            const expiration = event.tagValue("expiration");
            if (expiration) {
                now ??= Math.floor(Date.now() / 1000);
                if (now > parseInt(expiration)) continue;
            }

            result.push(event);
            if (filter?.limit && result.length >= filter.limit) break;
        }
    }

    return result;
}

export function foundEvent(
    subscription: NDKSubscription,
    event: NDKSqliteEventRecord,
    relayUrl: WebSocket["url"] | undefined,
    filter?: NDKFilter
): NDKEvent | null {
    try {
        const deserializedEvent = deserialize(event.event);

        if (filter && !matchFilter(filter, deserializedEvent as any)) return null;

        const ndkEvent = new NDKEvent(undefined, deserializedEvent);
        const relay = relayUrl ? subscription.pool.getRelay(relayUrl, false) : undefined;
        ndkEvent.relay = relay;

        return ndkEvent;
    } catch (e) {
        console.error("failed to deserialize event", e, event.event);
        return null;
    }
}
