import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Updates relay status in the SQLite WASM database.
 * Stores relay info as a JSON string in a dedicated table.
 * Merges metadata field with existing data.
 * Supports both worker and direct database modes.
 */
export async function updateRelayStatus(
    this: NDKCacheAdapterSqliteWasm,
    relayUrl: string,
    info: NDKCacheRelayInfo,
): Promise<void> {
    const createStmt = `
        CREATE TABLE IF NOT EXISTS relay_status (
            url TEXT PRIMARY KEY,
            info TEXT
        );
    `;
    const upsertStmt = `
        INSERT OR REPLACE INTO relay_status (url, info)
        VALUES (?, ?)
    `;

    // Get existing data to merge metadata
    const existing = await this.getRelayStatus(relayUrl);

    // Merge metadata and other fields
    const merged: NDKCacheRelayInfo = {
        ...existing,
        ...info,
        metadata: {
            ...existing?.metadata,
            ...info.metadata,
        },
    };

    // Remove undefined metadata keys to allow clearing
    if (merged.metadata) {
        for (const [key, value] of Object.entries(merged.metadata)) {
            if (value === undefined) {
                delete merged.metadata[key];
            }
        }
    }

    await this.ensureInitialized();

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "run",
            payload: {
                sql: createStmt,
                params: [],
            },
        });
        await this.postWorkerMessage({
            type: "run",
            payload: {
                sql: upsertStmt,
                params: [relayUrl, JSON.stringify(merged)],
            },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run(createStmt);
        this.db.run(upsertStmt, [relayUrl, JSON.stringify(merged)]);
    }
}
