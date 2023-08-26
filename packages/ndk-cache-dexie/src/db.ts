import Dexie, { type Table } from "dexie";

interface User {
    pubkey: string;
    npub: string;
    name?: string;
    displayName?: string;
    image?: string;
    banner?: string;
    bio?: string;
    nip05?: string;
    lud06?: string;
    lud16?: string;
    about?: string;
    zapService?: string;
    event: string;
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
        this.version(2).stores({
            users: "&pubkey, npub, name, displayName, image, banner, bio, nip05, lud06, lud16, about, zapService, event",
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
export function createDatabase(name: string) {
    db = new Database(name);
}
