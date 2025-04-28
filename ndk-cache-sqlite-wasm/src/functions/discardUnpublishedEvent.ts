import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Removes an unpublished event from the SQLite WASM database by event ID.
 */
export function discardUnpublishedEvent(this: NDKCacheAdapterSqliteWasm, eventId: string): void {
    if (!this.db) throw new Error("Database not initialized");
    const stmt = "DELETE FROM unpublished_events WHERE id = ?";
    this.db.run(stmt, [eventId]);
}
