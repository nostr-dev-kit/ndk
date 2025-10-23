import type { NDKEvent, NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
import { NDKKind, profileFromEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Stores an event in the SQLite WASM database.
 */
/**
 * Adapted for Web Worker support: now always async.
 * If useWorker is true, sends command to worker; else, runs on main thread.
 */
function setEventSync(db: any, event: NDKEvent | any, relay?: NDKRelay | { url: string }): void {
    const stmt = `
        INSERT OR REPLACE INTO events (
            id, pubkey, created_at, kind, tags, content, sig, raw, deleted, relay_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const tags = JSON.stringify(event.tags ?? []);
    // Store the complete event as a JSON array: [id, pubkey, created_at, kind, tags, content, sig]
    const raw = JSON.stringify([
        event.id,
        event.pubkey,
        event.created_at,
        event.kind,
        event.tags ?? [],
        event.content,
        event.sig,
    ]);
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
        relay?.url ?? null,
    ];

    db.run(stmt, values);

    // Store event tags for efficient querying (only single-letter indexable tags)
    const seenKeys = new Set<string>();

    if (event.tags && event.tags.length > 0) {
        for (const tag of event.tags) {
            if (tag.length >= 2 && tag[0].length === 1) {
                const tagName = tag[0];
                const tagValue = tag[1] || null;
                const key = `${event.id}:${tagName}:${tagValue}`;

                // Check if we've already seen this exact combination
                if (seenKeys.has(key)) {
                    continue; // Skip duplicate
                }
                seenKeys.add(key);

                try {
                    db.run("INSERT OR IGNORE INTO event_tags (event_id, tag, value) VALUES (?, ?, ?)", [
                        event.id,
                        tagName,
                        tagValue,
                    ]);
                } catch (e) {
                    console.error('[setEventSync] Failed to insert tag:', tag, e);
                }
            }
        }
    }

    // Extract and save profile from kind:0 events
    if (event.kind === NDKKind.Metadata || event.kind === 0) {
        try {
            const profile = typeof event.content === "string" ? JSON.parse(event.content) : event.content;
            if (profile && event.pubkey) {
                db.run("INSERT OR REPLACE INTO profiles (pubkey, profile, updated_at) VALUES (?, ?, ?)", [
                    event.pubkey,
                    JSON.stringify(profile),
                    event.created_at ?? Date.now(),
                ]);
            }
        } catch (e) {
            // Invalid profile JSON, skip
        }
    }
}

export async function setEvent(
    this: NDKCacheAdapterSqliteWasm,
    event: NDKEvent,
    _filters: NDKFilter[],
    _relay?: NDKRelay,
): Promise<void> {
    // Ensure the adapter is initialized before trying to use it
    await this.ensureInitialized();

    if (this.useWorker) {
        // Worker mode: batch events to reduce worker communication
        await this.batchEvent({
            id: event.id,
            pubkey: event.pubkey,
            created_at: event.created_at,
            kind: event.kind,
            tags: event.tags,
            content: event.content,
            sig: event.sig,
        }, _relay?.url);
    } else {
        // Main thread: run directly
        if (!this.db) throw new Error("DB not initialized");
        setEventSync(this.db, event, _relay);
    }
}

export { setEventSync };
