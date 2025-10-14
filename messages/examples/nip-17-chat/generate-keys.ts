#!/usr/bin/env tsx
/**
 * Generate test keys for the NIP-17 chat example
 */

import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { nip19 } from "nostr-tools";

function generateIdentity(name: string) {
    const secretKey = generateSecretKey();
    const publicKey = getPublicKey(secretKey);
    const nsec = nip19.nsecEncode(secretKey);
    const npub = nip19.npubEncode(publicKey);

    return {
        name,
        secretKey,
        publicKey,
        nsec,
        npub,
    };
}

// Generate two test identities
const alice = generateIdentity("Alice");
const bob = generateIdentity("Bob");

console.log("🔑 Test identities generated:\n");
console.log("=" + "=".repeat(79));

console.log("\n👩 Alice:");
console.log("  nsec:", alice.nsec);
console.log("  npub:", alice.npub);

console.log("\n👨 Bob:");
console.log("  nsec:", bob.nsec);
console.log("  npub:", bob.npub);

console.log("\n" + "=".repeat(80));
console.log("\n📝 Example commands:\n");

console.log("# Send a message from Alice to Bob:");
console.log(`bunx tsx src/index.ts send ${alice.nsec} ${bob.npub} "Hello Bob!"\n`);

console.log("# Bob listens for messages:");
console.log(`bunx tsx src/index.ts listen ${bob.nsec}\n`);

console.log("# Bob reads conversation with Alice:");
console.log(`bunx tsx src/index.ts read ${bob.nsec} ${alice.npub}\n`);

console.log("# Bob replies to Alice:");
console.log(`bunx tsx src/index.ts send ${bob.nsec} ${alice.npub} "Hey Alice!"\n`);

console.log("# Alice lists all conversations:");
console.log(`bunx tsx src/index.ts list ${alice.nsec}\n`);

console.log("# Alice publishes DM relay list:");
console.log(`bunx tsx src/index.ts relay-list ${alice.nsec} wss://relay.damus.io wss://nos.lol\n`);

console.log("💡 Tip: Save these keys for testing!");
console.log("⚠️  Warning: These are test keys - do not use for real accounts!");