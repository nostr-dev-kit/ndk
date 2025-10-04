#!/usr/bin/env bun
import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { NDKWoT } from "./src/wot.js";
import { filterByWoT } from "./src/filter.js";

const EXPLICIT_RELAYS = ["wss://relay.damus.io", "wss://relay.primal.net", "wss://nos.lol", "wss://relay.nostr.band"];

interface Stats {
    eventsFilteredIn: number;
    eventsFilteredOut: number;
    authorsAllowed: Set<string>;
    authorsRejected: Set<string>;
}

async function main() {
    const userInput = process.argv[2];

    if (!userInput) {
        console.error("Usage: bun test-wot-filter.ts <npub or nip05>");
        process.exit(1);
    }

    const ndk = new NDK({ explicitRelayUrls: EXPLICIT_RELAYS });
    console.log("Connecting to relays...");
    await ndk.connect();

    let pubkey: string;

    if (userInput.startsWith("npub")) {
        const user = ndk.getUser({ npub: userInput });
        pubkey = user.pubkey;
        console.log(`Using npub: ${userInput}`);
        console.log(`Pubkey: ${pubkey}`);
    } else if (userInput.includes("@")) {
        console.log(`Resolving NIP-05: ${userInput}`);
        const profile = await ndk.getUserFromNip05(userInput);
        if (!profile) {
            console.error(`Failed to resolve NIP-05: ${userInput}`);
            process.exit(1);
        }
        pubkey = profile.pubkey;
        console.log(`Resolved to pubkey: ${pubkey}`);
    } else {
        pubkey = userInput;
        console.log(`Using pubkey: ${pubkey}`);
    }

    console.log("\nBuilding WOT graph (depth: 2, timeout: 30s)...");
    const wot = new NDKWoT(ndk, pubkey);
    await wot.load({
        depth: 2,
        maxFollows: 1000,
        timeout: 30000,
    });

    console.log(`WOT graph built with ${wot.size} users\n`);

    const stats: Stats = {
        eventsFilteredIn: 0,
        eventsFilteredOut: 0,
        authorsAllowed: new Set(),
        authorsRejected: new Set(),
    };

    console.log("Subscribing to events (kind 1)...\n");
    console.log("Stats will update every second:\n");

    const sub = ndk.subscribe({ kinds: [NDKKind.Text], limit: 0 }, { closeOnEose: false });

    sub.on("event", (event: NDKEvent) => {
        const filtered = filterByWoT(wot, [event], {
            maxDepth: 2,
            includeUnknown: false,
        });

        if (filtered.length > 0) {
            stats.eventsFilteredIn++;
            stats.authorsAllowed.add(event.pubkey);
        } else {
            stats.eventsFilteredOut++;
            stats.authorsRejected.add(event.pubkey);
        }
    });

    const displayStats = () => {
        process.stdout.write("\x1b[2J\x1b[0f");
        console.log("=== WOT Filter Test Stats ===\n");
        console.log(`Root User: ${userInput}`);
        console.log(`WOT Size: ${wot.size} users\n`);
        console.log("Events:");
        console.log(`  ✓ Filtered In:  ${stats.eventsFilteredIn}`);
        console.log(`  ✗ Filtered Out: ${stats.eventsFilteredOut}`);
        console.log(`  Total:          ${stats.eventsFilteredIn + stats.eventsFilteredOut}\n`);
        console.log("Authors:");
        console.log(`  ✓ Allowed:  ${stats.authorsAllowed.size}`);
        console.log(`  ✗ Rejected: ${stats.authorsRejected.size}`);
        console.log(`  Total:      ${stats.authorsAllowed.size + stats.authorsRejected.size}\n`);

        if (stats.authorsAllowed.size > 0) {
            console.log("Sample allowed authors:");
            const sample = Array.from(stats.authorsAllowed).slice(0, 5);
            for (const author of sample) {
                const distance = wot.getDistance(author);
                const score = wot.getScore(author);
                console.log(`  - ${author.substring(0, 8)}... (distance: ${distance}, score: ${score.toFixed(2)})`);
            }
        }

        console.log("\nPress Ctrl+C to stop");
    };

    setInterval(displayStats, 1000);

    process.on("SIGINT", () => {
        console.log("\n\nStopping...");
        sub.stop();
        process.exit(0);
    });
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
