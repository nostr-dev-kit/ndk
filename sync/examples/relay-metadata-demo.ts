#!/usr/bin/env npx tsx

/**
 * Relay Metadata Caching Demo
 *
 * This example demonstrates:
 * 1. Persistent relay capability caching (NIP-77 support)
 * 2. NIP-11 relay information caching
 * 3. Connection failure tracking
 *
 * Run: npx tsx examples/relay-metadata-demo.ts
 */

import NDK from "../../core/dist/index.js";
import NDKCacheAdapterSqlite from "../../cache-sqlite/dist/index.js";
import { NDKSync } from "../dist/index.js";

const RELAY_URL = "wss://relay.damus.io";

async function main() {
    console.log("🧪 Relay Metadata Caching Demo\n");

    // Initialize NDK with SQLite cache
    const cacheAdapter = new NDKCacheAdapterSqlite({ dbName: "relay-metadata-demo" });
    await cacheAdapter.initializeAsync();

    const ndk = new NDK({
        explicitRelayUrls: [RELAY_URL],
        cacheAdapter,
    });

    await ndk.connect();
    console.log("✅ Connected to NDK\n");

    const relay = Array.from(ndk.pool?.relays?.values() || [])[0];
    if (!relay) {
        console.error("❌ No relay found");
        process.exit(1);
    }

    // Demo 1: NIP-11 Caching
    console.log("📋 Demo 1: NIP-11 Relay Information Caching");
    console.log("─".repeat(50));

    console.log("\n🔄 First fetch (will hit network)...");
    const start1 = Date.now();
    const info1 = await relay.fetchInfo();
    const duration1 = Date.now() - start1;
    console.log(`   Name: ${info1.name}`);
    console.log(`   Supported NIPs: ${info1.supported_nips?.join(", ") || "none"}`);
    console.log(`   Duration: ${duration1}ms\n`);

    console.log("🔄 Second fetch (should use cache)...");
    const start2 = Date.now();
    const info2 = await relay.fetchInfo();
    const duration2 = Date.now() - start2;
    console.log(`   Name: ${info2.name}`);
    console.log(`   Duration: ${duration2}ms (cached! 🚀)\n`);

    if (duration2 < duration1 / 10) {
        console.log("✅ Cache is working! Second fetch was much faster.\n");
    }

    // Demo 2: Sync Package Metadata (Negentropy Support)
    console.log("\n📋 Demo 2: Sync Package Metadata (Negentropy Support)");
    console.log("─".repeat(50));

    const sync = new NDKSync(ndk);

    console.log("\n🔄 First capability check (will hit network)...");
    const supportsNeg = await sync.checkRelaySupport(relay);
    console.log(`   Supports NIP-77 (Negentropy): ${supportsNeg ? "✅" : "❌"}\n`);

    console.log("🔄 Second capability check (should use cache)...");
    const start3 = Date.now();
    const supportsNeg2 = await sync.checkRelaySupport(relay);
    const duration3 = Date.now() - start3;
    console.log(`   Supports NIP-77 (Negentropy): ${supportsNeg2 ? "✅" : "❌"}`);
    console.log(`   Duration: ${duration3}ms (cached! 🚀)\n`);

    // Demo 3: View Cached Relay Status
    console.log("\n📋 Demo 3: Full Relay Status from Cache");
    console.log("─".repeat(50));

    const relayStatus = await cacheAdapter.getRelayStatus(RELAY_URL);
    if (relayStatus) {
        console.log("\n📊 Cached Relay Status:");
        console.log(`   Last Connected: ${relayStatus.lastConnectedAt ? new Date(relayStatus.lastConnectedAt).toISOString() : "never"}`);
        console.log(`   Consecutive Failures: ${relayStatus.consecutiveFailures || 0}`);

        if (relayStatus.nip11) {
            console.log(`\n   NIP-11 Data:`);
            console.log(`     Cached At: ${new Date(relayStatus.nip11.fetchedAt).toISOString()}`);
            console.log(`     Name: ${relayStatus.nip11.data.name}`);
            console.log(`     Software: ${relayStatus.nip11.data.software || "unknown"}`);
        }

        if (relayStatus.metadata?.sync) {
            console.log(`\n   Sync Package Metadata:`);
            console.log(`     Supports Negentropy: ${relayStatus.metadata.sync.supportsNegentropy ?? "unknown"}`);
            console.log(`     Last Checked: ${relayStatus.metadata.sync.lastChecked ? new Date(relayStatus.metadata.sync.lastChecked as number).toISOString() : "never"}`);
            if (relayStatus.metadata.sync.lastError) {
                console.log(`     Last Error: ${relayStatus.metadata.sync.lastError}`);
            }
        }
    }

    // Demo 4: Custom Package Metadata
    console.log("\n\n📋 Demo 4: Custom Package Metadata");
    console.log("─".repeat(50));

    console.log("\n📝 Storing custom auth and rate limiting metadata...");
    await cacheAdapter.updateRelayStatus(RELAY_URL, {
        metadata: {
            auth: {
                token: "AUTH_TOKEN_EXAMPLE",
                expiresAt: Date.now() + 3600000,
                lastAuthAt: Date.now(),
            },
            rateLimit: {
                requestCount: 42,
                windowStart: Date.now(),
                maxPerWindow: 100,
            },
        },
    });

    const relayStatus2 = await cacheAdapter.getRelayStatus(RELAY_URL);
    console.log("\n📊 Updated Relay Status:");
    console.log(`   Sync Metadata: ${relayStatus2?.metadata?.sync ? "✅ Present" : "❌ Missing"}`);
    console.log(`   Auth Metadata: ${relayStatus2?.metadata?.auth ? "✅ Present" : "❌ Missing"}`);
    console.log(`   Rate Limit Metadata: ${relayStatus2?.metadata?.rateLimit ? "✅ Present" : "❌ Missing"}`);

    if (relayStatus2?.metadata?.auth) {
        console.log(`\n   Auth Package Metadata:`);
        console.log(`     Token: ${(relayStatus2.metadata.auth.token as string).substring(0, 20)}...`);
        console.log(`     Expires: ${new Date(relayStatus2.metadata.auth.expiresAt as number).toISOString()}`);
    }

    if (relayStatus2?.metadata?.rateLimit) {
        console.log(`\n   Rate Limit Package Metadata:`);
        console.log(`     Request Count: ${relayStatus2.metadata.rateLimit.requestCount}`);
        console.log(`     Max Per Window: ${relayStatus2.metadata.rateLimit.maxPerWindow}`);
    }

    console.log("\n✨ Demo completed successfully!\n");
    console.log("💡 Key takeaways:");
    console.log("   • NIP-11 data is cached for 24 hours");
    console.log("   • Relay capability checks are cached for 1 hour");
    console.log("   • Multiple packages can store metadata without conflicts");
    console.log("   • Metadata persists across application restarts");

    cacheAdapter.close();
    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
});
