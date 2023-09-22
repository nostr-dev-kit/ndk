import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
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

export class Database extends Dexie {
    users!: Table<User>;
    events!: Table<Event>;
    eventTags!: Table<EventTag>;

    constructor(name: string) {
        super(name);
        this.version(4).stores({
            users: "&pubkey, profile, createdAt",
            events: "&id, pubkey, content, kind, createdAt, relay, [kind+pubkey]",
            eventTags: "id, tagValue, tag, value, eventId",
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
