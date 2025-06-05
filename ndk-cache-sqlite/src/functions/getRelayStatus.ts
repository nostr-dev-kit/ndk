import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Gets relay status information from the SQLite database.
 */
export function getRelayStatus(this: NDKCacheAdapterSqlite, relayUrl: string): NDKCacheRelayInfo | undefined {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = "SELECT last_connected_at, dont_connect_before FROM relay_status WHERE url = ? LIMIT 1";

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        const result = prepared.get(relayUrl) as
            | {
                  last_connected_at?: number;
                  dont_connect_before?: number;
              }
            | undefined;

        if (result) {
            return {
                lastConnectedAt: result.last_connected_at || undefined,
                dontConnectBefore: result.dont_connect_before || undefined,
            };
        }
        return undefined;
    } catch (e) {
        console.error("Error getting relay status:", e);
        return undefined;
    }
}
