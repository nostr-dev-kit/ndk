import type { DatabaseWrapper } from "../db/database";

export interface EventRelay {
    url: string;
    seenAt: number;
}

/**
 * Fetches relay provenance data for a batch of events.
 * Returns a map of event ID to array of relays where the event was seen.
 */
export function getEventRelays(db: DatabaseWrapper, eventIds: string[]): Map<string, EventRelay[]> {
    if (eventIds.length === 0) return new Map();

    const placeholders = eventIds.map(() => "?").join(",");
    const sql = `
        SELECT event_id, relay_url, seen_at
        FROM event_relays
        WHERE event_id IN (${placeholders})
        ORDER BY event_id, seen_at ASC
    `;

    const rows = db
        .getDatabase()
        .prepare(sql)
        .all(...eventIds) as Array<{
        event_id: string;
        relay_url: string;
        seen_at: number;
    }>;

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
