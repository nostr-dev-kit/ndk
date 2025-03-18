import type { NDK } from "../ndk";
import type { Hexpubkey } from "../user";

/**
 * Gets write relays for a given pubkey as tracked by the outbox tracker.
 */
export function getRelaysForSync(
    ndk: NDK,
    author: Hexpubkey,
    type: "write" | "read" = "write"
): Set<WebSocket["url"]> | undefined {
    if (!ndk.outboxTracker) return undefined;

    const item = ndk.outboxTracker.data.get(author);
    if (!item) return undefined;

    if (type === "write") {
        return item.writeRelays;
    } else {
        return item.readRelays;
    }
}

/**
 * Gets write relays for a given pubkey as tracked by the outbox tracker.
 */
export async function getWriteRelaysFor(
    ndk: NDK,
    author: Hexpubkey,
    type: "write" | "read" = "write"
): Promise<Set<WebSocket["url"]> | undefined> {
    if (!ndk.outboxTracker) return undefined;
    if (!ndk.outboxTracker.data.has(author)) {
        await ndk.outboxTracker.trackUsers([author]);
    }

    return getRelaysForSync(ndk, author, type);
}
