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
} from '@nostr-dev-kit/ndk';
import { LRUCache } from 'typescript-lru-cache';
import * as SQLite from 'expo-sqlite';
import { matchFilter } from 'nostr-tools';
import { migrations } from './migrations';

type EventRecord = {
    id: string;
    created_at: number;
    pubkey: string;
    event: string;
    kind: number;
    relay: string;
};

type UnpublishedEventRecord = {
    id: string;
    event: string;
    relays: string; // JSON string of {[url: string]: boolean}
    last_try_at: number;
};

type PendingCallback = (...arg: any) => any;


export class NDKCacheAdapterSqlite implements NDKCacheAdapter {
    readonly dbName: string;
    public db: SQLite.SQLiteDatabase;
    locking: boolean = false;
    ready: boolean = false;
    private pendingCallbacks: PendingCallback[] = [];
    private profileCache: LRUCache<string, NDKCacheEntry<NDKUserProfile>>;
    private unpublishedEventIds: Set<string> = new Set();

    constructor(dbName: string, maxProfiles: number = 200) {
        this.dbName = dbName ?? 'ndk-cache';
        this.profileCache = new LRUCache({ maxSize: maxProfiles });
        this.initialize();
    }

    private async initialize() {
        this.db = SQLite.openDatabaseSync(this.dbName);

        try {
            let { user_version: schemaVersion } = (await this.db.getFirstAsync(`PRAGMA user_version;`)) as { user_version: number };
        } catch (e) {
            console.error('error getting schema version', e);
            return;
        }

        // get current schema version
        let { user_version: schemaVersion } = (this.db.getFirstSync(`PRAGMA user_version;`)) as { user_version: number };

        if (!schemaVersion) {
            schemaVersion = 0;

            // set the schema version
            await this.db.execAsync(`PRAGMA user_version = ${schemaVersion};`);
        }

        if (!schemaVersion || Number(schemaVersion) < migrations.length) {
            await this.db.withTransactionAsync(async () => {
                for (let i = Number(schemaVersion); i < migrations.length; i++) {
                    try {
                        await migrations[i].up(this.db);
                    } catch (e) {
                        console.error('error running migration', e);
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

        Promise.all(this.pendingCallbacks.map((f) => {
            try {
                return f();
            } catch (e) {
                console.error('error calling cache adapter pending callback', e);
            }
        }));
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

    async query(subscription: NDKSubscription): Promise<void> {
        this.onReady(() => {

            // Process filters from the subscription
            for (const filter of subscription.filters) {
                if (filter.authors) {
                    const events = this.db.getAllSync(
                        `SELECT * FROM events WHERE pubkey IN (${filter.authors.map(() => '?').join(',')})`,
                        filter.authors
                    ) as EventRecord[];
                    if (events.length > 0) foundEvents(subscription, events, filter);
                }

                if (filter.kinds) {
                    const events = this.db.getAllSync(
                        `SELECT * FROM events WHERE kind IN (${filter.kinds.map(() => '?').join(',')})`,
                        filter.kinds
                    ) as EventRecord[];
                    if (events.length > 0) foundEvents(subscription, events, filter);
                }

                for (const key in filter) {
                    if (key.startsWith('#') && key.length === 2) {
                        const tag = key[1];
                        const events = this.db.getAllSync(
                            `SELECT * FROM events INNER JOIN event_tags ON events.id = event_tags.event_id WHERE event_tags.tag = ? AND event_tags.value IN (${filter[key].map(() => '?').join(',')})`,
                            [tag, ...filter[key]]
                        ) as EventRecord[];
                        if (events.length > 0) foundEvents(subscription, events, filter);
                    }
                }
            }
        });
    }

    async setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void> {
        this.onReady(async () => {
            // is the event replaceable?
            if (event.isReplaceable()) {
                await Promise.all([
                    this.db.runAsync(`DELETE FROM events WHERE id = ?;`, [event.id]),
                    this.db.runAsync(`DELETE FROM event_tags WHERE event_id = ?;`, [event.id]),
                ]);
                return;
            }

            this.db.runAsync(`INSERT INTO events (id, created_at, pubkey, event, kind, relay) VALUES (?, ?, ?, ?, ?, ?);`, [
                event.id,
                event.created_at!,
                event.pubkey,
                event.serialize(true, true),
                event.kind!,
                relay?.url || '',
            ])

            const filterTags: [string, string][] = event.tags.filter((tag) => tag[0].length === 1).map((tag) => [tag[0], tag[1]]);
            if (filterTags.length < 10) {
                filterTags.forEach((tag) =>
                    this.db.runAsync(`INSERT INTO event_tags (event_id, tag, value) VALUES (?, ?, ?);`, [event.id, tag[0], tag[1]])
                )
            }

            // if this event is a delete event, see if the deleted events are in the cache and remove them
            if (event.kind === NDKKind.EventDeletion) {
                this.deleteEventIds(event.tags.filter((tag) => tag[0] === 'e').map((tag) => tag[1]));
            }
        });
    }

    async deleteEventIds(eventIds: NDKEventId[]): Promise<void> {
        this.onReady(async () => {
            await this.db.runAsync(`DELETE FROM events WHERE id IN (${eventIds.map(() => '?').join(',')});`, eventIds);
            await this.db.runAsync(`DELETE FROM event_tags WHERE event_id IN (${eventIds.map(() => '?').join(',')});`, eventIds);
        });
    }

    fetchProfileSync(pubkey: Hexpubkey): NDKCacheEntry<NDKUserProfile> | null {

        const cached = this.profileCache.get(pubkey);
        if (cached) {
            return cached;
        }

        if (!this.ready) return null;

        let result: { profile: string; catched_at: number } | null = null;

        try {
            result = this.db.getFirstSync(`SELECT profile, catched_at FROM profiles WHERE pubkey = ?;`, [pubkey]) as {
                profile: string;
                catched_at: number;
            };
        } catch (e) {
            console.error('error fetching profile', e, { pubkey });
            return null;
        }

        if (result) {
            try {
                const profile = JSON.parse(result.profile);
                const entry = { ...profile, fetchedAt: result.catched_at };
                this.profileCache.set(pubkey, entry);
                return entry;
            } catch (e) {
                console.error('failed to parse profile', result.profile);
            }
        }

        return null;
    }

    async fetchProfile(pubkey: Hexpubkey): Promise<NDKCacheEntry<NDKUserProfile> | null> {
        const cached = this.profileCache.get(pubkey);
        if (cached) {
            return cached;
        }

        return await this.ifReady(async () => {
            const result = await this.db.getFirstAsync(`SELECT profile, catched_at FROM profiles WHERE pubkey = ?;`, [pubkey]) as {
                profile: string;
                catched_at: number;
            };

            if (result) {
                try {
                    const profile = JSON.parse(result.profile);
                    const entry = { ...profile, fetchedAt: result.catched_at };
                    this.profileCache.set(pubkey, entry);
                    return entry;
                } catch (e) {
                    console.error('failed to parse profile', result.profile);
                }
            }

            return null;
        });
    }

    async saveProfile(pubkey: Hexpubkey, profile: NDKUserProfile): Promise<void> {
        this.onReady(async () => {
            // check if the profile we have is newer based on created_at
            const existingProfile = await this.fetchProfile(pubkey);
            if (existingProfile?.created_at && profile.created_at && existingProfile.created_at >= profile.created_at) {
                return;
            }

            const now = Date.now();
            const entry = { ...profile, fetchedAt: now };
            this.profileCache.set(pubkey, entry);

            this.db.runAsync(`INSERT OR REPLACE INTO profiles (pubkey, profile, catched_at, created_at) VALUES (?, ?, ?, ?);`, [
                pubkey,
                JSON.stringify(profile),
                now,
                profile.created_at,
            ]);

        });
    }

    addUnpublishedEvent(event: NDKEvent, relayUrls: WebSocket['url'][]): void {
        if (this.unpublishedEventIds.has(event.id)) return;
        this.unpublishedEventIds.add(event.id)
        this.setEvent(event, []);
        this.onReady(async () => {
            const relayStatus: { [key: string]: boolean } = {};
            relayUrls.forEach(url => relayStatus[url] = false);

            try {
                this.db.runAsync(`INSERT INTO unpublished_events (id, event, relays, last_try_at) VALUES (?, ?, ?, ?);`, [
                    event.id,
                    event.serialize(true, true),
                    JSON.stringify(relayStatus),
                    Date.now(),
                ]);

                const onPublished = (relay: NDKRelay) => {
                    const url = relay.url;
                    const record = this.db.getFirstSync(
                        `SELECT relays FROM unpublished_events WHERE id = ?`,
                        [event.id]
                    ) as UnpublishedEventRecord | undefined;

                    if (!record) {
                        event.off('published', onPublished);
                        return;
                    }

                    const relays = JSON.parse(record.relays);
                    relays[url] = true;

                    const successWrites = Object.values(relays).filter(v => v).length;
                    const unsuccessWrites = Object.values(relays).length - successWrites;

                    if (successWrites >= 3 || unsuccessWrites === 0) {
                        this.discardUnpublishedEvent(event.id);
                        event.off('published', onPublished);
                    } else {
                        this.db.runSync(
                            `UPDATE unpublished_events SET relays = ? WHERE id = ?`,
                            [JSON.stringify(relays), event.id]
                        );
                    }
                };

                event.once('published', onPublished);
            } catch (e) {
                console.error('error adding unpublished event', e);
            }

        });
    }

    async getUnpublishedEvents(): Promise<{ event: NDKEvent; relays?: WebSocket['url'][]; lastTryAt?: number }[]> {
        return await this.onReady(async () => {
            const call = () => this._getUnpublishedEvents();

            if (!this.ready) {
                return new Promise((resolve, reject) => {
                    this.pendingCallbacks.push(() => call().then(resolve).catch(reject));
                });
            } else {
                const result = await call();
                return result;
            }
        });
    }

    private async _getUnpublishedEvents(): Promise<{ event: NDKEvent; relays?: WebSocket['url'][]; lastTryAt?: number }[]> {
        return await this.onReady(async () => {
            const events = (await this.db.getAllAsync(`SELECT * FROM unpublished_events`)) as UnpublishedEventRecord[];
            return events.map((event) => {
                const deserializedEvent = new NDKEvent(undefined, deserialize(event.event));
                const relays = JSON.parse(event.relays);
                return {
                    event: deserializedEvent,
                    relays: Object.keys(relays),
                    lastTryAt: event.last_try_at,
                };
            });
        });
    }

    discardUnpublishedEvent(eventId: NDKEventId): void {
        this.unpublishedEventIds.delete(eventId);
        this.onReady(() => {
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
            const wot = (await this.db.getAllAsync(`SELECT * FROM wot`)) as { pubkey: string; wot: number }[];
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
        });
    }
}

export function foundEvents(subscription: NDKSubscription, events: EventRecord[], filter?: NDKFilter) {
    // if we have a limit, sort and slice
    if (filter?.limit && events.length > filter.limit) {
        events = events.sort((a, b) => b.created_at - a.created_at).slice(0, filter.limit);
    }

    for (const event of events) {
        foundEvent(subscription, event, event.relay, filter);
    }
}

export function foundEvent(subscription: NDKSubscription, event: EventRecord, relayUrl: WebSocket['url'] | undefined, filter?: NDKFilter) {
    try {
        const deserializedEvent = deserialize(event.event);

        if (filter && !matchFilter(filter, deserializedEvent as any)) return;

        const ndkEvent = new NDKEvent(undefined, deserializedEvent);
        const relay = relayUrl ? subscription.pool.getRelay(relayUrl, false) : undefined;
        ndkEvent.relay = relay;
        subscription.eventReceived(ndkEvent, relay, true);
    } catch (e) {
        const error = new Error();
        const backtraceAsString = JSON.stringify(error.stack);
        console.error('failed to deserialize event', e, event, backtraceAsString);
    }
}
