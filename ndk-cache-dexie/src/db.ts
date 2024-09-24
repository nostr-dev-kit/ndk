import type { NDKEvent, NDKEventId, NDKUser, NDKUserProfile, NostrEvent } from "@nostr-dev-kit/ndk";
import Dexie, { type Table } from "dexie";

export interface Profile extends NDKUserProfile {
    pubkey: string;
    cachedAt: number;
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
    id: NDKEventId;
    event: NostrEvent;
    relays: Record<WebSocket["url"], boolean>;
    lastTryAt?: number;
}

export class Database extends Dexie {
    profiles!: Table<Profile>;
    events!: Table<Event>;
    eventTags!: Table<EventTag>;
    nip05!: Table<Nip05>;
    lnurl!: Table<Lnurl>;
    relayStatus!: Table<RelayStatus>;
    unpublishedEvents!: Table<UnpublishedEvent>;

    constructor(name: string) {
        super(name);
        this.version(15).stores({
            profiles: "&pubkey",
            events: "&id, kind",
            eventTags: "&tagValue",
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
