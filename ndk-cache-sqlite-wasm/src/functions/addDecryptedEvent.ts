import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Adds a decrypted event to the SQLite WASM database.
 */
export function addDecryptedEvent(
    this: NDKCacheAdapterSqliteWasm,
    event: NDKEvent
): void {
    const stmt = `
        INSERT OR REPLACE INTO decrypted_events (
            id, event
        ) VALUES (?, ?)
    `;
    this.db.run(stmt, [event.id, JSON.stringify(event)]);
}