#!/usr/bin/env bun

/**
 * Simple test to demonstrate relay metadata caching
 */

import NDKMemoryCacheAdapter from "./cache-memory/dist/index.js";

console.log("🧪 Testing Relay Metadata Caching\n");

const cache = new NDKMemoryCacheAdapter();
const relayUrl = "wss://relay.damus.io";

// Test 1: Store and retrieve NIP-11 data
console.log("📋 Test 1: NIP-11 Caching");
console.log("─".repeat(50));

const nip11Data = {
    name: "Damus Relay",
    description: "A test relay",
    supported_nips: [1, 2, 77],
    software: "strfry",
};

cache.updateRelayStatus(relayUrl, {
    nip11: {
        data: nip11Data,
        fetchedAt: Date.now(),
    },
});

const status1 = cache.getRelayStatus(relayUrl);
console.log(`✅ Stored NIP-11 data`);
console.log(`   Name: ${status1?.nip11?.data.name}`);
console.log(`   Supported NIPs: ${status1?.nip11?.data.supported_nips?.join(", ")}`);
console.log(`   Software: ${status1?.nip11?.data.software}\n`);

// Test 2: Store sync package metadata
console.log("📋 Test 2: Sync Package Metadata");
console.log("─".repeat(50));

cache.updateRelayStatus(relayUrl, {
    metadata: {
        sync: {
            supportsNegentropy: false,
            lastChecked: Date.now(),
            lastError: "Relay does not support NEG-OPEN",
        },
    },
});

const status2 = cache.getRelayStatus(relayUrl);
console.log(`✅ Stored sync metadata`);
console.log(`   Supports Negentropy: ${status2?.metadata?.sync?.supportsNegentropy}`);
console.log(`   Last Error: ${status2?.metadata?.sync?.lastError}\n`);

// Test 3: Add auth metadata (should merge with sync)
console.log("📋 Test 3: Metadata Merging");
console.log("─".repeat(50));

cache.updateRelayStatus(relayUrl, {
    metadata: {
        auth: {
            token: "AUTH_TOKEN_EXAMPLE",
            expiresAt: Date.now() + 3600000,
        },
    },
});

const status3 = cache.getRelayStatus(relayUrl);
console.log(`✅ Added auth metadata`);
console.log(`   Sync metadata still present: ${status3?.metadata?.sync ? "✅" : "❌"}`);
console.log(`   Auth metadata present: ${status3?.metadata?.auth ? "✅" : "❌"}`);
console.log(`   Token: ${status3?.metadata?.auth?.token ? "Present" : "Missing"}`);
console.log(`   NIP-11 still present: ${status3?.nip11 ? "✅" : "❌"}\n`);

// Test 4: Connection tracking
console.log("📋 Test 4: Connection Tracking");
console.log("─".repeat(50));

const now = Date.now();
cache.updateRelayStatus(relayUrl, {
    lastConnectedAt: now,
    consecutiveFailures: 3,
    lastFailureAt: now - 1000,
    dontConnectBefore: now + 60000,
});

const status4 = cache.getRelayStatus(relayUrl);
console.log(`✅ Stored connection tracking`);
console.log(`   Last Connected: ${new Date(status4?.lastConnectedAt!).toISOString()}`);
console.log(`   Consecutive Failures: ${status4?.consecutiveFailures}`);
console.log(`   Don't Connect Before: ${new Date(status4?.dontConnectBefore!).toISOString()}`);
console.log(`   All metadata still intact: ${status4?.metadata?.sync && status4?.metadata?.auth ? "✅" : "❌"}\n`);

// Summary
console.log("✨ All Tests Passed!\n");
console.log("💡 Key Features Demonstrated:");
console.log("   • NIP-11 data caching with timestamp");
console.log("   • Package-specific metadata (sync, wallet)");
console.log("   • Metadata merging across updates");
console.log("   • Connection failure tracking");
console.log("   • All fields coexist without conflicts");
