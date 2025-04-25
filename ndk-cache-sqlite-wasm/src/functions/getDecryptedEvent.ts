import type { NDKEvent, NDKEventId } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves a decrypted event by ID from the SQLite WASM database.
 */
export function getDecryptedEvent(
    this: NDKCacheAdapterSqliteWasm,
    eventId: NDKEventId
): NDKEvent | null {
    const stmt = "SELECT event FROM decrypted_events WHERE id = ? LIMIT 1";
    const result = this.db.exec(stmt, [eventId]);
    if (result && result[0] && result[0].values && result[0].values[0]) {
        const eventStr = result[0].values[0][0];
        try {
            return JSON.parse(eventStr);
        } catch {
            return null;
        }
    }
    return null;
}