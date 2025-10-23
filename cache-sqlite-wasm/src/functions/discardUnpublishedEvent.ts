import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Removes an unpublished event from the SQLite WASM database by event ID.
 * Supports both worker and direct database modes.
 */
export async function discardUnpublishedEvent(this: NDKCacheAdapterSqliteWasm, eventId: string): Promise<void> {
    await this.ensureInitialized();

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "discardUnpublishedEvent",
            payload: { id: eventId },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run("DELETE FROM unpublished_events WHERE id = ?", [eventId]);
    }
}
