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
    NDKTag,
    NDKEventId,
} from '@nostr-dev-kit/ndk';
import * as SQLite from 'expo-sqlite';
import { matchFilter } from 'nostr-tools';

const INDEXABLE_TAGS_LIMIT = 10;

type EventRecord = {
    id: string;
    created_at: number;
    pubkey: string;
    event: string;
    kind: number;
    relay: string;
};

type UnpublishedEventRecord = EventRecord & {
    relays: string;
    last_try_at: number;
};

type PendingCallback = (...arg: any) => any;

export class NDKCacheAdapterSqlite implements NDKCacheAdapter {
    readonly dbName: string;
    private db: SQLite.SQLiteDatabase;
    locking: boolean = false;
    ready: boolean = false;
    private pendingCallbacks: PendingCallback[] = [];

    constructor(dbName: string) {
        this.dbName = dbName ?? 'ndk-cache';
        this.initialize();
    }

    private async initialize() {
        this.db = await SQLite.openDatabaseAsync(this.dbName);
        const start = Date.now();

        await this.db.withTransactionAsync(async () => {
            // await Promise.all([
            //     this.db.execAsync(`DROP INDEX IF EXISTS idx_events_pubkey;`),
            //     this.db.execAsync(`DROP INDEX IF EXISTS idx_events_kind;`),
            //     this.db.execAsync(`DROP INDEX IF EXISTS idx_events_tags_tag;`),
            //     this.db.execAsync(`DROP TABLE IF EXISTS events;`),
            //     this.db.execAsync(`DROP TABLE IF EXISTS profiles;`),
            //     this.db.execAsync(`DROP TABLE IF EXISTS relay_status;`),
            //     this.db.execAsync(`DROP TABLE IF EXISTS event_tags;`)
            // ])
            await Promise.all([
                this.db.execAsync(
                    `CREATE TABLE IF NOT EXISTS unpublished_events (
                        id TEXT PRIMARY KEY,
                        event TEXT,
                        relays TEXT,
                        last_try_at INTEGER
                    );`
                ),

                this.db.execAsync(
                    `CREATE TABLE IF NOT EXISTS events (
                        id TEXT PRIMARY KEY,
                        created_at INTEGER,
                        pubkey TEXT,
                        event TEXT,
                        kind INTEGER,
                        relay TEXT
                    );`
                ),
                this.db.execAsync(
                    `CREATE TABLE IF NOT EXISTS profiles (
                        pubkey TEXT PRIMARY KEY,
                        profile TEXT,
                        catched_at INTEGER
                    );`
                ),
                this.db.execAsync(
                    `CREATE TABLE IF NOT EXISTS relay_status (
                        url TEXT PRIMARY KEY,
                        lastConnectedAt INTEGER,
                        dontConnectBefore INTEGER
                    );`
                ),
                // New table for event tags
                this.db.execAsync(
                    `CREATE TABLE IF NOT EXISTS event_tags (
                        event_id TEXT,
                        tag TEXT,
                        value TEXT,
                        PRIMARY KEY (event_id, tag)
                    );`
                ),
            ]);
        });

        await this.db.execAsync(`CREATE INDEX IF NOT EXISTS idx_events_pubkey ON events (pubkey);`);
        await this.db.execAsync(`CREATE INDEX IF NOT EXISTS idx_events_kind ON events (kind);`);
        await this.db.execAsync(`CREATE INDEX IF NOT EXISTS idx_events_tags_tag ON event_tags (tag);`);

        this.ready = true;
        this.locking = true;

        Promise.all(this.pendingCallbacks.map((f) => f()));
    }

    onReady(callback: () => void) {
        if (this.ready) {
            callback();
        } else {
            this.pendingCallbacks.unshift(callback);
        }
    }

    async query(subscription: NDKSubscription): Promise<void> {
        // Ensure the adapter is ready
        if (!this.ready) return;

        // Process filters from the subscription
        for (const filter of subscription.filters) {
            // Example: Fetch events by pubkey
            if (filter.authors) {
                const events = this.db.getAllSync(
                    `SELECT * FROM events WHERE pubkey IN (${filter.authors.map(() => '?').join(',')})`,
                    filter.authors
                ) as EventRecord[];
                if (events.length > 0) foundEvents(subscription, events, filter);
            }

            // Example: Fetch events by kind
            if (filter.kinds) {
                const events = this.db.getAllSync(
                    `SELECT * FROM events WHERE kind IN (${filter.kinds.map(() => '?').join(',')})`,
                    filter.kinds
                ) as EventRecord[];
                if (events.length > 0) foundEvents(subscription, events, filter);
            }
        }
    }

    async setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void> {
        const filterTags: [string, string][] = event.tags.filter((tag) => tag[0].length === 1).map((tag) => [tag[0], tag[1]]);
        await Promise.all([
            this.db.runAsync(`INSERT OR REPLACE INTO events (id, created_at, pubkey, event, kind, relay) VALUES (?, ?, ?, ?, ?, ?);`, [
                event.id,
                event.created_at!,
                event.pubkey,
                event.serialize(true, true),
                event.kind!,
                relay?.url || '',
            ]),
            filterTags.map((tag) =>
                // Use INSERT OR REPLACE to avoid UNIQUE constraint violation
                this.db.runAsync(`INSERT OR REPLACE INTO event_tags (event_id, tag, value) VALUES (?, ?, ?);`, [event.id, tag[0], tag[1]])
            ),
        ]);
    }

    async deleteEvent(event: NDKEvent): Promise<void> {
        await this.db.runAsync(`DELETE FROM events WHERE id = ?;`, [event.id]);
        await this.db.runAsync(`DELETE FROM event_tags WHERE event_id = ?;`, [event.id]);
    }

    async fetchProfile(pubkey: Hexpubkey): Promise<NDKCacheEntry<NDKUserProfile> | null> {
        if (!this.ready) return;

        const result = this.db.getAllSync(`SELECT profile, catched_at FROM profiles WHERE pubkey = ?;`, [pubkey]) as {
            profile: string;
            catched_at: number;
        }[];

        if (result.length > 0) {
            try {
                const profile = JSON.parse(result[0].profile);
                return { ...profile, fetchedAt: result[0].catched_at };
            } catch (e) {
                console.error('failed to parse profile', result[0].profile);
            }
        }
        return null;
    }

    saveProfile(pubkey: Hexpubkey, profile: NDKUserProfile): void {
        this.db.runAsync(`INSERT OR REPLACE INTO profiles (pubkey, profile, catched_at) VALUES (?, ?, ?);`, [
            pubkey,
            JSON.stringify(profile),
            Date.now(),
        ]);
    }

    addUnpublishedEvent(event: NDKEvent, relayUrls: WebSocket['url'][]): void {
        try {
            this.db.runSync(`INSERT OR REPLACE INTO unpublished_events (id, event, relays, last_try_at) VALUES (?, ?, ?, ?);`, [
                event.id,
                event.serialize(true, true),
                (relayUrls ?? []).join(','),
                Date.now(),
            ]);
        } catch (e) {
            console.error('error adding unpublished event', e);
        }
    }

    async getUnpublishedEvents(): Promise<{ event: NDKEvent; relays?: WebSocket['url'][]; lastTryAt?: number }[]> {
        const call = () => this._getUnpublishedEvents();

        if (!this.ready) {
            return new Promise((resolve, reject) => {
                this.pendingCallbacks.push(() => call().then(resolve).catch(reject));
            });
        } else {
            return call();
        }
    }

    async _getUnpublishedEvents(): Promise<{ event: NDKEvent; relays?: WebSocket['url'][]; lastTryAt?: number }[]> {
        const events = (await this.db.getAllAsync(`SELECT * FROM unpublished_events`)) as UnpublishedEventRecord[];
        return events.map((event) => {
            const deserializedEvent = new NDKEvent(undefined, deserialize(event.event));
            return {
                event: deserializedEvent,
                relays: event.relays.split(/,/),
                lastTryAt: event.last_try_at,
            };
        });
    }

    discardUnpublishedEvent(eventId: NDKEventId): void {
        this.db.runAsync(`DELETE FROM unpublished_events WHERE id = ?;`, [eventId]);
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
        console.error('failed to deserialize event', e, event);
    }
}
