import { NDKCacheAdapter, NDKFilter, NDKRelay, NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import _debug from "debug";
import { matchFilter } from "nostr-tools";

import { createDatabase, db } from "./db";

export { db } from "./db";

interface NDKCacheAdapterDexieOptions {
    /**
     * The name of the database to use
     */
    dbName?: string;

    /**
     * Debug instance to use for logging
     */
    debug?: debug.IDebugger;

    /**
     * The number of seconds to store events in Dexie (IndexedDB) before they expire
     * Defaults to 3600 seconds (1 hour)
     */
    expirationTime?: number;
}

export default class NDKCacheAdapterDexie implements NDKCacheAdapter {
    public debug: debug.Debugger;
    private expirationTime;
    readonly locking;

    constructor(opts: NDKCacheAdapterDexieOptions = {}) {
        createDatabase(opts.dbName || "ndk");
        this.debug = opts.debug || _debug("ndk:dexie-adapter");
        this.locking = true;
        this.expirationTime = opts.expirationTime || 3600;
    }

    public async query(subscription: NDKSubscription): Promise<void> {
        Promise.allSettled(
            subscription.filters.map((filter) => this.processFilter(filter, subscription))
        );
    }

    private async processFilter(filter: NDKFilter, subscription: NDKSubscription): Promise<void> {
        const filterKeys = Object.keys(filter || {}).sort();
        try {
            (await this.byKindAndAuthor(filterKeys, filter, subscription)) ||
                (await this.byAuthors(filterKeys, filter, subscription)) ||
                (await this.byKinds(filterKeys, filter, subscription)) ||
                (await this.byIdsQuery(filterKeys, filter, subscription)) ||
                (await this.byNip33Query(filterKeys, filter, subscription)) ||
                (await this.byTagsAndOptionallyKinds(filterKeys, filter, subscription));
        } catch (error) {
            console.error(error);
        }
    }

    public async setEvent(event: NDKEvent, _filter: NDKFilter, relay?: NDKRelay): Promise<void> {
        if (false) {
            // This is a user profile event, create/update a user.
            const user = new NDKUser({ hexpubkey: event.pubkey });
            const profile = profileFromEvent(event, {});

            db.users.put({
                pubkey: event.pubkey,
                npub: user.npub,
                name: profile.name,
                displayName: profile.displayName,
                image: profile.image,
                banner: profile.banner,
                bio: profile.bio,
                nip05: profile.nip05,
                lud06: profile.lud06,
                lud16: profile.lud16,
                about: profile.about,
                zapService: profile.zapService,
                event: JSON.stringify(event.rawEvent()),
            });
        } else {
            let addEvent = true;

            if (event.isParamReplaceable()) {
                const replaceableId = `${event.kind}:${event.pubkey}:${event.tagId()}`;
                const existingEvent = await db.events.where({ id: replaceableId }).first();
                if (
                    existingEvent &&
                    event.created_at &&
                    existingEvent.createdAt > event.created_at
                ) {
                    addEvent = false;
                }
            }

            if (addEvent) {
                db.events.put({
                    id: event.tagId(),
                    pubkey: event.pubkey,
                    content: event.content,
                    kind: event.kind as number,
                    createdAt: event.created_at as number,
                    relay: relay?.url,
                    event: JSON.stringify(event.rawEvent()),
                });

                // Don't cache contact lists as tags since it's expensive
                // and there is no use case for it
                if (event.kind !== 3) {
                    event.tags.forEach((tag) => {
                        if (tag[0].length !== 1) return;

                        db.eventTags.put({
                            id: `${event.id}:${tag[0]}:${tag[1]}`,
                            eventId: event.id,
                            tag: tag[0],
                            value: tag[1],
                            tagValue: tag[0] + tag[1],
                        });
                    });
                }
            }
        }
    }

    /**
     * Searches by authors
     */
    private async byAuthors(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["authors"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        let foundEvents = false;

        if (hasAllKeys && filter.authors) {
            for (const pubkey of filter.authors) {
                const events = await db.events.where({ pubkey }).toArray();
                for (const event of events) {
                    let rawEvent;
                    try {
                        rawEvent = JSON.parse(event.event);
                    } catch (e) {
                        console.log("failed to parse event", e);
                        continue;
                    }

                    const ndkEvent = new NDKEvent(undefined, rawEvent);
                    const relay = event.relay ? new NDKRelay(event.relay) : undefined;
                    subscription.eventReceived(ndkEvent, relay, true);
                    foundEvents = true;
                }
            }
        }
        return foundEvents;
    }

    /**
     * Searches by kinds
     */
    private async byKinds(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["kinds"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        let foundEvents = false;

        if (hasAllKeys && filter.kinds) {
            for (const kind of filter.kinds) {
                const events = await db.events.where({ kind }).toArray();
                for (const event of events) {
                    let rawEvent;
                    try {
                        rawEvent = JSON.parse(event.event);
                    } catch (e) {
                        console.log("failed to parse event", e);
                        continue;
                    }

                    const ndkEvent = new NDKEvent(undefined, rawEvent);
                    const relay = event.relay ? new NDKRelay(event.relay) : undefined;
                    subscription.eventReceived(ndkEvent, relay, true);
                    foundEvents = true;
                }
            }
        }
        return foundEvents;
    }

    /**
     * Searches by ids
     */
    private async byIdsQuery(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["ids"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        if (hasAllKeys && filter.ids) {
            for (const id of filter.ids) {
                const event = await db.events.where({ id }).first();
                if (!event) continue;

                let rawEvent;
                try {
                    rawEvent = JSON.parse(event.event);
                } catch (e) {
                    console.log("failed to parse event", e);
                    continue;
                }

                const ndkEvent = new NDKEvent(undefined, rawEvent);
                const relay = event.relay ? new NDKRelay(event.relay) : undefined;
                subscription.eventReceived(ndkEvent, relay, true);
            }

            return true;
        }

        return false;
    }

    /**
     * Searches by NIP-33
     */
    private async byNip33Query(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["#d", "authors", "kinds"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));

        if (hasAllKeys && filter.kinds && filter.authors) {
            for (const kind of filter.kinds) {
                const replaceableKind = kind >= 30000 && kind < 40000;

                if (!replaceableKind) continue;

                for (const author of filter.authors) {
                    for (const dTag of filter["#d"]) {
                        const replaceableId = `${kind}:${author}:${dTag}`;
                        const event = await db.events.where({ id: replaceableId }).first();
                        if (!event) continue;

                        let rawEvent;
                        try {
                            rawEvent = JSON.parse(event.event);
                        } catch (e) {
                            console.log("failed to parse event", e);
                            continue;
                        }

                        const ndkEvent = new NDKEvent(undefined, rawEvent);
                        const relay = event.relay ? new NDKRelay(event.relay) : undefined;
                        subscription.eventReceived(ndkEvent, relay, true);
                    }
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Searches by kind & author
     */
    private async byKindAndAuthor(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        const f = ["authors", "kinds"];
        const hasAllKeys = filterKeys.length === f.length && f.every((k) => filterKeys.includes(k));
        let foundEvents = false;

        if (!hasAllKeys) return false;

        if (filter.kinds && filter.authors) {
            for (const kind of filter.kinds) {
                for (const author of filter.authors) {
                    const events = await db.events.where({ kind, pubkey: author }).toArray();

                    for (const event of events) {
                        let rawEvent;
                        try {
                            rawEvent = JSON.parse(event.event);
                        } catch (e) {
                            console.log("failed to parse event", e);
                            continue;
                        }

                        const ndkEvent = new NDKEvent(undefined, rawEvent);
                        const relay = event.relay ? new NDKRelay(event.relay) : undefined;
                        subscription.eventReceived(ndkEvent, relay, true);
                        foundEvents = true;
                    }
                }
            }
        }
        return foundEvents;
    }

    /**
     * Searches by tags and optionally filters by tags
     */
    private async byTagsAndOptionallyKinds(
        filterKeys: string[],
        filter: NDKFilter,
        subscription: NDKSubscription
    ): Promise<boolean> {
        for (const filterKey of filterKeys) {
            const isKind = filterKey === "kinds";
            const isTag = filterKey.startsWith("#") && filterKey.length === 2;

            if (!isKind && !isTag) return false;
        }

        const events = await this.filterByTag(filterKeys, filter);
        const kinds = filter.kinds as number[];

        for (const event of events) {
            if (!kinds?.includes(event.kind as number)) continue;

            subscription.eventReceived(event, undefined, true);
        }

        return false;
    }

    private async filterByTag(filterKeys: string[], filter: NDKFilter): Promise<NDKEvent[]> {
        const retEvents: NDKEvent[] = [];

        for (const filterKey of filterKeys) {
            if (filterKey.length !== 2) continue;
            const tag = filterKey.slice(1);
            // const values = filter[filterKey] as string[];
            const values: string[] = [];
            for (const [key, value] of Object.entries(filter)) {
                if (key === filterKey) values.push(value as string);
            }

            for (const value of values) {
                const eventTags = await db.eventTags.where({ tagValue: tag + value }).toArray();
                if (!eventTags.length) continue;

                const eventIds = eventTags.map((t) => t.eventId);

                const events = await db.events.where("id").anyOf(eventIds).toArray();
                for (const event of events) {
                    let rawEvent;
                    try {
                        rawEvent = JSON.parse(event.event);

                        // Make sure all passed filters match the event
                        if (!matchFilter(filter, rawEvent)) continue;
                    } catch (e) {
                        console.log("failed to parse event", e);
                        continue;
                    }

                    const ndkEvent = new NDKEvent(undefined, rawEvent);
                    const relay = event.relay ? new NDKRelay(event.relay) : undefined;
                    ndkEvent.relay = relay;
                    retEvents.push(ndkEvent);
                }
            }
        }

        return retEvents;
    }
}

/**
 * Constructs a UserProfile from kind 0 event
 */
function profileFromEvent(event: NDKEvent, profile: NDKUserProfile): NDKUserProfile {
    const payload = JSON.parse(event.content);

    if (payload.name) profile.name = payload.name;
    if (payload.display_name) profile.displayName = payload.display_name;
    if (payload.displayName) profile.displayName = payload.displayName;
    if (payload.image) profile.image = payload.image;
    if (payload.picture) profile.image = payload.picture;
    if (payload.banner) profile.banner = payload.banner;
    if (payload.bio) profile.bio = payload.bio;
    if (payload.nip05) profile.nip05 = payload.nip05;
    if (payload.lud06) profile.lud06 = payload.lud06;
    if (payload.lud16) profile.lud16 = payload.lud16;
    if (payload.about) profile.about = payload.about;
    if (payload.zapService) profile.zapService = payload.zapService;

    return profile;
}
