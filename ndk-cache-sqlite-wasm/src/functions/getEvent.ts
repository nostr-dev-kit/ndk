import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves an event by ID from the SQLite WASM database.
 */
export async function getEvent(
    this: NDKCacheAdapterSqliteWasm,
    id: string
): Promise<NDKEvent | null> {
    // Query for the event by ID
    const stmt = "SELECT raw FROM events WHERE id = ? AND deleted = 0 LIMIT 1";
    const result = this.db.exec(stmt, [id]);
    if (result && result[0] && result[0].values && result[0].values[0]) {
        const raw = result[0].values[0][0];
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }
    return null;
}