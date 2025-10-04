#!/usr/bin/env npx tsx

import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

async function publishFunFact() {
    // Create NDK instance with some popular relays
    const ndk = new NDK({
        explicitRelayUrls: [
            "wss://relay.damus.io",
            "wss://nos.lol",
            "wss://relay.nostr.band",
            "wss://relay.primal.net",
        ],
    });

    // Generate a new ephemeral key pair for this demo
    // In production, you'd use an existing key or NIP-07
    const signer = NDKPrivateKeySigner.generate();
    ndk.signer = signer;

    const user = await signer.user();

    console.log("🔑 Generated ephemeral key pair");
    console.log(`📍 Publishing as: ${user.npub}\n`);

    // Connect to relays
    console.log("🌐 Connecting to relays...");
    await ndk.connect();
    console.log("✅ Connected!\n");

    // Create the fun fact note
    const funFact = new NDKEvent(ndk);
    funFact.kind = 1; // Kind 1 is a regular text note
    funFact.content = `🎉 Fun NDK Fact: NDK (Nostr Dev Kit) supports over 30+ NIPs out of the box, making it one of the most comprehensive Nostr development toolkits! It handles everything from event signing to caching, relay management, and even advanced features like NIP-61 Nutzaps for Cashu-based payments. Built with TypeScript, it provides a developer-friendly API that abstracts the complexities of the Nostr protocol while giving you full control when needed. #nostr #ndk #dev`;

    // Sign and publish the event
    console.log("📝 Publishing fun fact about NDK...\n");
    await funFact.sign();
    await funFact.publish();

    console.log("✨ Published successfully!");
    console.log(`📋 Event ID: ${funFact.id}`);
    console.log(`🔗 View on njump: https://njump.me/${funFact.id}\n`);

    console.log("📄 Full event:");
    console.log(JSON.stringify(funFact.rawEvent(), null, 2));

    // Close connections
    setTimeout(() => {
        for (const relay of ndk.pool?.relays.values() || []) {
            relay.disconnect();
        }
        console.log("\n👋 Connections closed. Goodbye!");
    }, 2000);
}

// Run the demo
publishFunFact().catch(console.error);
