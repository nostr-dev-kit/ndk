import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Updates relay status in the SQLite WASM database.
 * Stores relay info as a JSON string in a dedicated table.
 */
export function updateRelayStatus(
    this: NDKCacheAdapterSqliteWasm,
    relayUrl: string,
    info: NDKCacheRelayInfo
): void {
    const stmt = `
        CREATE TABLE IF NOT EXISTS relay_status (
            url TEXT PRIMARY KEY,
            info TEXT
        );
    `;
    this.db.run(stmt);
    const upsert = `
        INSERT OR REPLACE INTO relay_status (url, info)
        VALUES (?, ?)
    `;
    this.db.run(upsert, [relayUrl, JSON.stringify(info)]);
}