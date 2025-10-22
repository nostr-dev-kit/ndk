import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves all unpublished events from the SQLite WASM database.
 * Supports both worker and direct database modes.
 * Returns an array of { event, relays, lastTryAt }
 */
export async function getUnpublishedEvents(
    this: NDKCacheAdapterSqliteWasm,
): Promise<{ event: NDKEvent; relays?: string[]; lastTryAt?: number }[]> {
    const stmt = "SELECT id, event, relays, lastTryAt FROM unpublished_events";

    await this.ensureInitialized();

    if (this.useWorker) {
        const results = await this.postWorkerMessage<
            Array<{ id: string; event: string; relays: string; lastTryAt: number }>
        >({
            type: "all",
            payload: {
                sql: stmt,
                params: [],
            },
        });

        const events: { event: NDKEvent; relays?: string[]; lastTryAt?: number }[] = [];
        if (results) {
            for (const row of results) {
                try {
                    const event = JSON.parse(row.event);
                    const relays = row.relays ? JSON.parse(row.relays) : [];
                    events.push({ event, relays, lastTryAt: row.lastTryAt });
                } catch {
                    // skip invalid
                }
            }
        }
        return events;
    } else {
        if (!this.db) throw new Error("Database not initialized");

        const events: { event: NDKEvent; relays?: string[]; lastTryAt?: number }[] = [];
        const results = this.db.exec(stmt);

        if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
            for (const row of results[0].values) {
                const [id, eventStr, relaysStr, lastTryAt] = row;
                try {
                    const event = JSON.parse(eventStr as string);
                    const relays = relaysStr ? JSON.parse(relaysStr as string) : [];
                    events.push({ event, relays, lastTryAt: lastTryAt as number });
                } catch {
                    // skip invalid
                }
            }
        }
        return events;
    }
}
