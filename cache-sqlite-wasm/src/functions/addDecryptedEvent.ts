import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Adds a decrypted event to the SQLite WASM database.
 * Supports both worker and direct database modes.
 */
export async function addDecryptedEvent(this: NDKCacheAdapterSqliteWasm, event: NDKEvent): Promise<void> {
    const serialized = event.serialize(true, true);
    const stmt = `
        INSERT OR REPLACE INTO decrypted_events (
            id, event
        ) VALUES (?, ?)
    `;

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "run",
            payload: {
                sql: stmt,
                params: [event.id, serialized],
            },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run(stmt, [event.id, serialized]);
    }
}
