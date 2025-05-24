import type { NDKEvent, NDKEventId } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves a decrypted event by ID from the SQLite WASM database.
 */
export function getDecryptedEvent(this: NDKCacheAdapterSqliteWasm, eventId: NDKEventId): NDKEvent | null {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = "SELECT event FROM decrypted_events WHERE id = ? LIMIT 1";
    const results = this.db.exec(stmt, [eventId]);
    if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
        const eventStr = results[0].values[0][0] as string;
        try {
            return JSON.parse(eventStr);
        } catch {
            return null;
        }
    } else {
        console.warn("[WASM] No decrypted event found for ID:", eventId);
    }
    return null;
}
