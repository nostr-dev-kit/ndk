import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Updates relay status information in the SQLite database.
 */
export function updateRelayStatus(this: NDKCacheAdapterSqlite, relayUrl: string, info: NDKCacheRelayInfo): void {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = `
        INSERT OR REPLACE INTO relay_status (url, last_connected_at, dont_connect_before)
        VALUES (?, ?, ?)
    `;

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        prepared.run(relayUrl, info.lastConnectedAt || null, info.dontConnectBefore || null);
    } catch (e) {
        console.error("Error updating relay status:", e);
    }
}
