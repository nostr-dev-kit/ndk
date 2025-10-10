/**
 * E2E Test for NIP-77 Negentropy Sync
 *
 * Tests:
 * 1. Basic sync functionality
 * 2. Active subscriptions receive synced events
 * 3. Cache integration
 * 4. Multi-relay sync
 * 5. AutoFetch behavior
 */

import NDK, { type NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { NDKSync } from "./src/index.js";

// Simple in-memory cache adapter for testing
class InMemoryCache {
    private events = new Map<string, NDKEvent>();

    async query(filter: NDKFilter): Promise<Set<NDKEvent>> {
        const results = new Set<NDKEvent>();

        for (const event of this.events.values()) {
            if (this.matchesFilter(event, filter)) {
                results.add(event);
            }
        }

        return results;
    }

    async setEvent(event: NDKEvent): Promise<void> {
        this.events.set(event.id, event);
    }

    private matchesFilter(event: NDKEvent, filter: NDKFilter): boolean {
        if (filter.kinds && !filter.kinds.includes(event.kind!)) return false;
        if (filter.authors && !filter.authors.includes(event.pubkey)) return false;
        if (filter.ids && !filter.ids.includes(event.id)) return false;
        if (filter.since && event.created_at! < filter.since) return false;
        if (filter.until && event.created_at! > filter.until) return false;
        return true;
    }

    getSize(): number {
        return this.events.size;
    }

    clear(): void {
        this.events.clear();
    }
}

// Test configuration
// Using relay.damus.io which supports NIP-77
// Note: purplepag.es does NOT support NIP-77
const TEST_RELAY = "wss://relay.damus.io";
const TEST_PUBKEY = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
const SYNC_TIMEOUT = 20000; // 20 second timeout for sync operations

// Color output helpers
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    dim: "\x1b[2m",
};

function log(msg: string, color = colors.reset) {
    console.log(`${color}${msg}${colors.reset}`);
}

function success(msg: string) {
    log(`✓ ${msg}`, colors.green);
}

function error(msg: string) {
    log(`✗ ${msg}`, colors.red);
}

function info(msg: string) {
    log(`  ${msg}`, colors.dim);
}

function section(msg: string) {
    log(`\n${msg}`, colors.blue);
}

// Helper to wrap sync with timeout
async function syncWithTimeout(ndk: NDK, filter: NDKFilter | NDKFilter[], opts?: any): Promise<any> {
    return Promise.race([
        NDKSync.sync(ndk, filter, opts),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Sync timeout - relay may not support NIP-77")), SYNC_TIMEOUT),
        ),
    ]);
}

// Test runner
class TestRunner {
    private passed = 0;
    private failed = 0;
    private cache: InMemoryCache;
    private ndk: NDK;

    constructor() {
        this.cache = new InMemoryCache();
        this.ndk = new NDK({
            explicitRelayUrls: [TEST_RELAY],
            cacheAdapter: this.cache as any,
        });
    }

    async run() {
        log("\n🧪 NIP-77 Negentropy Sync E2E Tests", colors.blue);
        log("=".repeat(50), colors.dim);
        log("", colors.blue);
        log("📡 Using relay.damus.io (strfry - NIP-77 compatible)", colors.blue);
        log("📋 Testing with kind:3 contact list events", colors.blue);
        log("", colors.blue);

        try {
            await this.setup();
            await this.testBasicSync();
            await this.testSubscriptionIntegration();
            await this.testAutoFetchFalse();
            await this.testCacheIntegration();
            await this.testSecondSyncSkipsCachedEvents();
            await this.cleanup();
        } catch (err) {
            error(`Fatal error: ${err}`);
            this.failed++;
        }

        this.printResults();
    }

    async setup() {
        section("Setup");
        info("Connecting to relay...");
        await this.ndk.connect();
        success(`Connected to ${TEST_RELAY}`);

        // Clear cache
        this.cache.clear();
        success("Cache cleared");
    }

    async testBasicSync() {
        section("Test 1: Basic Sync");

        const filter: NDKFilter = {
            kinds: [3],
            authors: [TEST_PUBKEY],
            limit: 10,
        };

        info("Syncing kind:3 contact list events...");
        let result;
        try {
            result = await syncWithTimeout(this.ndk, filter);
        } catch (err: any) {
            error(`Sync failed: ${err.message}`);
            this.failed += 2;
            return;
        }

        if (result.events.length > 0) {
            success(`Synced ${result.events.length} events`);
            info(`Need: ${result.need.size} events`);
            info(`Have: ${result.have.size} events`);
            this.passed++;
        } else {
            error("No events synced");
            this.failed++;
        }

        // Verify events are valid
        const invalidEvents = result.events.filter((e) => !e.id || !e.pubkey);
        if (invalidEvents.length === 0) {
            success("All events valid");
            this.passed++;
        } else {
            error(`${invalidEvents.length} invalid events`);
            this.failed++;
        }
    }

    async testSubscriptionIntegration() {
        section("Test 2: Subscription Integration");

        // Clear cache first to ensure clean test
        this.cache.clear();
        success("Cache cleared for fresh test");

        const filter: NDKFilter = {
            kinds: [3],
            authors: [TEST_PUBKEY],
            limit: 5,
        };

        // Create subscription BEFORE syncing
        const receivedEvents: NDKEvent[] = [];
        let eoseReceived = false;

        info("Creating subscription...");
        const sub = this.ndk.subscribe(filter, { closeOnEose: false });

        sub.on("event", (event: NDKEvent) => {
            receivedEvents.push(event);
            info(`  Sub received: ${event.id.substring(0, 8)}...`);
        });

        sub.on("eose", () => {
            eoseReceived = true;
        });

        // Wait a moment for subscription to establish
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (eoseReceived) {
            info("Initial EOSE received (cache was empty)");
        }

        // Now sync - events should flow to the subscription
        info("Syncing events...");
        let result;
        try {
            result = await syncWithTimeout(this.ndk, filter, { autoFetch: true });
        } catch (err: any) {
            error(`Sync failed: ${err.message}`);
            this.failed += 3;
            sub.stop();
            return;
        }

        // Wait for events to propagate to subscription
        await new Promise((resolve) => setTimeout(resolve, 2000));

        sub.stop();

        if (receivedEvents.length > 0) {
            success(`Subscription received ${receivedEvents.length} events during sync`);
            this.passed++;
        } else {
            error("Subscription did not receive any events");
            info(`Synced ${result.events.length} events but subscription got 0`);
            this.failed++;
        }

        // Verify subscription events match synced events
        const syncedIds = new Set(result.events.map((e) => e.id));
        const matchingEvents = receivedEvents.filter((e) => syncedIds.has(e.id));

        if (matchingEvents.length > 0) {
            success(`${matchingEvents.length} subscription events matched synced events`);
            this.passed++;
        } else {
            error("No subscription events matched synced events");
            this.failed++;
        }
    }

    async testAutoFetchFalse() {
        section("Test 3: AutoFetch = false");

        // Clear cache for fresh test
        this.cache.clear();
        success("Cache cleared for fresh test");

        const filter: NDKFilter = {
            kinds: [3],
            authors: [TEST_PUBKEY],
            limit: 10,
        };

        info("Syncing with autoFetch: false...");
        let result;
        try {
            result = await syncWithTimeout(this.ndk, filter, { autoFetch: false });
        } catch (err: any) {
            error(`Sync failed: ${err.message}`);
            this.failed += 2;
            return;
        }

        if (result.events.length === 0) {
            success("No events fetched (as expected)");
            this.passed++;
        } else {
            error(`Expected 0 events, got ${result.events.length}`);
            this.failed++;
        }

        if (result.need.size > 0) {
            success(`Identified ${result.need.size} events we need`);
            info(`Can manually fetch these: ${Array.from(result.need).slice(0, 3).join(", ")}...`);
            this.passed++;
        } else {
            error("Expected some events in 'need' set");
            this.failed++;
        }
    }

    async testCacheIntegration() {
        section("Test 4: Cache Integration");

        const initialSize = this.cache.getSize();
        info(`Initial cache size: ${initialSize}`);

        const filter: NDKFilter = {
            kinds: [3],
            authors: [TEST_PUBKEY],
            limit: 5,
        };

        info("Syncing kind:3 events...");
        let result;
        try {
            result = await syncWithTimeout(this.ndk, filter);
        } catch (err: any) {
            error(`Sync failed: ${err.message}`);
            this.failed += 3;
            return;
        }

        // Wait for cache writes
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const finalSize = this.cache.getSize();
        info(`Final cache size: ${finalSize}`);

        if (finalSize > initialSize) {
            success(`Cache grew by ${finalSize - initialSize} events`);
            this.passed++;
        } else {
            error("Cache did not grow");
            this.failed++;
        }

        // Verify we can query cached events
        info("Querying cache...");
        const cached = await this.cache.query(filter);

        if (cached.size > 0) {
            success(`Cache query returned ${cached.size} events`);
            this.passed++;
        } else {
            error("Cache query returned no events");
            this.failed++;
        }

        // Verify cached events match synced events
        const cachedIds = new Set(Array.from(cached).map((e) => e.id));
        const syncedIds = new Set(result.events.map((e) => e.id));
        const matching = Array.from(syncedIds).filter((id) => cachedIds.has(id));

        if (matching.length === result.events.length) {
            success("All synced events are in cache");
            this.passed++;
        } else {
            error(`Only ${matching.length}/${result.events.length} synced events in cache`);
            this.failed++;
        }
    }

    async testSecondSyncSkipsCachedEvents() {
        section("Test 5: Second Sync Skips Cached Events");

        // DON'T clear cache - we want to test with events from previous tests
        const cacheSize = this.cache.getSize();
        info(`Cache has ${cacheSize} events from previous tests`);

        if (cacheSize === 0) {
            error("Cache is empty - cannot test second sync behavior");
            this.failed += 3;
            return;
        }

        const filter: NDKFilter = {
            kinds: [3],
            authors: [TEST_PUBKEY],
            limit: 5,
        };

        info("Syncing again with same filter...");
        let result;
        try {
            result = await syncWithTimeout(this.ndk, filter, { autoFetch: true });
        } catch (err: any) {
            error(`Sync failed: ${err.message}`);
            this.failed += 3;
            return;
        }

        // The key assertion: we should HAVE events (relay tells us about them)
        // but we shouldn't NEED to fetch them (we already have them in cache)
        info(`Results: events=${result.events.length}, need=${result.need.size}, have=${result.have.size}`);

        // If we have events in cache and sync found matching events,
        // we should have a non-zero "have" count
        if (result.have.size > 0) {
            success(`Negentropy recognized we have ${result.have.size} events`);
            this.passed++;
        } else {
            error("Negentropy didn't recognize any events we have");
            info("This might be OK if relay has different events than our cache");
            this.failed++;
        }

        // We should fetch fewer (or zero) events on the second sync
        // compared to what we had in cache
        if (result.events.length === 0) {
            success("No new events fetched - all events were already in cache");
            this.passed++;
        } else if (result.events.length < cacheSize) {
            success(`Fetched only ${result.events.length} new events (cache had ${cacheSize})`);
            this.passed++;
        } else {
            error(`Fetched ${result.events.length} events despite having ${cacheSize} in cache`);
            this.failed++;
        }

        // The total in cache shouldn't grow much (or at all)
        const newCacheSize = this.cache.getSize();
        const growth = newCacheSize - cacheSize;

        if (growth === 0) {
            success("Cache size unchanged - perfect deduplication");
            this.passed++;
        } else if (growth < result.events.length) {
            success(`Cache grew by only ${growth} (fetched ${result.events.length})`);
            this.passed++;
        } else {
            error(`Cache grew by ${growth} events`);
            this.failed++;
        }
    }

    async cleanup() {
        section("Cleanup");

        for (const relay of this.ndk.pool.relays.values()) {
            relay.disconnect();
        }

        success("Disconnected from relays");
    }

    printResults() {
        log(`\n${"=".repeat(50)}`, colors.dim);

        const total = this.passed + this.failed;
        const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(1) : "0";

        if (this.failed === 0) {
            log(`\n🎉 All tests passed! (${this.passed}/${total})`, colors.green);
        } else {
            log(
                `\n📊 Results: ${this.passed} passed, ${this.failed} failed (${passRate}% pass rate)`,
                this.failed > 0 ? colors.yellow : colors.green,
            );
        }

        log("");
    }
}

// Run tests
const runner = new TestRunner();
runner.run().catch(console.error);
