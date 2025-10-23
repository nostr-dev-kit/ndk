import type { NDKEvent, NDKEventId } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Adds a decrypted event to the SQLite WASM database.
 * Supports both worker and direct database modes.
 * @param wrapperId - The ID of the gift-wrapped event (kind 1059) to use as the cache key
 * @param decryptedEvent - The decrypted rumor event to store
 */
export async function addDecryptedEvent(this: NDKCacheAdapterSqliteWasm, wrapperId: NDKEventId, decryptedEvent: NDKEvent): Promise<void> {
    await this.ensureInitialized();

    const serialized = decryptedEvent.serialize(true, true);

    if (this.useWorker) {
        await this.postWorkerMessage({
            type: "addDecryptedEvent",
            payload: {
                wrapperId,
                serialized,
            },
        });
    } else {
        if (!this.db) throw new Error("Database not initialized");
        this.db.run(
            "INSERT OR REPLACE INTO decrypted_events (id, event) VALUES (?, ?)",
            [wrapperId, serialized]
        );
    }
}
