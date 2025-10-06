import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Adds an unpublished event to the SQLite WASM database.
 * @param event The event to add
 * @param relayUrls Array of relay URLs
 * @param lastTryAt Timestamp of last try
 */
export function addUnpublishedEvent(
    this: NDKCacheAdapterSqliteWasm,
    event: NDKEvent,
    relayUrls: string[],
    lastTryAt: number = Date.now(),
): void {
    if (!this.db) throw new Error("Database not initialized");
    const stmt = `
        INSERT OR REPLACE INTO unpublished_events (
            id, event, relays, lastTryAt
        ) VALUES (?, ?, ?, ?)
    `;
    this.db.run(stmt, [event.id, event.serialize(true, true), JSON.stringify(relayUrls), lastTryAt]);
}
