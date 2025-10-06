import type { NDKEvent, NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
import type { DatabaseWrapper } from "../db/database";

/**
 * Stores an event in the SQLite database using better-sqlite3.
 */
export async function setEvent(
    this: { db?: DatabaseWrapper },
    event: NDKEvent,
    _filters: NDKFilter[],
    _relay?: NDKRelay,
): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");

    const stmt = `
        INSERT OR REPLACE INTO events (
            id, pubkey, created_at, kind, tags, content, sig, raw, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const tags = JSON.stringify(event.tags ?? []);
    const raw = JSON.stringify(event.rawEvent());
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

    try {
        const db = this.db.getDatabase();

        // Store the event
        const prepared = db.prepare(stmt);
        prepared.run(...values);

        // Store event tags for efficient querying
        if (event.tags && event.tags.length > 0) {
            const deleteTagsStmt = db.prepare("DELETE FROM event_tags WHERE event_id = ?");
            deleteTagsStmt.run(event.id);

            const insertTagStmt = db.prepare(
                "INSERT OR IGNORE INTO event_tags (event_id, tag, value) VALUES (?, ?, ?)",
            );

            for (const tag of event.tags) {
                if (tag.length >= 2) {
                    const tagName = tag[0];
                    const tagValue = tag[1];
                    insertTagStmt.run(event.id, tagName, tagValue);
                }
            }
        }
    } catch (e) {
        console.error("Error storing event:", e);
        throw e;
    }
}
