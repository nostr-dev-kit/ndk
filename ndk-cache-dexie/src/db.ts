import type { NDKUserProfile, ProfilePointer } from "@nostr-dev-kit/ndk";
import Dexie, { type Table } from "dexie";

interface User {
    pubkey: string;
    profile: NDKUserProfile;
    createdAt: number;
}

interface Event {
    id: string;
    pubkey: string;
    content: string;
    kind: number;
    createdAt: number;
    relay?: string;
    event: string;
}

interface EventTag {
    id: string;
    eventId: string;
    tag: string;
    value: string;
    tagValue: string;
}

interface Nip05 {
    nip05: string;
    profile: string | null;
    fetchedAt: number;
}

interface Lnurl {
    pubkey: string;
    document: string | null;
    fetchedAt: number;
}

export class Database extends Dexie {
    users!: Table<User>;
    events!: Table<Event>;
    eventTags!: Table<EventTag>;
    nip05!: Table<Nip05>;
    lnurl!: Table<Lnurl>;

    constructor(name: string) {
        super(name);
        this.version(6).stores({
            users: "&pubkey, profile, createdAt",
            events: "&id, pubkey, content, kind, createdAt, relay, [kind+pubkey]",
            eventTags: "id, tagValue, tag, value, eventId",
            nip05: "&nip05, profile, fetchedAt",
            lnurl: "&pubkey, document, fetchedAt",
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
