/**
 * NIP-46 Bunker Login Test - Using Sessions Package
 * 
 * This test mirrors how the Svelte app does bunker login:
 * 1. Creates NDK instance
 * 2. Creates NDKSessionManager (same as the Svelte app)
 * 3. Creates NDKNip46Signer from bunker URI
 * 4. Calls sessions.login(signer) - the exact flow used in Svelte
 * 5. Publishes a test kind:1 event
 */

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// Use the built core and sessions packages
const core = require("./core/dist/index.js");
const NDK = core.default;
const { NDKNip46Signer, NDKEvent } = core;
const { NDKSessionManager, MemoryStorage } = require("./sessions/dist/index.cjs");

const BUNKER_URI = process.argv[2] || process.env.NDK_NIP46_BUNKER_URI;
if (!BUNKER_URI) {
    console.error("Usage: NDK_NIP46_BUNKER_URI='<bunker://...>' node test-nip46-sessions.mjs");
    process.exit(1);
}

function redactBunkerUri(uri) {
    const url = new URL(uri);
    if (url.searchParams.has("secret")) url.searchParams.set("secret", "<redacted>");
    return url.toString();
}

console.log("=== NIP-46 Bunker Login Test (Via Sessions Package) ===\n");
console.log("Bunker URI:", redactBunkerUri(BUNKER_URI));

try {
    // Step 1: Create NDK instance (same as Svelte app)
    console.log("\n[1] Creating NDK instance...");
    const ndk = new NDK({
        explicitRelayUrls: ["wss://tenex.chat"],
    });
    await ndk.connect();
    console.log("  ✓ NDK connected");

    // Step 2: Create session manager (same as Svelte app's NDKSessionManager)
    console.log("\n[2] Creating NDKSessionManager...");
    const sessions = new NDKSessionManager(ndk, {
        storage: new MemoryStorage(),
        fetches: {
            follows: true,
            mutes: true,
            relayList: true,
        },
    });
    console.log("  ✓ SessionManager created");

    // Step 3: Create NIP-46 signer from bunker URI (same as Svelte's handleCredentialLogin)
    console.log("\n[3] Creating NDKNip46Signer from bunker URI...");
    const signer = new NDKNip46Signer(ndk, BUNKER_URI);
    console.log("  ✓ Signer created");
    console.log("  signer.bunkerPubkey:", signer.bunkerPubkey);

    // Step 4: Login via sessions (this is the exact flow the Svelte app uses)
    // sessions.login() → authManager.login() → store.addSession() → signer.user() → blockUntilReady()
    console.log("\n[4] Calling sessions.login(signer) [same as Svelte app]...");
    console.log("  (This calls signer.user() → blockUntilReady() internally)");
    
    const startTime = Date.now();
    const pubkey = await sessions.login(signer);
    const elapsed = Date.now() - startTime;
    
    console.log(`  ✓ Login successful! (took ${elapsed}ms)`);
    console.log("  User pubkey:", pubkey);

    // Step 5: Verify session was created
    console.log("\n[5] Verifying session state...");
    const session = sessions.getSession(pubkey);
    console.log("  Session exists:", !!session);
    console.log("  Active session pubkey:", sessions.activePubkey);
    console.log("  NDK signer set:", !!ndk.signer);
    console.log("  NDK activeUser:", ndk.activeUser?.pubkey);
    console.log("  Is read-only:", sessions.isReadOnly(pubkey));

    // Step 6: Publish test event using the session's signer
    console.log("\n[6] Publishing test kind:1 event via sessions...");
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = `NIP-46 sessions login test - ${new Date().toISOString()}`;
    event.tags = [["t", "nip46-sessions-test"]];

    await event.sign();
    console.log("  ✓ Signed. ID:", event.id);
    
    const relays = await event.publish();
    console.log(`  ✓ Published to ${relays.size} relay(s)`);

    // Step 7: Test persistence (serialize/deserialize)
    console.log("\n[7] Testing session persistence...");
    await sessions.persist();
    console.log("  ✓ Session persisted to memory storage");

    console.log("\n=== Test PASSED ===");
    
    // Clean exit
    setTimeout(() => process.exit(0), 2000);

} catch (err) {
    console.error("\n=== Test FAILED ===");
    console.error("Error:", err);
    console.error("Stack:", err.stack);
    process.exit(1);
}
