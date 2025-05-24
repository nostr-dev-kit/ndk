import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves all unpublished events from the SQLite WASM database.
 * Returns an array of { event, relays, lastTryAt }
 */
export async function getUnpublishedEvents(
    this: NDKCacheAdapterSqliteWasm,
): Promise<{ event: NDKEvent; relays?: string[]; lastTryAt?: number }[]> {
    if (!this.db) throw new Error("Database not initialized");

    const events: { event: NDKEvent; relays?: string[]; lastTryAt?: number }[] = [];
    const stmt = "SELECT id, event, relays, lastTryAt FROM unpublished_events";
    const results = this.db.exec(stmt);

    if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
        for (const row of results[0].values) {
            const [id, eventStr, relaysStr, lastTryAt] = row;
            try {
                const event = JSON.parse(eventStr as string);
                const relays = relaysStr ? JSON.parse(relaysStr as string) : [];
                events.push({ event, relays, lastTryAt: lastTryAt as number });
            } catch {
                // skip invalid
            }
        }
    }
    return events;
}
