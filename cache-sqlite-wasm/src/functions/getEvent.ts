import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves an event by ID from the SQLite WASM database via worker.
 */
export async function getEvent(this: NDKCacheAdapterSqliteWasm, id: string): Promise<NDKEvent | null> {
    await this.ensureInitialized();

    const result = await this.postWorkerMessage<{ raw?: string }>({
        type: "getEvent",
        payload: { id },
    });
    if (result && result.raw) {
        try {
            return JSON.parse(result.raw);
        } catch {
            return null;
        }
    }
    return null;
}
