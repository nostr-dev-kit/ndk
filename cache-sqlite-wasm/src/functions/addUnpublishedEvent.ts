import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqliteWasm } from "../index";

/**
 * Adds an unpublished event to the SQLite WASM database via worker.
 * @param event The event to add
 * @param relayUrls Array of relay URLs
 * @param lastTryAt Timestamp of last try
 */
export async function addUnpublishedEvent(
    this: NDKCacheAdapterSqliteWasm,
    event: NDKEvent,
    relayUrls: string[],
    lastTryAt: number = Date.now(),
): Promise<void> {
    await this.ensureInitialized();

    // If in degraded mode, silently skip caching
    if (this.degradedMode) return;

    await this.postWorkerMessage({
        type: "addUnpublishedEvent",
        payload: {
            id: event.id,
            event: event.serialize(true, true),
            relays: JSON.stringify(relayUrls),
        },
    });
}
