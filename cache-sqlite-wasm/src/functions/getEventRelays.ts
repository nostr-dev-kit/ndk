import type { NDKCacheAdapterSqliteWasm } from "../index";
import type { QueryExecResult } from "../types";

export interface EventRelay {
    url: string;
    seenAt: number;
}

/**
 * Utility to normalize DB rows from `{ columns, values }` to array of objects.
 */
function normalizeDbRows(queryResults: QueryExecResult[]): Record<string, unknown>[] {
    if (!queryResults || queryResults.length === 0) {
        return [];
    }

    const queryResult = queryResults[0];
    if (!queryResult || !queryResult.columns || !queryResult.values) {
        return [];
    }

    const { columns, values } = queryResult;

    return values.map((row) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, idx) => {
            obj[col] = row[idx];
        });
        return obj;
    });
}

/**
 * Fetches relay provenance data for a batch of events.
 * Returns a map of event ID to array of relays where the event was seen.
 */
export async function getEventRelays(
    this: NDKCacheAdapterSqliteWasm,
    eventIds: string[],
): Promise<Map<string, EventRelay[]>> {
    if (eventIds.length === 0) return new Map();

    const placeholders = eventIds.map(() => "?").join(",");
    const sql = `
        SELECT event_id, relay_url, seen_at
        FROM event_relays
        WHERE event_id IN (${placeholders})
        ORDER BY event_id, seen_at ASC
    `;

    let rows: Array<{ event_id: string; relay_url: string; seen_at: number }>;

    await this.ensureInitialized();

    if (this.useWorker) {
        const result = await this.postWorkerMessage({
            type: "exec",
            payload: {
                sql,
                params: eventIds,
            },
        });
        rows = result as Array<{ event_id: string; relay_url: string; seen_at: number }>;
    } else {
        if (!this.db) throw new Error("DB not initialized");
        const queryResults = this.db.exec(sql, eventIds);
        const normalizedRows = normalizeDbRows(queryResults);
        rows = normalizedRows as Array<{ event_id: string; relay_url: string; seen_at: number }>;
    }

    const map = new Map<string, EventRelay[]>();
    for (const row of rows) {
        if (!map.has(row.event_id)) {
            map.set(row.event_id, []);
        }
        map.get(row.event_id)!.push({
            url: row.relay_url,
            seenAt: row.seen_at,
        });
    }

    return map;
}
