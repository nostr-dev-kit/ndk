import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves all unpublished events from the SQLite WASM database.
 * Returns an array of { event, relays, lastTryAt }
 */
export async function getUnpublishedEvents(
    this: NDKCacheAdapterSqliteWasm,
): Promise<{ event: NDKEvent; relays?: string[]; lastTryAt?: number }[]> {
    const stmt = "SELECT event, relays, lastTryAt FROM unpublished_events";
    const result = this.db.exec(stmt);
    const events = [];
    if (result && result[0] && result[0].values) {
        for (const row of result[0].values) {
            const [eventStr, relaysStr, lastTryAt] = row;
            try {
                const event = JSON.parse(eventStr);
                const relays = relaysStr ? JSON.parse(relaysStr) : [];
                events.push({ event, relays, lastTryAt });
            } catch {
                // skip invalid
            }
        }
    }
    return events;
}
