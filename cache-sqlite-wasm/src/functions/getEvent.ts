import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves an event by ID from the SQLite WASM database.
 */
/**
 * Adapted for Web Worker support: now always async.
 * If useWorker is true, sends command to worker; else, runs on main thread.
 */
export async function getEvent(this: NDKCacheAdapterSqliteWasm, id: string): Promise<NDKEvent | null> {
    const stmt = "SELECT raw FROM events WHERE id = ? AND deleted = 0 LIMIT 1";
    await this.ensureInitialized();

    if (this.useWorker) {
        const result = await this.postWorkerMessage<{ raw?: string }>({
            type: "get",
            payload: {
                sql: stmt,
                params: [id],
            },
        });
        if (result && result.raw) {
            try {
                return JSON.parse(result.raw);
            } catch {
                return null;
            }
        }
        return null;
    } else {
        if (!this.db) throw new Error("DB not initialized");
        const results = this.db.exec(stmt, [id]);
        if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
            const raw = results[0].values[0][0] as string;
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        }
        return null;
    }
}
