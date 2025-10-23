import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Removes an unpublished event from the SQLite WASM database by event ID via worker.
 */
export async function discardUnpublishedEvent(this: NDKCacheAdapterSqliteWasm, eventId: string): Promise<void> {
    await this.ensureInitialized();

    await this.postWorkerMessage({
        type: "discardUnpublishedEvent",
        payload: { id: eventId },
    });
}
