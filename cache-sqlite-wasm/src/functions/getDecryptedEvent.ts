import { deserialize, NDKEvent, type NDKEventId } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Retrieves a decrypted event by ID from the SQLite WASM database via worker.
 */
export async function getDecryptedEvent(
    this: NDKCacheAdapterSqliteWasm,
    eventId: NDKEventId,
): Promise<NDKEvent | null> {
    await this.ensureInitialized();

    // If in degraded mode, return null (no cache available)
    if (this.degradedMode) return null;

    const result = await this.postWorkerMessage<{ event?: string }>({
        type: "getDecryptedEvent",
        payload: { wrapperId: eventId },
    });

    if (result && result.event) {
        try {
            const nostrEvent = deserialize(result.event);
            return new NDKEvent(this.ndk, nostrEvent);
        } catch (e) {
            console.error("[getDecryptedEvent] Parse error:", e);
            return null;
        }
    }
    return null;
}
