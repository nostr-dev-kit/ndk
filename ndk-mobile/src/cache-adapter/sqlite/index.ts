import type NDK from "@nostr-dev-kit/ndk";
import {
    type Hexpubkey,
    type NDKCacheAdapter,
    type NDKCacheEntry,
    NDKEvent,
    type NDKEventId,
    type NDKFilter,
    NDKKind,
    type NDKRelay,
    type NDKSubscription,
    type NDKUserProfile,
    deserialize,
    matchFilter,
    profileFromEvent,
    type NDKNutzapState, // Import the type moved to ndk-core
} from "@nostr-dev-kit/ndk";
import * as SQLite from "expo-sqlite";
import * as Mint from "../../mint/mint-methods.js";
import { getAllProfilesSync } from "./get-all-profiles.js";
import { getAllNutzapStates } from "./nutzap-state-get.js";
import { prepareNutzapStateUpdate } from "./nutzap-state-set.js";
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
    public ndk?: NDK; // Added to hold NDK instance
    public locking = false; // Re-add locking property required by interface
    private unpublishedEventIds: Set<string> = new Set();

    /**
     * This tracks the events we have written to the database along with their timestamp.
     */
    private knownEventTimestamps: Map<string, number> = new Map();

    private writeBuffer: { query: string; params: any[] }[] = [];
    private bufferFlushTimeout = 100; // milliseconds
    private bufferFlushTimer: NodeJS.Timeout | null = null;

    // Mint management methods
    public getMintInfo = Mint.getMintInfo.bind(this);
    public getMintInfoRecord = Mint.getMintInfoRecord.bind(this);
    public getAllMintInfo = Mint.getAllMintInfo.bind(this);
    public setMintInfo = Mint.setMintInfo.bind(this);
    public getMintKeys = Mint.getMintKeys.bind(this);
    public getMintKeyset = Mint.getMintKeyset.bind(this);
    public getMintKeysetRecord = Mint.getMintKeysetRecord.bind(this);
    public getAllMintKeysets = Mint.getAllMintKeysets.bind(this);
    public setMintKeys = Mint.setMintKeys.bind(this);

    // Profile methods
    public getAllProfilesSync = getAllProfilesSync.bind(this);

    // Nutzap state methods
    public getAllNutzapStates = getAllNutzapStates.bind(this); // Bind the imported function

    constructor(dbName: string, ndkInstance?: NDK) { // Optionally accept NDK instance
        this.dbName = dbName ?? "ndk-cache";
        this.db = SQLite.openDatabaseSync(this.dbName);
        this.ndk = ndkInstance; // Assign NDK instance
    }

    /**
     * Initialize the cache adapter.
     *
     * This should be called before using it.
     */
    public initialize() {
        const startTime = performance.now();
        let { user_version: schemaVersion } = this.db.getFirstSync("PRAGMA user_version;") as {
            user_version: number;
        };

        if (!schemaVersion) {
            schemaVersion = 0;

            // set the schema version
            this.db.execSync(`PRAGMA user_version = ${schemaVersion};`);
            this.db.execSync("PRAGMA journal_mode = WAL;");
        }

        console.log('current migration version', schemaVersion);

        if (!schemaVersion || Number(schemaVersion) < migrations.length) {
            console.log('need to run')
            this.db.withTransactionSync(() => {
                for (let i = Number(schemaVersion); i < migrations.length; i++) {
                    try {
                        console.log('running migration', i);
                        // Assuming migrations[i].up can run synchronously within a sync transaction
                        // If this causes issues, the migration functions themselves might need adjustment.
                        migrations[i].up(this.db);
                    } catch (e) {
                        console.error("error running migration", e);
                        throw e; // Re-throw to abort transaction
                    }
                    this.db.execSync(`PRAGMA user_version = ${i + 1};`);
                }

                // set the schema version
                this.db.execSync(`PRAGMA user_version = ${migrations.length};`);
            });
        } else {
            console.log('no need to run')
        }


        console.log('finished migrating')

        try {
            // load all the event timestamps
            const events = this.db.getAllSync("SELECT id, created_at FROM events") as {
                id: string;
                created_at: number;
            }[];
            for (const event of events) {
                this.knownEventTimestamps.set(event.id, event.created_at);
            }

            console.log('finished warming up event timestamps', this.knownEventTimestamps.size)

            this.loadUnpublishedEventsSync();
            console.log('finished loading unpulished events')
        } catch (e) {
            console.log('unable to warm up from cache')
        }

        const endTime = performance.now();
        console.log(`NDKCacheAdapterSqlite initialization took ${endTime - startTime}ms`);
    }

    /**
     * Runs the function only if the cache adapter is ready, if it's not ready,
     * it ignores the function.
     */

    query(subscription: NDKSubscription): NDKEvent[] {
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
            } else {
                console.log('\t👀 no logic on how to run this query in the sqlite cache', JSON.stringify(filter));
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
            for (const [_index, { query, params }] of bufferCopy.entries()) {
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

    async setEvent(event: NDKEvent, _filters: NDKFilter[], relay?: NDKRelay): Promise<void> {
        // No longer need onReady wrapper
        (async () => {
            const referenceId = event.isReplaceable() ? event.tagAddress() : event.id;
            const existingEvent = this.knownEventTimestamps.get(referenceId);
            if (existingEvent && existingEvent >= event.created_at!) return;

            this.knownEventTimestamps.set(referenceId, event.created_at!);

            if (event.isReplaceable()) {
                try {
                    this.bufferWrite("DELETE FROM events WHERE id = ?;", [referenceId]);
                    this.bufferWrite("DELETE FROM event_tags WHERE event_id = ?;", [referenceId]);
                } catch (e) {
                    console.error("error deleting event", e, referenceId);
                }
            }

            // this.bufferKinds.set(event.kind!, (this.bufferKinds.get(event.kind!) || 0) + 1);
            this.bufferWrite(
                "INSERT INTO events (id, created_at, pubkey, event, kind, relay) VALUES (?, ?, ?, ?, ?, ?);",
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
                        "INSERT INTO event_tags (event_id, tag, value) VALUES (?, ?, ?);",
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
        })();
    }

    async deleteEventIds(eventIds: NDKEventId[]): Promise<void> {
        // No longer need onReady wrapper
        (async () => {
            this.bufferWrite(
                `DELETE FROM events WHERE id IN (${eventIds.map(() => "?").join(",")});`,
                eventIds
            );
            this.bufferWrite(
                `DELETE FROM event_tags WHERE event_id IN (${eventIds.map(() => "?").join(",")});`,
                eventIds
            );
        })();
    }

    fetchProfileSync(pubkey: Hexpubkey): NDKCacheEntry<NDKUserProfile> | null {

        let result: NDKSqliteProfileRecord | null = null;

        try {
            result = this.db.getFirstSync(
                "SELECT name, about, picture, banner, nip05, lud16, lud06, display_name, website, catched_at, created_at FROM profiles WHERE pubkey = ?;",
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
                return entry;
            } catch (_e) {
                console.error("failed to parse profile", result);
            }
        }

        return null;
    }

    async fetchProfile(pubkey: Hexpubkey): Promise<NDKCacheEntry<NDKUserProfile> | null> {
        // No longer need ifReady wrapper
        return await (async () => {
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
                    return entry;
                } catch (_e) {
                    console.error("failed to parse profile", result);
                }
            }

            return null;
        })();
    }

    async saveProfile(pubkey: Hexpubkey, profile: NDKUserProfile): Promise<void> {
        // No longer need onReady wrapper
        (async () => {
            // check if the profile we have is newer based on created_at
            const existingProfile = await this.fetchProfile(pubkey);
            if (
                existingProfile?.created_at &&
                profile.created_at &&
                existingProfile.created_at >= profile.created_at
            ) {
                return;
            }

            const now = this.nowSeconds();
            const _entry = { ...profile, fetchedAt: now };

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
        })();
    }

    private _unpublishedEvents: LoadedUnpublishedEvent[] = [];

    private _addUnpublishedEvent(event: NDKEvent, relays: WebSocket["url"][], lastTryAt: number) {
        if (this.unpublishedEventIds.has(event.id)) return;
        this.unpublishedEventIds.add(event.id);
        this._unpublishedEvents.push({ event, relays, lastTryAt });

        const onPublished = (_relay: NDKRelay) => {
            this.discardUnpublishedEvent(event.id);
            event.off("published", onPublished);
        };

        event.on("published", onPublished);
    }

    addUnpublishedEvent(event: NDKEvent, relayUrls: WebSocket["url"][]): void {
        if (this.unpublishedEventIds.has(event.id)) return;
        this._addUnpublishedEvent(event, relayUrls, Date.now());

        this.setEvent(event, []);
        // No longer need onReady wrapper
        (async () => {
            const relayStatus: { [key: string]: boolean } = {};
            relayUrls.forEach((url) => (relayStatus[url] = false));

            try {
                // console.log(`[${Date.now()}] [SQLITE] write unpublished event`, event.kind);
                this.db.runAsync(
                    "INSERT INTO unpublished_events (id, event, relays, last_try_at) VALUES (?, ?, ?, ?);",
                    [event.id, event.serialize(true, true), JSON.stringify(relayStatus), Date.now()]
                );
            } catch (e) {
                console.error("error adding unpublished event", e);
            }
        })();
    }

    async getUnpublishedEvents(): Promise<
        { event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]
    > {
        // Removed onReady wrapper and related logic.
        // Returning empty array as this._unpublishedEvents is not defined.
        // TODO: Review the logic for retrieving unpublished events.
        return Promise.resolve([]);
    }

    /**
     * This loads the unpublished events from the database into _unpublishedEvents.
     *
     * This should be called during initialization.
     */
    private loadUnpublishedEventsSync() {
        const events = this.db.getAllSync(
            "SELECT * FROM unpublished_events"
        ) as UnpublishedEventRecord[];
        for (const event of events) {
            const deserializedEvent = new NDKEvent(undefined, deserialize(event.event));
            const relays = JSON.parse(event.relays);
            this._addUnpublishedEvent(deserializedEvent, Object.keys(relays), event.last_try_at);
        }
    }

    discardUnpublishedEvent(eventId: NDKEventId): void {
        this.unpublishedEventIds.delete(eventId);
        // No longer need onReady wrapper
        (() => {
            // console.log(`[${Date.now()}] [SQLITE] delete unpublished event`, eventId);
            this.db.runAsync("DELETE FROM unpublished_events WHERE id = ?;", [eventId]);
        })();
    }

    async saveWot(wot: Map<Hexpubkey, number>) {
        // No longer need onReady wrapper
        (async () => {
            this.db.runSync("DELETE FROM wot;");
            for (const [pubkey, value] of wot) {
                this.db.runSync("INSERT INTO wot (pubkey, wot) VALUES (?, ?);", [pubkey, value]);
            }
        })();
    }

    async fetchWot(): Promise<Map<Hexpubkey, number>> {
        // No longer need onReady wrapper
        return await (async () => {
            const wot = (await this.db.getAllAsync("SELECT * FROM wot")) as {
                pubkey: string;
                wot: number;
            }[];
            return new Map(wot.map((wot) => [wot.pubkey, wot.wot]));
        })();
    }

    async clear() {
        // No longer need onReady wrapper
        (() => {
            this.db.runSync("DELETE FROM wot;");
            this.db.runSync("DELETE FROM profiles;");
            this.db.runSync("DELETE FROM events;");
            this.db.runSync("DELETE FROM event_tags;");
            this.db.runSync("DELETE FROM unpublished_events;");
            this.db.runSync("DELETE FROM decrypted_events;");
            // Also clear nutzap state table if needed
            this.db.runSync("DELETE FROM nutzap_monitor_state;");
        })();
    }

    /**
     * Get an event from the database by ID.
     *
     * @param id - The ID of the event to get.
     * @returns The event, or null if it doesn't exist.
     */
    public getEventId(id: NDKEventId): NDKEvent | null {
        const row = this.db.getFirstSync("SELECT event FROM events WHERE id = ?;", [id]) as {
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
        filterFn?: (record: NDKSqliteEventRecord) => boolean
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

        try {
            const row = this.db.getFirstSync(
                "SELECT event FROM decrypted_events WHERE event_id = ?;",
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
        // No longer need onReady wrapper
        (() => {
            const now = Date.now();

            this.bufferWrite(
                `INSERT OR REPLACE INTO decrypted_events (
                    event_id,
                    event,
                    decrypted_at
                ) VALUES (?, ?, ?);`,
                [event.id, event.serialize(true, true), now]
            );
        })();
    }

    /**
     * Get the current timestamp in seconds
     * @returns Current timestamp in seconds
     */
    private nowSeconds(): number {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * Get the timestamp when a profile was last cached
     * @param pubkey - The public key of the user
     * @returns Timestamp in seconds when the profile was cached, or null if not found
     */
    public getProfileCacheTimestamp(pubkey: Hexpubkey): number | null {
        try {
            const result = this.db.getFirstSync(
                "SELECT catched_at FROM profiles WHERE pubkey = ?;",
                [pubkey]
            ) as { catched_at: number } | undefined;

            return result ? result.catched_at : null;
        } catch (e) {
            console.error("Error getting profile cache timestamp", e);
            return null;
        }
    }

    /**
     * Update the cache timestamp for a profile
     * Used when checking for updates but not finding anything newer
     * @param pubkey - The user's public key
     */
    public updateProfileCacheTimestamp(pubkey: Hexpubkey): void {
        try {
            const now = this.nowSeconds();
            this.db.runSync("UPDATE profiles SET catched_at = ? WHERE pubkey = ?;", [now, pubkey]);
        } catch (e) {
            console.error("Error updating profile cache timestamp", e);
        }
    }

    /**
     * Sets the state of a nutzap in the cache.
     * This method prepares the update using prepareNutzapStateUpdate and then buffers the write.
     * @param id The ID of the nutzap event.
     * @param stateChange The partial state change to apply.
     */
    public async setNutzapState(id: NDKEventId, stateChange: Partial<NDKNutzapState>): Promise<void> {
        const updateDetails = await prepareNutzapStateUpdate.call(this, id, stateChange);

        if (updateDetails) {
            this.bufferWrite(updateDetails.query, updateDetails.params);
        }
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
                if (now > Number.parseInt(expiration)) continue;
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
