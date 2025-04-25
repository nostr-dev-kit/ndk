import type { NDKEvent, NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Stores an event in the SQLite WASM database.
 */
export async function setEvent(
    this: NDKCacheAdapterSqliteWasm,
    event: NDKEvent,
    _filters: NDKFilter[],
    _relay?: NDKRelay
): Promise<void> {
    // Serialize event as needed for storage
    const stmt = `
        INSERT OR REPLACE INTO events (
            id, pubkey, created_at, kind, tags, content, sig, raw, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const tags = JSON.stringify(event.tags ?? []);
    const raw = JSON.stringify(event);
    const values = [
        event.id,
        event.pubkey,
        event.created_at,
        event.kind,
        tags,
        event.content,
        event.sig,
        raw,
        0
    ];
    this.db.run(stmt, values);
}