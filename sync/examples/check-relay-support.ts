/**
 * Example: Check if relays support NIP-77 before syncing
 *
 * This example demonstrates how to check relay capabilities
 * before attempting to sync with them.
 */

import { filterNegentropyRelays, getRelayCapabilities, supportsNegentropy } from "../src/index.js";

// Example 1: Check a single relay
async function checkSingleRelay() {
    console.log("\n=== Example 1: Check Single Relay ===\n");

    const relayUrl = "wss://relay.damus.io";
    const supported = await supportsNegentropy(relayUrl);

    console.log(`Relay: ${relayUrl}`);
    console.log(`Supports NIP-77: ${supported ? "✓ Yes" : "✗ No"}`);
}

// Example 2: Filter relay list to only NIP-77 compatible ones
async function filterRelayList() {
    console.log("\n=== Example 2: Filter Relay List ===\n");

    const allRelays = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band", "wss://relay.snort.social"];

    console.log("Checking relays:", allRelays.join(", "));

    const syncRelays = await filterNegentropyRelays(allRelays);

    console.log(`\nRelays supporting NIP-77: ${syncRelays.length}/${allRelays.length}`);

    if (syncRelays.length > 0) {
        console.log("Compatible relays:", syncRelays.join(", "));
    } else {
        console.log("No relays support NIP-77");
    }
}

// Example 3: Get detailed relay capabilities
async function getDetailedCapabilities() {
    console.log("\n=== Example 3: Detailed Capabilities ===\n");

    const relayUrl = "wss://relay.damus.io";
    const caps = await getRelayCapabilities(relayUrl);

    console.log(`Relay: ${caps.url}`);
    console.log(`Name: ${caps.name || "N/A"}`);
    console.log(`Software: ${caps.software || "N/A"} ${caps.version || ""}`);
    console.log(`Supports NIP-77: ${caps.supportsNegentropy ? "✓" : "✗"}`);
    console.log(
        `Supported NIPs: ${caps.supportedNips.slice(0, 10).join(", ")}${caps.supportedNips.length > 10 ? "..." : ""}`,
    );

    if (caps.limitations) {
        console.log("\nLimitations:");
        if (caps.limitations.max_message_length) {
            console.log(`  Max message length: ${caps.limitations.max_message_length}`);
        }
        if (caps.limitations.max_subscriptions) {
            console.log(`  Max subscriptions: ${caps.limitations.max_subscriptions}`);
        }
        if (caps.limitations.auth_required) {
            console.log(`  Auth required: Yes`);
        }
    }

    if (caps.error) {
        console.log(`Error: ${caps.error}`);
    }
}

// Example 4: Smart sync - only use compatible relays
async function smartSync() {
    console.log("\n=== Example 4: Smart Sync ===\n");

    const allRelays = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band"];

    // Filter to only NIP-77 relays
    console.log("Finding NIP-77 compatible relays...");
    const syncRelays = await filterNegentropyRelays(allRelays);

    if (syncRelays.length === 0) {
        console.log("No relays support NIP-77. Falling back to regular subscription.");
        return;
    }

    console.log(`Found ${syncRelays.length} compatible relay(s): ${syncRelays.join(", ")}`);

    // Note: This part requires a cache adapter and would actually sync
    // Commented out for this example
    /*
    const ndk = new NDK({
        explicitRelayUrls: syncRelays,
        cacheAdapter: myCacheAdapter
    });

    await ndk.connect();

    const result = await ndkSync.call(ndk, {
        kinds: [1],
        limit: 10
    });

    console.log(`Synced ${result.events.length} events`);
    */
}

// Example 5: Check relay before syncing
async function checkBeforeSync() {
    console.log("\n=== Example 5: Check Before Sync ===\n");

    const relayUrl = "wss://relay.damus.io";

    console.log(`Checking ${relayUrl}...`);
    const supported = await supportsNegentropy(relayUrl);

    if (supported) {
        console.log("✓ Relay supports NIP-77. Proceeding with sync...");

        // Note: Actual sync code would go here
        // const ndk = new NDK({ explicitRelayUrls: [relayUrl], cacheAdapter });
        // await ndk.connect();
        // const result = await ndkSync.call(ndk, filters);
    } else {
        console.log("✗ Relay doesn't support NIP-77. Using fallback strategy...");
        console.log("Fallback: Using regular subscription instead");

        // Fallback code would go here
        // const sub = ndk.subscribe(filters);
    }
}

// Run all examples
async function main() {
    console.log("🔍 NIP-77 Relay Capability Checking Examples");
    console.log("============================================");

    try {
        await checkSingleRelay();
        await filterRelayList();
        await getDetailedCapabilities();
        await smartSync();
        await checkBeforeSync();
    } catch (error) {
        console.error("Error:", error);
    }

    console.log("\n✅ Examples complete!\n");
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { checkSingleRelay, filterRelayList, getDetailedCapabilities, smartSync, checkBeforeSync };
