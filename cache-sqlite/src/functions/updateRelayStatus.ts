import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "../index";

/**
 * Updates relay status information in the SQLite database.
 * Merges metadata field with existing data.
 */
export function updateRelayStatus(this: NDKCacheAdapterSqlite, relayUrl: string, info: NDKCacheRelayInfo): void {
    if (!this.db) throw new Error("Database not initialized");

    try {
        // Get existing data to merge metadata
        const existing = this.getRelayStatus(relayUrl);

        // Merge metadata
        const mergedMetadata = {
            ...existing?.metadata,
            ...info.metadata,
        };

        const stmt = `
            INSERT OR REPLACE INTO relay_status (
                url,
                last_connected_at,
                dont_connect_before,
                consecutive_failures,
                last_failure_at,
                nip11_data,
                nip11_fetched_at,
                metadata
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const prepared = this.db.getDatabase().prepare(stmt);
        prepared.run(
            relayUrl,
            info.lastConnectedAt ?? existing?.lastConnectedAt ?? null,
            info.dontConnectBefore ?? existing?.dontConnectBefore ?? null,
            info.consecutiveFailures ?? existing?.consecutiveFailures ?? null,
            info.lastFailureAt ?? existing?.lastFailureAt ?? null,
            info.nip11 ? JSON.stringify(info.nip11.data) : existing?.nip11 ? JSON.stringify(existing.nip11.data) : null,
            info.nip11?.fetchedAt ?? existing?.nip11?.fetchedAt ?? null,
            Object.keys(mergedMetadata).length > 0 ? JSON.stringify(mergedMetadata) : null,
        );
    } catch (e) {
        console.error("Error updating relay status:", e);
    }
}
