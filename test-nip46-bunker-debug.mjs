/**
 * NIP-46 Bunker Login Test - Debug Version
 * 
 * Enhanced with verbose logging to diagnose connection issues.
 */

import NDK, { NDKNip46Signer, NDKEvent, NDKKind } from "./core/dist/index.mjs";

const BUNKER_URI = process.argv[2] || process.env.NDK_NIP46_BUNKER_URI;
if (!BUNKER_URI) {
    console.error("Usage: NDK_NIP46_BUNKER_URI='<bunker://...>' node test-nip46-bunker-debug.mjs");
    process.exit(1);
}

function redactBunkerUri(uri) {
    const url = new URL(uri);
    if (url.searchParams.has("secret")) url.searchParams.set("secret", "<redacted>");
    return url.toString();
}

const RELAY = "wss://tenex.chat";

async function main() {
    console.log("=== NIP-46 Bunker Login Test (Debug) ===\n");
    console.log("Bunker URI:", redactBunkerUri(BUNKER_URI));

    // Parse and display URI components
    const bunkerUrl = new URL(BUNKER_URI);
    const bunkerPubkey = bunkerUrl.hostname || bunkerUrl.pathname.replace(/^\/\//, "");
    const userPubkey = bunkerUrl.searchParams.get("pubkey");
    const relayUrls = bunkerUrl.searchParams.getAll("relay");
    const secret = bunkerUrl.searchParams.get("secret");
    
    console.log("\nParsed URI:");
    console.log("  bunkerPubkey:", bunkerPubkey);
    console.log("  userPubkey:", userPubkey);
    console.log("  relayUrls:", relayUrls);
    console.log("  secret:", secret ? "<redacted>" : null);
    console.log("");

    // Step 1: Create NDK instance
    console.log("[1] Creating NDK instance...");
    const ndk = new NDK({
        explicitRelayUrls: [RELAY],
        enableOutboxModel: false,
    });

    await ndk.connect();
    console.log("  ✓ NDK connected\n");

    // Step 2: Create signer
    console.log("[2] Creating NIP-46 signer...");
    const signer = NDKNip46Signer.bunker(ndk, BUNKER_URI);
    
    console.log("  signer.bunkerPubkey:", signer.bunkerPubkey);
    console.log("  signer.userPubkey:", signer.userPubkey);
    console.log("  signer.secret:", signer.secret ? "<redacted>" : null);
    console.log("  signer.relayUrls:", signer.relayUrls);
    console.log("  signer.localSigner.pubkey:", signer.localSigner.pubkey);

    // Step 3: Manually intercept the RPC to debug
    console.log("\n[3] Setting up RPC debug hooks...");
    
    // Hook into RPC events
    signer.rpc.on("response", (response) => {
        console.log("\n  >>> RPC RESPONSE received:");
        console.log("    id:", response.id);
        console.log("    result:", JSON.stringify(response.result));
        console.log("    error:", JSON.stringify(response.error));
        if (response.event) {
            console.log("    event.pubkey:", response.event.pubkey);
            console.log("    event.kind:", response.event.kind);
        }
    });

    signer.rpc.on("request", (request) => {
        console.log("\n  >>> RPC REQUEST received:");
        console.log("    id:", request.id);
        console.log("    method:", request.method);
        console.log("    params:", JSON.stringify(request.params));
    });

    signer.on("authUrl", (url) => {
        console.log("\n  >>> AUTH URL:", url);
    });

    // Step 4: Try blockUntilReady with timeout
    console.log("\n[4] Calling blockUntilReady (30s timeout)...");
    
    const TIMEOUT_MS = 30000;
    try {
        const user = await Promise.race([
            signer.blockUntilReady(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timed out after ${TIMEOUT_MS/1000}s`)), TIMEOUT_MS)
            )
        ]);
        console.log("\n  ✓ Connected! User npub:", user.npub);
        console.log("  User pubkey:", user.pubkey);

        // Step 5: Publish test event
        console.log("\n[5] Publishing test kind:1 event...");
        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = `NIP-46 bunker login test - ${new Date().toISOString()}`;
        event.tags = [["t", "nip46-test"]];
        ndk.signer = signer;
        
        await event.sign();
        console.log("  ✓ Signed. ID:", event.id);
        
        const relays = await event.publish();
        console.log("  ✓ Published to", relays.size, "relay(s)");
        console.log("  nevent:", event.encode());
        
        console.log("\n=== Test PASSED ===\n");
    } catch (err) {
        console.error("\n  ✗ Failed:", err.message || err);
        console.error("  Error type:", typeof err);
        console.error("  Full error:", err);
        process.exit(1);
    }

    signer.stop();
    setTimeout(() => process.exit(0), 2000);
}

main().catch((err) => {
    console.error("\nFatal error:", err);
    process.exit(1);
});
