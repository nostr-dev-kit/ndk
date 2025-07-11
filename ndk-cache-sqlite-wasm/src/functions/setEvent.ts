import { type NDKEvent, type NDKFilter, type NDKRelay } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Stores an event in the SQLite WASM database.
 */
/**
 * Adapted for Web Worker support: now always async.
 * If useWorker is true, sends command to worker; else, runs on main thread.
 */
export async function setEvent(
    this: NDKCacheAdapterSqliteWasm,
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

    if (this.useWorker) {
        // Worker mode: send command, return promise
        await this.postWorkerMessage({
            type: "run",
            payload: {
                sql: stmt,
                params: values,
            },
        });
    } else {
        // Main thread: run directly, but still async for consistency
        if (!this.db) throw new Error("DB not initialized");
        try {
            this.db.run(stmt, values);
        } catch (e) {
            throw e;
        }
    }
}
