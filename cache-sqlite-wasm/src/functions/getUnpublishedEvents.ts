import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves all unpublished events from the SQLite WASM database via worker.
 * Returns an array of { event, relays, lastTryAt }
 */
export async function getUnpublishedEvents(
    this: NDKCacheAdapterSqliteWasm,
): Promise<{ event: NDKEvent; relays?: string[]; lastTryAt?: number }[]> {
    await this.ensureInitialized();

    // If in degraded mode, return empty (no cache available)
    if (this.degradedMode) return [];

    const results = await this.postWorkerMessage<
        Array<{ id: string; event: string; relays: string; lastTryAt: number }>
    >({
        type: "getUnpublishedEvents",
        payload: {},
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
}
