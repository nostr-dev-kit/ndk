#!/usr/bin/env npx tsx

/**
 * Nutzap End-to-End Demo Script
 *
 * This script demonstrates the complete flow of sending and receiving a nutzap (NIP-61)
 * using @nostr-dev-kit/ndk and ndk-wallet.
 *
 * Prerequisites:
 * - Install dependencies: npm install @nostr-dev-kit/ndk ndk-wallet
 * - Run with: npx tsx nutzap-demo.ts
 */

import NDK, { NDKEvent, NDKUser, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "ndk-wallet";

// Configuration constants
const TESTNET_MINT_URL = "https://nofees.testnut.cashu.space";
const PUBLIC_RELAY = "wss://relay.damus.io";

async function runNutzapDemo() {
    console.log("🚀 Starting Nutzap End-to-End Demo\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // ═══════════════════════════════════════════════════════════════
    // 1. PREAMBLE & SETUP
    // ═══════════════════════════════════════════════════════════════

    console.log("📋 Step 1: Setting up NDK instances and wallets\n");

    // Create two NDK instances with the public relay
    const senderNDK = new NDK({
        explicitRelayUrls: [PUBLIC_RELAY],
    });

    const receiverNDK = new NDK({
        explicitRelayUrls: [PUBLIC_RELAY],
    });

    // Generate in-memory signers for both participants
    console.log("🔑 Generating ephemeral keys for Sender and Receiver...");
    const senderSigner = NDKPrivateKeySigner.generate();
    const receiverSigner = NDKPrivateKeySigner.generate();

    // Assign signers to their respective NDK instances
    senderNDK.signer = senderSigner;
    receiverNDK.signer = receiverSigner;

    // Get the users from the signers
    const senderUser = await senderSigner.user();
    const receiverUser = await receiverSigner.user();

    console.log(`👤 Sender pubkey: ${senderUser.pubkey}`);
    console.log(`👤 Receiver pubkey: ${receiverUser.pubkey}\n`);

    // Create wallets for both participants
    console.log("💼 Creating Cashu wallets for both participants...");
    const senderWallet = new NDKCashuWallet(senderNDK);
    senderWallet.user = senderUser;
    senderWallet.mintUrls = [TESTNET_MINT_URL];

    const receiverWallet = new NDKCashuWallet(receiverNDK);
    receiverWallet.user = receiverUser;
    receiverWallet.mintUrls = [TESTNET_MINT_URL];

    // Connect both NDK instances to the relay network
    console.log("🌐 Connecting to relay network...");
    await senderNDK.connect();
    await receiverNDK.connect();
    console.log(`✅ Connected to ${PUBLIC_RELAY}\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // ═══════════════════════════════════════════════════════════════
    // 2. RECEIVER: ADVERTISE WALLET (kind:10019)
    // ═══════════════════════════════════════════════════════════════

    console.log("📋 Step 2: Receiver advertises wallet capabilities\n");
    console.log("📢 Receiver is preparing wallet advertisement...");

    // Create the wallet advertisement event (kind:10019)
    const zapRequestEvent = await receiverWallet.createZapRequest();

    console.log("📤 Publishing kind:10019 wallet advertisement event...");
    await zapRequestEvent.publish();

    console.log("\n📜 Published kind:10019 event content:");
    console.log("  Event ID:", zapRequestEvent.id);
    console.log("  Event kind:", zapRequestEvent.kind);
    console.log("  Event tags:", JSON.stringify(zapRequestEvent.tags, null, 2));
    console.log("  Event content:", zapRequestEvent.content);

    // Wait for relay to process the event
    console.log("\n⏳ Waiting 2 seconds for relay to process the event...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // ═══════════════════════════════════════════════════════════════
    // 3. SENDER: FUND WALLET
    // ═══════════════════════════════════════════════════════════════

    console.log("📋 Step 3: Sender funds their wallet\n");
    console.log("💰 Sender is requesting a deposit of 200 sats...");

    // Request a deposit (Lightning invoice)
    const deposit = await senderWallet.deposit({ amount: 200 });

    console.log("\n⚡ Lightning Invoice Generated:");
    console.log(`   ${deposit.invoice}\n`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  ACTION REQUIRED: Please pay this invoice to continue!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⏳ Waiting for payment confirmation...\n");

    // Set up the payment listener
    deposit.on("paid", async () => {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log("✅ DEPOSIT CONFIRMED: Sender's deposit of 200 sats received.");
        console.log(`ℹ️  Sender\'s initial balance: ${senderWallet.balance} sats\n`);

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        // ═══════════════════════════════════════════════════════════════
        // 4. SENDER: EXECUTE NUTZAP (kind:9321)
        // ═══════════════════════════════════════════════════════════════

        console.log("📋 Step 4: Sender executes nutzap transfer\n");

        // Log initial balances
        console.log("💸 Initial wallet balances:");
        console.log(`   Sender:   ${senderWallet.balance} sats`);
        console.log(`   Receiver: ${receiverWallet.balance} sats (should be 0)\n`);

        console.log("🚀 Sender is sending 50 sats to Receiver...");
        console.log("   This will automatically:");
        console.log("   • Fetch Receiver's kind:10019 profile");
        console.log("   • Create P2PK-locked proofs");
        console.log("   • Construct and publish kind:9321 nutzap event\n");

        try {
            // Execute the nutzap send operation
            const zapEvent = await senderWallet.send({
                amount: 50,
                to: receiverUser.pubkey,
            });

            console.log("✅ Nutzap sent successfully!");
            console.log(`   Event ID: ${zapEvent.id}`);
            console.log(`   Sender\'s new balance: ${senderWallet.balance} sats\n`);

            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

            // ═══════════════════════════════════════════════════════════════
            // 5. RECEIVER: CLAIM THE NUTZAP
            // ═══════════════════════════════════════════════════════════════

            console.log("📋 Step 5: Receiver claims the nutzap\n");
            console.log("🔍 Receiver is fetching the nutzap event...");

            // Ensure the receiver has the event locally
            const fetchedEvent = await receiverNDK.fetchEvent(zapEvent.id);
            if (fetchedEvent) {
                console.log(`✅ Event ${zapEvent.id} fetched successfully`);
            }

            console.log("🔓 Receiver is claiming the P2PK-locked proofs...");
            console.log("   This handles:");
            console.log("   • Proof validation");
            console.log("   • P2PK signature verification");
            console.log("   • Token redemption at the mint\n");

            // Claim the nutzap
            await receiverWallet.receive(zapEvent);

            console.log("✅ Nutzap has been successfully claimed!\n");

            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

            // ═══════════════════════════════════════════════════════════════
            // 6. FINAL VERIFICATION
            // ═══════════════════════════════════════════════════════════════

            console.log("📋 Step 6: Final balance verification\n");

            console.log("💰 Final wallet balances:");
            console.log(`   Sender:   ${senderWallet.balance} sats (started with 200, sent 50)`);
            console.log(`   Receiver: ${receiverWallet.balance} sats (started with 0, received 50)\n`);

            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("🎉 NUTZAP DEMO COMPLETED SUCCESSFULLY! 🎉");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

            console.log("Summary:");
            console.log("• Successfully created two wallets on testnet mint");
            console.log("• Receiver advertised wallet capabilities (kind:10019)");
            console.log("• Sender funded wallet with 200 sats");
            console.log("• Sender sent 50 sats via nutzap (kind:9321)");
            console.log("• Receiver successfully claimed the nutzap");
            console.log("• ~50 sats transferred from Sender to Receiver\n");

            // Clean up connections
            console.log("🧹 Cleaning up connections...");
            senderNDK.pool?.closeAllRelays();
            receiverNDK.pool?.closeAllRelays();
            console.log("✅ Demo complete. Goodbye!\n");
        } catch (error) {
            console.error("❌ Error during nutzap transfer:", error);
            console.log("\nTroubleshooting tips:");
            console.log("• Ensure both wallets are properly initialized");
            console.log("• Check that the mint is online and responsive");
            console.log("• Verify relay connectivity");
            console.log("• Make sure the receiver's kind:10019 event was published");
        }
    });

    // Handle deposit errors
    deposit.on("error", (error: Error) => {
        console.error("❌ Deposit error:", error.message);
        console.log("\nTroubleshooting:");
        console.log("• Check if the Lightning invoice is valid");
        console.log("• Ensure the mint is online");
        console.log("• Try with a different amount");
    });
}

// Error handling wrapper
async function main() {
    try {
        await runNutzapDemo();
    } catch (error) {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    }
}

// Run the demo
main();
