import { NDK } from "../ndk";
import { Hexpubkey } from "../user";
import { getWriteRelaysFor } from "./read/with-authors";

export function getTopRelaysForAuthors(ndk: NDK, authors: Hexpubkey[]): WebSocket["url"][] {
    const relaysWithCount = new Map<WebSocket["url"], number>();

    authors.forEach((author) => {
        const writeRelays = getWriteRelaysFor(ndk, author);
        if (writeRelays) {
            writeRelays.forEach((relay) => {
                const count = relaysWithCount.get(relay) || 0;
                relaysWithCount.set(relay, count + 1);
            });
        }
    });

    /**
     * TODO: Here we are sorting the relays just by number of authors that write to them.
     * Here is the place where the relay scoring can be used to modify the weights of the relays.
     */

    // Sort the relays by the number of authors that write to them
    let sortedRelays = Array.from(relaysWithCount.entries()).sort((a, b) => b[1] - a[1]);

    return sortedRelays.map((entry) => entry[0]);
}
