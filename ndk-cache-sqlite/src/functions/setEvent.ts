import { type NDKEvent, type NDKFilter, type NDKRelay } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Stores an event in the SQLite database using better-sqlite3.
 */
export async function setEvent(
    this: NDKCacheAdapterSqlite,
    event: NDKEvent,
    _filters: NDKFilter[],
    _relay?: NDKRelay,
): Promise<void> {
    const stmt = `
        INSERT OR REPLACE INTO events (
            id, pubkey, created_at, kind, tags, content, sig, raw, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const tags = JSON.stringify(event.tags ?? []);
    const raw = event.serialize(true, true);
    const values = [
        event.id ?? "",
        event.pubkey ?? "",
        event.created_at ?? 0,
        event.kind ?? 0,
        tags,
        event.content ?? "",
        event.sig ?? "",
        raw,
        0,
    ];

    if (!this.db) throw new Error("DB not initialized");

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        prepared.run(...values);
    } catch (e) {
        throw e;
    }
}
