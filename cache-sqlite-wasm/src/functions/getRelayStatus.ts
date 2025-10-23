import type { NDKCacheRelayInfo } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Gets relay status from the SQLite WASM database via worker.
 * Reads relay info as a JSON string from the relay_status table.
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
}
