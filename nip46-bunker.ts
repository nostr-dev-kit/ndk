#!/usr/bin/env bun

/**
 * NIP-46 Bunker Test Script
 *
 * This script tests NIP-46 remote signing functionality using a bunker:// URI.
 *
 * To use:
 * 1. Start a bunker signer:
 *    nak bunker --sec nsec1vs9we9zs3qeren3yjrv0nngnnm09wzsjx6t8h7d52zcmu682ak8qhdh2fs relay.nsec.app
 *
 * 2. Copy the bunker:// URI from the output
 *
 * 3. Run this script:
 *    bun nip46-bunker.ts "bunker://89de5739ec437f6c8da7327da06f92e96723722c7201933097f3e8d6916dc746?relay=wss%3A%2F%2Frelay.nsec.app&secret=HXKjoRwOVZZO"
 */

import NDK, { NDKEvent } from "./core/src/index.js";
import { NDKNip46Signer } from "./core/src/signers/nip46/index.js";

async function main() {
  const bunkerUri = process.argv[2];

  if (!bunkerUri) {
    console.error("Error: bunker:// URI required");
    console.error("\nUsage:");
    console.error("  bun nip46-bunker.ts <bunker-uri>");
    console.error("\nExample:");
    console.error('  bun nip46-bunker.ts "bunker://pubkey?relay=wss://relay.nsec.app&secret=xxx"');
    process.exit(1);
  }

  console.log("🔧 Initializing NDK...");

  const ndk = new NDK({
    explicitRelayUrls: [
      "wss://relay.damus.io",
      "wss://nos.lol",
      "wss://relay.nsec.app"
    ],
    enableOutboxModel: false
  });

  console.log("🔌 Connecting to relays...");
  await ndk.connect();
  console.log("✅ Connected to relays");

  console.log("\n🔐 Initializing NIP-46 signer with bunker URI...");
  console.log(`   URI: ${bunkerUri}`);

  const signer = new NDKNip46Signer(ndk, bunkerUri);

  console.log("⏳ Waiting for signer to be ready...");

  signer.on("authUrl", (url: string) => {
    console.log("\n⚠️  Authorization required!");
    console.log(`   Please visit: ${url}`);
  });

  try {
    const user = await signer.blockUntilReady();
    console.log("✅ Signer ready!");
    console.log(`   User pubkey: ${user.pubkey}`);
    console.log(`   User npub: ${user.npub}`);

    ndk.signer = signer;

    console.log("\n📝 Creating test event...");
    const event = new NDKEvent(ndk, {
      kind: 1,
      content: `Hello from NIP-46 bunker test! Timestamp: ${Date.now()}`,
      created_at: Math.floor(Date.now() / 1000),
      tags: []
    });

    console.log("✍️  Signing event via bunker...");
    await event.sign(signer);
    console.log("✅ Event signed!");
    console.log(`   Event ID: ${event.id}`);
    console.log(`   Signature: ${event.sig?.substring(0, 16)}...`);

    console.log("\n📤 Publishing event...");
    const relays = await event.publish();
    console.log(`✅ Published to ${relays.size} relay(s):`);
    relays.forEach(relay => {
      console.log(`   - ${relay.url}`);
    });

    console.log("\n✨ Success! Event published via NIP-46 bunker signer");
    console.log(`\nView on nostr.band: https://nostr.band/${event.encode()}`);

  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
