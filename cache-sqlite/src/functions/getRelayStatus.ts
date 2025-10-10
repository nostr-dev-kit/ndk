import type { NDKCacheRelayInfo, NDKRelayInformation } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Gets relay status information from the SQLite database.
 */
export function getRelayStatus(this: NDKCacheAdapterSqlite, relayUrl: string): NDKCacheRelayInfo | undefined {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = `
        SELECT
            last_connected_at,
            dont_connect_before,
            consecutive_failures,
            last_failure_at,
            nip11_data,
            nip11_fetched_at,
            metadata
        FROM relay_status
        WHERE url = ?
        LIMIT 1
    `;

    try {
        const prepared = this.db.getDatabase().prepare(stmt);
        const result = prepared.get(relayUrl) as
            | {
                  last_connected_at?: number;
                  dont_connect_before?: number;
                  consecutive_failures?: number;
                  last_failure_at?: number;
                  nip11_data?: string;
                  nip11_fetched_at?: number;
                  metadata?: string;
              }
            | undefined;

        if (result) {
            const info: NDKCacheRelayInfo = {
                lastConnectedAt: result.last_connected_at || undefined,
                dontConnectBefore: result.dont_connect_before || undefined,
                consecutiveFailures: result.consecutive_failures || undefined,
                lastFailureAt: result.last_failure_at || undefined,
            };

            // Parse NIP-11 data if present
            if (result.nip11_data && result.nip11_fetched_at) {
                try {
                    info.nip11 = {
                        data: JSON.parse(result.nip11_data) as NDKRelayInformation,
                        fetchedAt: result.nip11_fetched_at,
                    };
                } catch (e) {
                    console.error("Error parsing NIP-11 data:", e);
                }
            }

            // Parse metadata if present
            if (result.metadata) {
                try {
                    info.metadata = JSON.parse(result.metadata) as Record<string, Record<string, unknown>>;
                } catch (e) {
                    console.error("Error parsing metadata:", e);
                }
            }

            return info;
        }
        return undefined;
    } catch (e) {
        console.error("Error getting relay status:", e);
        return undefined;
    }
}
