import type { NDKEvent, NDKEventId, NDKUserProfile, NostrEvent } from "@nostr-dev-kit/ndk";
import Dexie, { type Table } from "dexie";

export interface User {
    pubkey: string;
    profile: NDKUserProfile;
    createdAt: number;
}

export interface Event {
    id: string;
    pubkey: string;
    kind: number;
    createdAt: number;
    relay?: string;
    event: string;
}

export interface EventTag {
    eventId: string;
    tagValue: string;
}

export interface EventKind {
    eventId: string;
    kind: string;
}

export interface Nip05 {
    nip05: string;
    profile: string | null;
    fetchedAt: number;
}

export interface Lnurl {
    pubkey: string;
    document: string | null;
    fetchedAt: number;
}

export interface RelayStatus {
    url: string;
    updatedAt: number;
    lastConnectedAt?: number;
    dontConnectBefore?: number;
}

export interface UnpublishedEvent {
    event: NostrEvent;
    relays: Record<WebSocket["url"], boolean>;
    lastTryAt?: number;
}

export class Database extends Dexie {
    users!: Table<User>;
    events!: Table<Event>;
    eventTags!: Table<EventTag>;
    eventKinds!: Table<EventKind>;
    nip05!: Table<Nip05>;
    lnurl!: Table<Lnurl>;
    relayStatus!: Table<RelayStatus>;
    unpublishedEvents!: Table<UnpublishedEvent & { id: NDKEventId }>;

    constructor(name: string) {
        super(name);
        this.version(14).stores({
            users: "&pubkey",
            events: "&id, kind",
            eventTags: "&tagValue",
            eventKinds: "&kind",
            nip05: "&nip05",
            lnurl: "&pubkey",
            relayStatus: "&url",
            unpublishedEvents: "&id",
        });
    }
}

export let db: Database;

/**
 * Create database
 *
 * @param name - Database name
 */
export function createDatabase(name: string): void {
    db = new Database(name);
}
