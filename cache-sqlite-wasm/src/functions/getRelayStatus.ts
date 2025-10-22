import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Gets relay status from the SQLite WASM database.
 * Reads relay info as a JSON string from the relay_status table.
 * Supports both worker and direct database modes.
 */
export async function getRelayStatus(
    this: NDKCacheAdapterSqliteWasm,
    relayUrl: string,
): Promise<NDKCacheRelayInfo | undefined> {
    const createStmt = `
        CREATE TABLE IF NOT EXISTS relay_status (
            url TEXT PRIMARY KEY,
            info TEXT
        )
    `;
    const selectStmt = "SELECT info FROM relay_status WHERE url = ? LIMIT 1";

    await this.ensureInitialized();

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "run",
            payload: {
                sql: createStmt,
                params: [],
            },
        });

        const result = await this.postWorkerMessage<{ info?: string }>({
            type: "get",
            payload: {
                sql: selectStmt,
                params: [relayUrl],
            },
        });

        if (result && result.info) {
            try {
                return JSON.parse(result.info);
            } catch {
                return undefined;
            }
        }
        return undefined;
    } else {
        if (!this.db) throw new Error("Database not initialized");

        // Create table if it doesn't exist
        this.db.run(createStmt);

        const results = this.db.exec(selectStmt, [relayUrl]);
        if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
            const infoStr = results[0].values[0][0] as string;
            try {
                return JSON.parse(infoStr);
            } catch {
                return undefined;
            }
        }
        return undefined;
    }
}
