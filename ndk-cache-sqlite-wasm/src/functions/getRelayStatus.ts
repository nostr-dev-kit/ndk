import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Gets relay status from the SQLite WASM database.
 * Reads relay info as a JSON string from the relay_status table.
 */
export function getRelayStatus(
    this: NDKCacheAdapterSqliteWasm,
    relayUrl: string
): NDKCacheRelayInfo | undefined {
    const stmt = `
        CREATE TABLE IF NOT EXISTS relay_status (
            url TEXT PRIMARY KEY,
            info TEXT
        );
    `;
    this.db.run(stmt);
    const select = "SELECT info FROM relay_status WHERE url = ? LIMIT 1";
    const result = this.db.exec(select, [relayUrl]);
    if (result && result[0] && result[0].values && result[0].values[0]) {
        const infoStr = result[0].values[0][0];
        try {
            return JSON.parse(infoStr);
        } catch {
            return undefined;
        }
    }
    return undefined;
}