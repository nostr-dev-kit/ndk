import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Gets relay status from the SQLite WASM database.
 * Reads relay info as a JSON string from the relay_status table.
 */
export function getRelayStatus(this: NDKCacheAdapterSqliteWasm, relayUrl: string): NDKCacheRelayInfo | undefined {
    const stmt = `
        CREATE TABLE IF NOT EXISTS relay_status (
            url TEXT PRIMARY KEY,
            info TEXT
        )
    `;
    if (!this.db) throw new Error("Database not initialized");

    // Create table if it doesn't exist
    this.db.run(stmt);

    const select = "SELECT info FROM relay_status WHERE url = ? LIMIT 1";
    const results = this.db.exec(select, [relayUrl]);
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
