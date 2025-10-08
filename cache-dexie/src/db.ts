import type { NDKEventId, NDKRawEvent, NDKRelayInformation, NDKUserProfile } from "@nostr-dev-kit/ndk";
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
    sig?: string;
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
    consecutiveFailures?: number;
    lastFailureAt?: number;
    nip11?: {
        data: NDKRelayInformation;
        fetchedAt: number;
    };
    metadata?: Record<string, Record<string, unknown>>;
}

export interface UnpublishedEvent {
    id: NDKEventId;
    event: NDKRawEvent;
    relays: Record<WebSocket["url"], boolean>;
    lastTryAt?: number;
}

export interface EventRelay {
    eventId: string;
    relayUrl: string;
    seenAt: number;
}

export class Database extends Dexie {
    profiles!: Table<Profile>;
    events!: Table<Event>;
    eventTags!: Table<EventTag>;
    nip05!: Table<Nip05>;
    lnurl!: Table<Lnurl>;
    relayStatus!: Table<RelayStatus>;
    unpublishedEvents!: Table<UnpublishedEvent>;
    eventRelays!: Table<EventRelay>;

    constructor(name: string) {
        super(name);
        this.version(17).stores({
            profiles: "&pubkey",
            events: "&id, kind",
            eventTags: "&tagValue",
            nip05: "&nip05",
            lnurl: "&pubkey",
            relayStatus: "&url",
            unpublishedEvents: "&id",
            eventRelays: "[eventId+relayUrl], eventId",
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
