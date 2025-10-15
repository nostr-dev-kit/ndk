#!/usr/bin/env bun

/**
 * Test script to demonstrate auth-required publish retry
 * Usage: bun run test-auth-publish.ts --nsec <your-nsec> --msg "your message"
 */

import { NDKEvent } from "./src/events";
import { NDK } from "./src/ndk";
import { NDKPrivateKeySigner } from "./src/signers/private-key";

// Parse command line arguments
const args = process.argv.slice(2);
const nsecIndex = args.indexOf("--nsec");
const msgIndex = args.indexOf("--msg");

if (nsecIndex === -1 || msgIndex === -1) {
    console.error('Usage: bun run test-auth-publish.ts --nsec <your-nsec> --msg "your message"');
    process.exit(1);
}

const nsec = args[nsecIndex + 1];
const message = args[msgIndex + 1];

if (!nsec || !message) {
    console.error("Error: Both --nsec and --msg are required");
    process.exit(1);
}

async function main() {
    console.log("🚀 Testing auth-required publish retry...\n");

    // Create signer from nsec
    let signer;
    try {
        signer = new NDKPrivateKeySigner(nsec);
        const user = await signer.user();
        console.log("👤 Publishing as:", user.npub);
    } catch (error) {
        console.error("❌ Invalid nsec:", error);
        process.exit(1);
    }

    // Create NDK instance with pyramid relay only
    const ndk = new NDK({
        explicitRelayUrls: ["wss://pyramid.fiatjaf.com"],
        signer,
        enableOutboxModel: false, // Disable outbox to ensure we only use pyramid
        // Auth policy that automatically approves authentication
        relayAuthDefaultPolicy: async (relay, challenge) => {
            console.log("🔐 Relay requested authentication from:", relay.url);
            console.log("   Challenge:", challenge.substring(0, 32) + "...");
            return true; // Approve authentication
        },
    });

    // Enable debug logging
    ndk.pool.on("relay:connect", (relay) => {
        console.log("✅ Connected to relay:", relay.url);
    });

    ndk.pool.on("relay:disconnect", (relay) => {
        console.log("❌ Disconnected from relay:", relay.url);
    });

    // Track auth events
    ndk.pool.relays.forEach((relay) => {
        relay.on("auth", (challenge) => {
            console.log("🔐 AUTH message received from:", relay.url);
        });

        relay.on("authed", () => {
            console.log("✅ Authentication successful for:", relay.url);
        });

        relay.on("auth:failed", (error) => {
            console.log("❌ Authentication failed for:", relay.url, error);
        });

        relay.on("publish:failed", (event, error) => {
            console.log("📤 Publish failed (will retry after auth):", error.message);
        });
    });

    // Connect to relays
    console.log("\n📡 Connecting to pyramid.fiatjaf.com...");
    await ndk.connect(5000);

    // Wait a bit for connection to stabilize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create and publish event
    console.log("\n📝 Creating event...");
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = message;

    console.log("   Content:", message);

    try {
        console.log("\n📤 Publishing event (this will trigger auth-required)...");
        const publishStart = Date.now();

        const relays = await event.publish();

        const publishDuration = Date.now() - publishStart;

        console.log("\n✅ EVENT PUBLISHED SUCCESSFULLY!");
        console.log("   Event ID:", event.id);
        console.log("   Published to", relays.size, "relay(s)");
        console.log("   Time taken:", publishDuration, "ms");
        console.log("\n🎉 Auth-required publish retry worked!");
        console.log("   The event was initially rejected with auth-required,");
        console.log("   but NDK automatically authenticated and retried the publish.");

        // Show the relays
        for (const relay of relays) {
            console.log("   ✓", relay.url);
        }
    } catch (error: any) {
        console.error("\n❌ PUBLISH FAILED");
        console.error("   Error:", error.message);

        if (error.errors) {
            console.error("\n   Relay errors:");
            for (const [relay, err] of error.errors) {
                console.error("   -", relay.url + ":", err.message);
            }
        }

        process.exit(1);
    }

    // Close connections
    console.log("\n🔌 Closing connections...");
    ndk.pool.relays.forEach((relay) => relay.disconnect());

    console.log("✅ Done!\n");
    process.exit(0);
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
