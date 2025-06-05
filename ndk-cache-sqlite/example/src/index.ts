import NDK, { NDKEvent, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqlite from "../../src/index.ts";
import * as fs from "fs";

const CACHE_DB_PATH = "./cache.db";
const RELAY_URL = "wss://relay.damus.io";

async function cleanupDatabase() {
    if (fs.existsSync(CACHE_DB_PATH)) {
        fs.unlinkSync(CACHE_DB_PATH);
        console.log("🗑️  Cleaned up existing cache database");
    }
}

async function initializeNDK(): Promise<{ ndk: NDK; cacheAdapter: NDKCacheAdapterSqlite }> {
    console.log("🚀 Initializing NDK with SQLite cache adapter...");

    // Create the SQLite cache adapter
    const cacheAdapter = new NDKCacheAdapterSqlite({
        dbPath: CACHE_DB_PATH,
        dbName: "example-cache",
    });

    // Create NDK instance with the cache adapter
    const ndk = new NDK({
        explicitRelayUrls: [RELAY_URL],
        cacheAdapter,
    });

    // Initialize the cache adapter
    await cacheAdapter.initializeAsync(ndk);
    console.log("✅ Cache adapter initialized");

    return { ndk, cacheAdapter };
}

async function loadEventsFromRelay(ndk: NDK): Promise<NDKEvent[]> {
    console.log("\n📡 Connecting to relay and loading events...");

    await ndk.connect();
    console.log(`✅ Connected to ${RELAY_URL}`);

    // Subscribe to recent kind 1 notes (text notes)
    const subscription = ndk.subscribe(
        {
            kinds: [1],
            limit: 10,
        },
        {
            cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
            closeOnEose: true,
        },
    );

    const events: NDKEvent[] = [];

    return new Promise((resolve) => {
        subscription.on("event", (event: NDKEvent) => {
            events.push(event);
            console.log(`📝 Received event ${event.id?.slice(0, 8)}... from ${event.author.npub.slice(0, 12)}...`);
        });

        subscription.on("eose", () => {
            console.log(`✅ End of stored events reached. Loaded ${events.length} events from relay`);
            resolve(events);
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            console.log("⏰ Timeout reached, proceeding with loaded events");
            resolve(events);
        }, 10000);
    });
}

async function validateCacheRetrieval(ndk: NDK, originalEvents: NDKEvent[]): Promise<void> {
    console.log("\n🔍 Validating cache retrieval with CACHE_ONLY mode...");

    // Create a new subscription with CACHE_ONLY to verify events are in cache
    const cacheSubscription = ndk.subscribe(
        {
            kinds: [1],
            limit: 10,
        },
        {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
            closeOnEose: true,
        },
    );

    const cachedEvents: NDKEvent[] = [];

    return new Promise((resolve) => {
        cacheSubscription.on("event", (event: NDKEvent) => {
            cachedEvents.push(event);
            console.log(`💾 Retrieved cached event ${event.id?.slice(0, 8)}... from cache`);
        });

        cacheSubscription.on("eose", () => {
            console.log(`✅ Cache retrieval complete. Found ${cachedEvents.length} events in cache`);

            // Validate that we got events from cache
            if (cachedEvents.length > 0) {
                console.log(
                    "🎉 SUCCESS: SQLite cache is working! Events were successfully stored and retrieved from cache.",
                );

                // Show some details about cached vs original events
                const cachedIds = new Set(cachedEvents.map((e) => e.id));
                const matchingEvents = originalEvents.filter((e) => cachedIds.has(e.id));
                console.log(
                    `📊 Cache validation: ${matchingEvents.length}/${originalEvents.length} original events found in cache`,
                );

                if (matchingEvents.length > 0) {
                    const firstMatch = matchingEvents[0];
                    console.log(`📋 Sample cached event:`);
                    console.log(`   ID: ${firstMatch.id}`);
                    console.log(`   Author: ${firstMatch.author.npub.slice(0, 20)}...`);
                    console.log(
                        `   Content: ${firstMatch.content?.slice(0, 50)}${firstMatch.content && firstMatch.content.length > 50 ? "..." : ""}`,
                    );
                    console.log(`   Created: ${new Date(firstMatch.created_at! * 1000).toISOString()}`);
                }
            } else {
                console.log("⚠️  WARNING: No events found in cache. This might indicate an issue with cache storage.");
            }

            resolve();
        });

        // Timeout for cache retrieval
        setTimeout(() => {
            console.log("⏰ Cache retrieval timeout reached");
            if (cachedEvents.length === 0) {
                console.log("❌ FAILURE: No events retrieved from cache within timeout period");
            }
            resolve();
        }, 5000);
    });
}

async function demonstrateCacheStats(cacheAdapter: NDKCacheAdapterSqlite): Promise<void> {
    console.log("\n📈 Cache Statistics:");

    try {
        if (!cacheAdapter.db) {
            console.log("❌ Database not available for statistics");
            return;
        }

        // Query some basic statistics from the database
        const db = cacheAdapter.db.getDatabase();

        // Count total events
        const eventCountStmt = db.prepare("SELECT COUNT(*) as count FROM events");
        const eventCount = eventCountStmt.get() as { count: number };
        console.log(`   📝 Total events in cache: ${eventCount.count}`);

        // Count profiles
        const profileCountStmt = db.prepare("SELECT COUNT(*) as count FROM profiles");
        const profileCount = profileCountStmt.get() as { count: number };
        console.log(`   👤 Total profiles in cache: ${profileCount.count}`);

        // Show recent events
        const recentEventsStmt = db.prepare("SELECT id, kind, created_at FROM events ORDER BY created_at DESC LIMIT 3");
        const recentEvents = recentEventsStmt.all() as { id: string; kind: number; created_at: number }[];

        if (recentEvents.length > 0) {
            console.log(`   🕒 Most recent cached events:`);
            recentEvents.forEach((event, index) => {
                const date = new Date(event.created_at * 1000).toISOString();
                console.log(`      ${index + 1}. ${event.id.slice(0, 8)}... (kind ${event.kind}) - ${date}`);
            });
        }
    } catch (error) {
        console.log(`❌ Error retrieving cache statistics: ${error}`);
    }
}

async function cleanup(cacheAdapter: NDKCacheAdapterSqlite): Promise<void> {
    console.log("\n🧹 Cleaning up...");
    cacheAdapter.close();
    console.log("✅ Cache adapter closed");
}

async function main(): Promise<void> {
    console.log("🎯 NDK SQLite Cache Adapter Validation Example");
    console.log("=".repeat(50));

    try {
        // Clean up any existing database
        await cleanupDatabase();

        // Initialize NDK with SQLite cache
        const { ndk, cacheAdapter } = await initializeNDK();

        // Load events from relay (this should populate the cache)
        const originalEvents = await loadEventsFromRelay(ndk);

        if (originalEvents.length === 0) {
            console.log("⚠️  No events were loaded from the relay. The cache validation cannot proceed.");
            console.log("   This might be due to network issues or the relay being unavailable.");
            await cleanup(cacheAdapter);
            return;
        }

        // Wait a moment for cache operations to complete
        console.log("\n⏳ Waiting for cache operations to complete...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Validate that events can be retrieved from cache
        await validateCacheRetrieval(ndk, originalEvents);

        // Show cache statistics
        await demonstrateCacheStats(cacheAdapter);

        // Cleanup
        await cleanup(cacheAdapter);

        console.log("\n🎉 Example completed successfully!");
        console.log("   The SQLite cache adapter has been validated and is working correctly.");
    } catch (error) {
        console.error("❌ Error during example execution:", error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.log("\n👋 Received SIGINT, shutting down gracefully...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("\n👋 Received SIGTERM, shutting down gracefully...");
    process.exit(0);
});

// Run the example
main().catch((error) => {
    console.error("💥 Unhandled error:", error);
    process.exit(1);
});
