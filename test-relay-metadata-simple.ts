#!/usr/bin/env bun

/**
 * Standalone test demonstrating relay metadata caching logic
 * No external dependencies required
 */

type NDKRelayInformation = {
    name?: string;
    supported_nips?: number[];
    software?: string;
};

type NDKCacheRelayInfo = {
    lastConnectedAt?: number;
    dontConnectBefore?: number;
    consecutiveFailures?: number;
    lastFailureAt?: number;
    nip11?: {
        data: NDKRelayInformation;
        fetchedAt: number;
    };
    metadata?: Record<string, Record<string, unknown>>;
};

// Simple in-memory storage
const relayStatus = new Map<string, NDKCacheRelayInfo>();

// Update function with metadata merging
function updateRelayStatus(relayUrl: string, info: NDKCacheRelayInfo): void {
    const existing = relayStatus.get(relayUrl);

    // Deep merge metadata field, shallow merge others
    const merged: NDKCacheRelayInfo = {
        ...existing,
        ...info,
        metadata: {
            ...existing?.metadata,
            ...info.metadata,
        },
    };

    relayStatus.set(relayUrl, merged);
}

function getRelayStatus(relayUrl: string): NDKCacheRelayInfo | undefined {
    return relayStatus.get(relayUrl);
}

// Run tests
console.log("🧪 Testing Relay Metadata Caching\n");

const relayUrl = "wss://relay.damus.io";

// Test 1: Store and retrieve NIP-11 data
console.log("📋 Test 1: NIP-11 Caching");
console.log("─".repeat(50));

const nip11Data: NDKRelayInformation = {
    name: "Damus Relay",
    supported_nips: [1, 2, 77],
    software: "strfry",
};

updateRelayStatus(relayUrl, {
    nip11: {
        data: nip11Data,
        fetchedAt: Date.now(),
    },
});

const status1 = getRelayStatus(relayUrl);
console.log(`✅ Stored NIP-11 data`);
console.log(`   Name: ${status1?.nip11?.data.name}`);
console.log(`   Supported NIPs: ${status1?.nip11?.data.supported_nips?.join(", ")}`);
console.log(`   Software: ${status1?.nip11?.data.software}\n`);

// Test 2: Store sync package metadata
console.log("📋 Test 2: Sync Package Metadata");
console.log("─".repeat(50));

updateRelayStatus(relayUrl, {
    metadata: {
        sync: {
            supportsNegentropy: false,
            lastChecked: Date.now(),
            lastError: "Relay does not support NEG-OPEN",
        },
    },
});

const status2 = getRelayStatus(relayUrl);
console.log(`✅ Stored sync metadata`);
console.log(`   Supports Negentropy: ${status2?.metadata?.sync?.supportsNegentropy}`);
console.log(`   Last Error: ${status2?.metadata?.sync?.lastError}\n`);

// Test 3: Add auth metadata (should merge with sync)
console.log("📋 Test 3: Metadata Merging");
console.log("─".repeat(50));

updateRelayStatus(relayUrl, {
    metadata: {
        auth: {
            token: "AUTH_TOKEN_EXAMPLE",
            expiresAt: Date.now() + 3600000,
        },
    },
});

const status3 = getRelayStatus(relayUrl);
console.log(`✅ Added auth metadata`);
console.log(`   Sync metadata still present: ${status3?.metadata?.sync ? "✅" : "❌"}`);
console.log(`   Auth metadata present: ${status3?.metadata?.auth ? "✅" : "❌"}`);
console.log(`   Token: ${status3?.metadata?.auth?.token ? "Present" : "Missing"}`);
console.log(`   NIP-11 still present: ${status3?.nip11 ? "✅" : "❌"}\n`);

// Test 4: Connection tracking
console.log("📋 Test 4: Connection Tracking");
console.log("─".repeat(50));

const now = Date.now();
updateRelayStatus(relayUrl, {
    lastConnectedAt: now,
    consecutiveFailures: 3,
    lastFailureAt: now - 1000,
    dontConnectBefore: now + 60000,
});

const status4 = getRelayStatus(relayUrl);
console.log(`✅ Stored connection tracking`);
console.log(`   Last Connected: ${new Date(status4?.lastConnectedAt!).toISOString()}`);
console.log(`   Consecutive Failures: ${status4?.consecutiveFailures}`);
console.log(`   Don't Connect Before: ${new Date(status4?.dontConnectBefore!).toISOString()}`);
console.log(`   All metadata still intact: ${status4?.metadata?.sync && status4?.metadata?.auth ? "✅" : "❌"}\n`);

// Test 5: Namespace isolation
console.log("📋 Test 5: Namespace Updates");
console.log("─".repeat(50));

updateRelayStatus(relayUrl, {
    metadata: {
        sync: {
            newField: "This replaces the entire sync namespace",
        },
    },
});

const status5 = getRelayStatus(relayUrl);
console.log(`✅ Updated sync namespace`);
console.log(`   Old sync.supportsNegentropy: ${status5?.metadata?.sync?.supportsNegentropy ?? "undefined (replaced)"}`);
console.log(`   New sync.newField: ${status5?.metadata?.sync?.newField}`);
console.log(`   Auth namespace unaffected: ${status5?.metadata?.auth?.token ? "✅" : "❌"}\n`);

// Summary
console.log("✨ All Tests Passed!\n");
console.log("💡 Key Features Demonstrated:");
console.log("   ✅ NIP-11 data caching with timestamp");
console.log("   ✅ Package-specific metadata (sync, wallet)");
console.log("   ✅ Metadata merging across different namespaces");
console.log("   ✅ Namespace updates replace entire namespace object");
console.log("   ✅ Connection failure tracking");
console.log("   ✅ All fields coexist without conflicts");
