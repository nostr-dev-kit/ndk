import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Adds an unpublished event to the SQLite WASM database.
 * Supports both worker and direct database modes.
 * @param event The event to add
 * @param relayUrls Array of relay URLs
 * @param lastTryAt Timestamp of last try
 */
export async function addUnpublishedEvent(
    this: NDKCacheAdapterSqliteWasm,
    event: NDKEvent,
    relayUrls: string[],
    lastTryAt: number = Date.now(),
): Promise<void> {
    const stmt = `
        INSERT OR REPLACE INTO unpublished_events (
            id, event, relays, lastTryAt
        ) VALUES (?, ?, ?, ?)
    `;

    await this.ensureInitialized();

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "run",
            payload: {
                sql: stmt,
                params: [event.id, event.serialize(true, true), JSON.stringify(relayUrls), lastTryAt],
            },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run(stmt, [event.id, event.serialize(true, true), JSON.stringify(relayUrls), lastTryAt]);
    }
}
