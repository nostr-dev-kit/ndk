import type { NDKEvent, NDKRelay } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Handles duplicate events by recording relay provenance.
 * Only tracks the relay in the event_relays table.
 */
function setEventDupSync(db: any, event: NDKEvent | any, relay?: NDKRelay | { url: string }): void {
    if (relay?.url) {
        db.run("INSERT OR IGNORE INTO event_relays (event_id, relay_url, seen_at) VALUES (?, ?, ?)", [
            event.id,
            relay.url,
            Date.now(),
        ]);
    }
}

export async function setEventDup(
    this: NDKCacheAdapterSqliteWasm,
    event: NDKEvent,
    relay: NDKRelay,
): Promise<void> {
    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "setEventDup",
            payload: {
                eventId: event.id,
                relayUrl: relay.url,
            },
        });
    } else {
        if (!this.db) throw new Error("DB not initialized");
        setEventDupSync(this.db, event, relay);
    }
}

export { setEventDupSync };
