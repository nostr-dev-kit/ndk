import type { NDKEvent, NDKEventId } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Adds a decrypted event to the SQLite WASM database via worker.
 * @param wrapperId - The ID of the gift-wrapped event (kind 1059) to use as the cache key
 * @param decryptedEvent - The decrypted rumor event to store
 */
export async function addDecryptedEvent(this: NDKCacheAdapterSqliteWasm, wrapperId: NDKEventId, decryptedEvent: NDKEvent): Promise<void> {
    await this.ensureInitialized();

    const serialized = decryptedEvent.serialize(true, true);

    await this.postWorkerMessage({
        type: "addDecryptedEvent",
        payload: {
            wrapperId,
            serialized,
        },
    });
}
