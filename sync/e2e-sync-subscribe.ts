/**
 * E2E test for syncAndSubscribe function
 *
 * This script demonstrates the syncAndSubscribe pattern in action:
 * 1. Immediately starts live subscription
 * 2. Returns subscription right away (non-blocking)
 * 3. Background: syncs historical events from relays
 * 4. Shows progress via callbacks
 *
 * Run with: bun run e2e-sync-subscribe.ts <npub or hex pubkey>
 */

import NDKMemoryCacheAdapter from "@nostr-dev-kit/cache-memory";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { syncAndSubscribe } from "./src/sync-subscribe.js";

const RELAY_URLS = ["wss://relay.damus.io"];

async function main() {
    const userInput = process.argv[2];

    if (!userInput) {
        console.error("Usage: bun run e2e-sync-subscribe.ts <npub or hex pubkey>");
        console.error("Example: bun run e2e-sync-subscribe.ts npub1...");
        process.exit(1);
    }

    // Decode npub if provided
    let pubkey: string;
    if (userInput.startsWith("npub")) {
        const decoded = nip19.decode(userInput);
        if (decoded.type !== "npub") {
            console.error("Invalid npub");
            process.exit(1);
        }
        pubkey = decoded.data;
    } else {
        pubkey = userInput;
    }

    console.log("🚀 Starting syncAndSubscribe E2E test\n");
    console.log(`📝 User: ${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`);
    console.log(`🔗 Relays: ${RELAY_URLS.join(", ")}`);
    console.log(`💾 Cache: In-memory (LRU cache)\n`);

    // Setup NDK with memory cache adapter
    const cacheAdapter = new NDKMemoryCacheAdapter({ maxSize: 10000 });
    const ndk = new NDK({
        explicitRelayUrls: RELAY_URLS,
        cacheAdapter,
    });

    console.log("🔌 Connecting to relays...");
    await ndk.connect();

    // Wait a bit for relays to connect
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const connectedRelays = Array.from(ndk.pool?.relays.values() || []).filter((r) => r.status === 1); // CONNECTED = 1
    console.log(`✅ Connected to ${connectedRelays.length}/${RELAY_URLS.length} relays\n`);

    // Track events
    const events: NDKEvent[] = [];
    const eventIds = new Set<string>();
    let liveEventCount = 0;
    let syncEventCount = 0;
    const relayProgress: Map<string, number> = new Map();

    console.log("🎯 Starting syncAndSubscribe for kind 1 notes (last 24h)...\n");
    console.log("📡 LIVE SUBSCRIPTION ACTIVE - receiving new events immediately\n");

    const startTime = Date.now();
    const _oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

    const sub = await syncAndSubscribe.call(
        ndk,
        {
            authors: [pubkey],
            limit: 10,
        },
        {
            onEvent: (event) => {
                // Deduplicate
                if (eventIds.has(event.id)) return;
                eventIds.add(event.id);
                events.push(event);

                // Determine if this is a live event or synced historical event
                const isLive = event.created_at! > Math.floor(startTime / 1000);
                if (isLive) {
                    liveEventCount++;
                    console.log(`  🔴 LIVE: ${event.content?.substring(0, 60)}...`);
                } else {
                    console.log(`  ⚪ SYNC: ${event.content?.substring(0, 60).replace(/\n/g, " ")}...`, {
                        startTime,
                    });
                    syncEventCount++;
                }
            },
            onRelaySynced: (relay, count) => {
                relayProgress.set(relay.url, count);
                console.log(`  ✓ Synced ${count} events from ${relay.url}`);
            },
            onSyncComplete: () => {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`\n✨ SYNC COMPLETE in ${elapsed}s`);
                console.log("\n📊 Final Stats:");
                console.log(`  Total events: ${events.length}`);
                console.log(`  From sync: ${syncEventCount}`);
                console.log(`  Live events: ${liveEventCount}`);
                console.log("\n🔍 Relay breakdown:");
                for (const [url, count] of relayProgress.entries()) {
                    console.log(`  ${url}: ${count} events`);
                }

                if (events.length > 0) {
                    console.log("\n📝 Latest 5 events:");
                    events
                        .sort((a, b) => b.created_at! - a.created_at!)
                        .slice(0, 5)
                        .forEach((e, i) => {
                            const date = new Date(e.created_at! * 1000);
                            const preview = e.content?.substring(0, 80).replace(/\n/g, " ");
                            console.log(`  ${i + 1}. [${date.toLocaleString()}] ${preview}...`);
                        });
                }

                console.log("\n✅ E2E test complete!");
                console.log("💡 The subscription is still active and will receive new events.");
                console.log("   Try publishing a note and watch it appear here in real-time!\n");

                // Keep running to show live events
                console.log("⏳ Waiting for live events... (Ctrl+C to exit)");
            },
        },
    );

    console.log("⚡ Subscription returned immediately (non-blocking)");
    console.log("🔄 Background sync in progress...\n");

    // Show periodic status while syncing
    const statusInterval = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const synced = relayProgress.size;
        const total = RELAY_URLS.length;

        if (synced < total) {
            console.log(`⏱️  [${elapsed}s] Synced ${synced}/${total} relays, ${events.length} events so far...`);
        } else {
            clearInterval(statusInterval);
        }
    }, 3000);

    // Keep the script running to receive live events
    process.on("SIGINT", () => {
        console.log("\n\n👋 Stopping subscription...");
        clearInterval(statusInterval);
        sub.stop();
        process.exit(0);
    });
}

main().catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
});
