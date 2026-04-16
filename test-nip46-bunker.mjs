/**
 * Minimal NIP-46 Bunker Login Test
 * 
 * Tests the end-to-end flow:
 * 1. Parse bunker URI
 * 2. Connect to the NIP-46 bunker via NDKNip46Signer
 * 3. Sign and publish a kind:1 event
 * 4. Verify the publish succeeded
 */

import NDK, { NDKNip46Signer, NDKEvent } from "./core/dist/index.mjs";

const BUNKER_URI = process.argv[2] || process.env.NDK_NIP46_BUNKER_URI;
if (!BUNKER_URI) {
    console.error("Usage: NDK_NIP46_BUNKER_URI='<bunker://...>' node test-nip46-bunker.mjs");
    process.exit(1);
}

function redactBunkerUri(uri) {
    const url = new URL(uri);
    if (url.searchParams.has("secret")) url.searchParams.set("secret", "<redacted>");
    return url.toString();
}

const RELAY = "wss://tenex.chat";

async function main() {
    console.log("=== NIP-46 Bunker Login Test ===\n");
    console.log("Bunker URI:", redactBunkerUri(BUNKER_URI));
    console.log("");

    // Step 1: Create NDK instance
    console.log("[1/5] Creating NDK instance...");
    const ndk = new NDK({
        explicitRelayUrls: [RELAY],
        enableOutboxModel: false,
    });
    
    // Enable debug logging for nip46
    // Uncomment for verbose output:
    // import debug from 'debug'; debug.enable('ndk:*');

    await ndk.connect();
    console.log("  ✓ NDK connected to", RELAY);

    // Step 2: Create NIP-46 signer from bunker URI
    console.log("\n[2/5] Creating NIP-46 signer from bunker URI...");
    const signer = NDKNip46Signer.bunker(ndk, BUNKER_URI);
    
    console.log("  Bunker pubkey:", signer.bunkerPubkey);
    console.log("  User pubkey:", signer.userPubkey || "(will be fetched)");
    console.log("  Secret:", signer.secret ? "present" : "none");
    console.log("  Relay URLs:", signer.relayUrls);
    console.log("  Local signer pubkey:", signer.localSigner.pubkey);

    // Step 3: Block until ready (this sends "connect" to the bunker)
    console.log("\n[3/5] Connecting to bunker (blockUntilReady)...");
    console.log("  Waiting for bunker response...");
    
    const TIMEOUT_MS = 30000;
    let user;
    try {
        user = await Promise.race([
            signer.blockUntilReady(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timed out after ${TIMEOUT_MS/1000}s waiting for bunker`)), TIMEOUT_MS)
            )
        ]);
        console.log("  ✓ Connected! User:", user.npub);
        console.log("  User pubkey:", user.pubkey);
    } catch (err) {
        console.error("  ✗ Failed to connect to bunker:", err.message);
        console.error("\n  Troubleshooting:");
        console.error("  - Is the bunker running and accessible?");
        console.error("  - Is the secret still valid (not expired)?");
        console.error("  - Is the relay reachable?");
        process.exit(1);
    }

    // Step 4: Create and publish a kind:1 event
    console.log("\n[4/5] Creating and publishing test kind:1 event...");
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = `NIP-46 bunker login test from NDK CLI - ${new Date().toISOString()}`;
    event.tags = [["t", "nip46-test"]];
    
    ndk.signer = signer;
    
    try {
        await event.sign();
        console.log("  ✓ Event signed successfully");
        console.log("  Event ID:", event.id);
        console.log("  Event pubkey:", event.pubkey);
        console.log("  Event sig:", event.sig?.substring(0, 32) + "...");
    } catch (err) {
        console.error("  ✗ Failed to sign event:", err.message);
        process.exit(1);
    }

    try {
        const relays = await event.publish();
        console.log("  ✓ Event published to", relays.size, "relay(s)");
        for (const relay of relays) {
            console.log("    -", relay.url);
        }
    } catch (err) {
        console.error("  ✗ Failed to publish event:", err.message);
        process.exit(1);
    }

    // Step 5: Verify
    console.log("\n[5/5] Verification...");
    console.log("  ✓ Kind:1 event published successfully via NIP-46 bunker");
    console.log("  Event ID:", event.encode());
    console.log("\n=== Test PASSED ===\n");

    // Cleanup
    signer.stop();
    
    // Give a moment for cleanup, then exit
    setTimeout(() => process.exit(0), 2000);
}

main().catch((err) => {
    console.error("\nFatal error:", err);
    process.exit(1);
});
