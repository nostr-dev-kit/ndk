import type { NDK } from "../ndk";
import type { Hexpubkey } from "../user";
import { getRelaysForSync } from "./write";

export function getTopRelaysForAuthors(ndk: NDK, authors: Hexpubkey[]): WebSocket["url"][] {
    const relaysWithCount = new Map<WebSocket["url"], number>();

    authors.forEach((author) => {
        const writeRelays = getRelaysForSync(ndk, author);
        if (writeRelays) {
            writeRelays.forEach((relay) => {
                const count = relaysWithCount.get(relay) || 0;
                relaysWithCount.set(relay, count + 1);
            });
        }
    });

    if (ndk.thompsonSampler) {
        // Sample once per relay to ensure stable, transitive sort order
        const scored = Array.from(relaysWithCount.entries()).map(
            ([url, count]) => [url, ndk.thompsonSampler!.weightedScore(url, count)] as const,
        );
        return scored.sort((a, b) => b[1] - a[1]).map((e) => e[0]);
    }

    // Fallback: existing popularity sort (unchanged default behavior)
    const sortedRelays = Array.from(relaysWithCount.entries()).sort((a, b) => b[1] - a[1]);

    return sortedRelays.map((entry) => entry[0]);
}
