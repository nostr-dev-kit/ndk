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
    await this.ensureInitialized();

    // Check LRU cache first
    const cached = this.metadataCache?.getRelayInfo(relayUrl);
    if (cached) {
        return cached;
    }

    if (this.useWorker) {
        const result = await this.postWorkerMessage<{ info?: string }>({
            type: "getRelayStatus",
            payload: { relayUrl },
        });

        if (result && result.info) {
            try {
                const info = JSON.parse(result.info);
                // Update LRU cache
                this.metadataCache?.setRelayInfo(relayUrl, info);
                return info;
            } catch {
                return undefined;
            }
        }
        return undefined;
    } else {
        if (!this.db) throw new Error("Database not initialized");

        // Create table if it doesn't exist
        this.db.run("CREATE TABLE IF NOT EXISTS relay_status (url TEXT PRIMARY KEY, info TEXT)");

        const results = this.db.exec("SELECT info FROM relay_status WHERE url = ? LIMIT 1", [relayUrl]);
        if (results && results.length > 0 && results[0].values && results[0].values.length > 0) {
            const infoStr = results[0].values[0][0] as string;
            try {
                const info = JSON.parse(infoStr);
                // Update LRU cache
                this.metadataCache?.setRelayInfo(relayUrl, info);
                return info;
            } catch {
                return undefined;
            }
        }
        return undefined;
    }
}
