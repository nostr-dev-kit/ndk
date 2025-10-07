import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Updates relay status in the SQLite WASM database.
 * Stores relay info as a JSON string in a dedicated table.
 * Supports both worker and direct database modes.
 */
export async function updateRelayStatus(this: NDKCacheAdapterSqliteWasm, relayUrl: string, info: NDKCacheRelayInfo): Promise<void> {
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
                params: [relayUrl, JSON.stringify(info)],
            },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run(createStmt);
        this.db.run(upsertStmt, [relayUrl, JSON.stringify(info)]);
    }
}
