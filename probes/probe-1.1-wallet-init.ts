/**
 * Probe 1.1: Wallet Initialization & Event Publishing
 *
 * OBJECTIVE: Verify that NDKCashuWallet.create() correctly:
 * - Generates a private key
 * - Publishes a kind 17375 wallet event (encrypted)
 * - Publishes a kind 375 backup event (encrypted)
 *
 * SUCCESS CRITERIA:
 * - Wallet creation completes without error
 * - Kind 17375 event is published to relay
 * - Kind 375 backup event is published to relay
 * - Both events are properly encrypted
 * - Wallet has valid p2pk after creation
 */

import NDK, { NDKPrivateKeySigner, NDKKind, NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "@nostr-dev-kit/wallet";

const TESTNET_MINT = "https://testnut.cashu.space";
const TEST_RELAY = "wss://relay.damus.io";

interface ProbeResult {
    success: boolean;
    walletCreated: boolean;
    p2pkGenerated: boolean;
    kind17375Published: boolean;
    kind375Published: boolean;
    eventsEncrypted: boolean;
    errors: string[];
    details: Record<string, any>;
}

async function runProbe(): Promise<ProbeResult> {
    const result: ProbeResult = {
        success: false,
        walletCreated: false,
        p2pkGenerated: false,
        kind17375Published: false,
        kind375Published: false,
        eventsEncrypted: false,
        errors: [],
        details: {},
    };

    console.log("========================================");
    console.log("PROBE 1.1: Wallet Initialization & Event Publishing");
    console.log("========================================\n");

    // Step 1: Initialize NDK with a test signer
    console.log("Step 1: Initializing NDK...");
    const userSigner = NDKPrivateKeySigner.generate();
    const user = await userSigner.user();
    console.log(`  Generated user pubkey: ${user.pubkey.slice(0, 16)}...`);

    const ndk = new NDK({
        explicitRelayUrls: [TEST_RELAY],
        signer: userSigner,
    });

    try {
        await ndk.connect();
        console.log(`  Connected to relay: ${TEST_RELAY}`);
    } catch (e: any) {
        result.errors.push(`Failed to connect to relay: ${e.message}`);
        console.error(`  ERROR: ${e.message}`);
        return result;
    }

    // Step 2: Track published events
    const publishedEvents: NDKEvent[] = [];

    // We'll intercept events by subscribing before wallet creation
    console.log("\nStep 2: Setting up event monitoring...");

    // Step 3: Create wallet using the static create method
    console.log("\nStep 3: Creating wallet with NDKCashuWallet.create()...");
    console.log(`  Mint: ${TESTNET_MINT}`);
    console.log(`  Relay: ${TEST_RELAY}`);

    let wallet: NDKCashuWallet;
    try {
        wallet = await NDKCashuWallet.create(ndk, [TESTNET_MINT], [TEST_RELAY]);
        result.walletCreated = true;
        console.log("  Wallet created successfully!");
    } catch (e: any) {
        result.errors.push(`Wallet creation failed: ${e.message}`);
        console.error(`  ERROR: Wallet creation failed: ${e.message}`);
        return result;
    }

    // Step 4: Check wallet properties
    console.log("\nStep 4: Verifying wallet properties...");

    // Check p2pk
    try {
        const p2pk = await wallet.getP2pk();
        result.p2pkGenerated = !!p2pk && p2pk.length === 64;
        result.details.p2pk = p2pk;
        console.log(`  P2PK generated: ${result.p2pkGenerated}`);
        console.log(`  P2PK value: ${p2pk.slice(0, 16)}...`);
    } catch (e: any) {
        result.errors.push(`Failed to get p2pk: ${e.message}`);
        console.error(`  ERROR: Failed to get p2pk: ${e.message}`);
    }

    // Check mints
    result.details.mints = wallet.mints;
    console.log(`  Mints configured: ${wallet.mints.join(", ")}`);

    // Check relay set
    const relayUrls = wallet.relaySet ? Array.from(wallet.relaySet.relays).map(r => r.url) : [];
    result.details.relays = relayUrls;
    console.log(`  Relay set: ${relayUrls.join(", ") || "(using NIP-65 fallback)"}`);

    // Step 5: Fetch published events from relay to verify
    console.log("\nStep 5: Verifying published events on relay...");

    // Wait a moment for events to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fetch kind 17375 (wallet event)
    try {
        const walletEvents = await ndk.fetchEvents({
            kinds: [NDKKind.CashuWallet],
            authors: [user.pubkey],
        });

        result.details.kind17375Count = walletEvents.size;
        console.log(`  Kind 17375 events found: ${walletEvents.size}`);

        if (walletEvents.size > 0) {
            result.kind17375Published = true;
            for (const event of walletEvents) {
                // Check if event is encrypted (content should be a non-empty ciphertext)
                const isEncrypted = event.content.length > 0 && !event.content.startsWith('[');
                console.log(`    Event ID: ${event.id.slice(0, 16)}...`);
                console.log(`    Content encrypted: ${isEncrypted}`);
                console.log(`    Content preview: ${event.content.slice(0, 50)}...`);
                result.details.kind17375Event = {
                    id: event.id,
                    encrypted: isEncrypted,
                    contentLength: event.content.length
                };
            }
        }
    } catch (e: any) {
        result.errors.push(`Failed to fetch kind 17375 events: ${e.message}`);
        console.error(`  ERROR fetching kind 17375: ${e.message}`);
    }

    // Fetch kind 375 (backup event)
    try {
        const backupEvents = await ndk.fetchEvents({
            kinds: [NDKKind.CashuWalletBackup],
            authors: [user.pubkey],
        });

        result.details.kind375Count = backupEvents.size;
        console.log(`  Kind 375 events found: ${backupEvents.size}`);

        if (backupEvents.size > 0) {
            result.kind375Published = true;
            for (const event of backupEvents) {
                // Check if event is encrypted
                const isEncrypted = event.content.length > 0 && !event.content.startsWith('[');
                console.log(`    Event ID: ${event.id.slice(0, 16)}...`);
                console.log(`    Content encrypted: ${isEncrypted}`);
                console.log(`    Content preview: ${event.content.slice(0, 50)}...`);
                result.details.kind375Event = {
                    id: event.id,
                    encrypted: isEncrypted,
                    contentLength: event.content.length
                };
            }
        }
    } catch (e: any) {
        result.errors.push(`Failed to fetch kind 375 events: ${e.message}`);
        console.error(`  ERROR fetching kind 375: ${e.message}`);
    }

    // Determine if events are encrypted
    result.eventsEncrypted =
        (result.details.kind17375Event?.encrypted ?? false) &&
        (result.details.kind375Event?.encrypted ?? false);

    // Step 6: Final assessment
    console.log("\n========================================");
    console.log("PROBE 1.1 RESULTS");
    console.log("========================================");

    result.success =
        result.walletCreated &&
        result.p2pkGenerated &&
        result.kind17375Published &&
        result.kind375Published;

    console.log(`\nWallet Created:        ${result.walletCreated ? 'PASS' : 'FAIL'}`);
    console.log(`P2PK Generated:        ${result.p2pkGenerated ? 'PASS' : 'FAIL'}`);
    console.log(`Kind 17375 Published:  ${result.kind17375Published ? 'PASS' : 'FAIL'}`);
    console.log(`Kind 375 Published:    ${result.kind375Published ? 'PASS' : 'FAIL'}`);
    console.log(`Events Encrypted:      ${result.eventsEncrypted ? 'PASS' : 'FAIL'}`);
    console.log(`\nOVERALL: ${result.success ? 'SUCCESS' : 'FAILURE'}`);

    if (result.errors.length > 0) {
        console.log("\nErrors encountered:");
        result.errors.forEach(e => console.log(`  - ${e}`));
    }

    return result;
}

// Run the probe
runProbe()
    .then(result => {
        console.log("\n\nFull result object:");
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    })
    .catch(e => {
        console.error("Probe failed with exception:", e);
        process.exit(1);
    });
