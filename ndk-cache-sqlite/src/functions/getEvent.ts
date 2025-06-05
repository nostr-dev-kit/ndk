import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Retrieves an event by ID from the SQLite database using better-sqlite3.
 */
export async function getEvent(this: NDKCacheAdapterSqlite, id: string): Promise<NDKEvent | null> {
    const stmt = "SELECT raw FROM events WHERE id = ? AND deleted = 0 LIMIT 1";

    if (!this.db) throw new Error("DB not initialized");

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        const result = prepared.get(id) as { raw?: string } | undefined;

        if (result && result.raw) {
            try {
                return JSON.parse(result.raw);
            } catch {
                return null;
            }
        }
        return null;
    } catch (e) {
        console.error("Error retrieving event:", e);
        return null;
    }
}
