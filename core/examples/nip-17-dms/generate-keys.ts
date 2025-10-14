#!/usr/bin/env tsx

import { generateSecretKey } from "nostr-tools/pure";
import { nip19 } from "nostr-tools";
import { getPublicKey } from "nostr-tools/pure";

const aliceKey = generateSecretKey();
const bobKey = generateSecretKey();

const aliceNsec = nip19.nsecEncode(aliceKey);
const aliceNpub = nip19.npubEncode(getPublicKey(aliceKey));

const bobNsec = nip19.nsecEncode(bobKey);
const bobNpub = nip19.npubEncode(getPublicKey(bobKey));

console.log("Alice:");
console.log("  nsec:", aliceNsec);
console.log("  npub:", aliceNpub);
console.log();
console.log("Bob:");
console.log("  nsec:", bobNsec);
console.log("  npub:", bobNpub);
console.log();
console.log("# Test commands:");
console.log();
console.log("# 1. Publish DM relay lists (kind 10050) so messages use proper relay targeting:");
console.log(`bunx tsx src/index.ts relay-list ${aliceNsec} wss://relay.damus.io wss://nos.lol`);
console.log(`bunx tsx src/index.ts relay-list ${bobNsec} wss://relay.damus.io wss://relay.nostr.band`);
console.log();
console.log("# 2. Alice sends to Bob:");
console.log(`bunx tsx src/index.ts send ${aliceNsec} ${bobNpub} "Hello Bob!"`);
console.log();
console.log("# 3. Bob listens for messages:");
console.log(`bunx tsx src/index.ts listen ${bobNsec} 60`);
console.log();
console.log("# 4. Bob replies:");
console.log(`bunx tsx src/index.ts send ${bobNsec} ${aliceNpub} "Hey Alice!"`);
console.log();
console.log("# 5. Alice reads the conversation:");
console.log(`bunx tsx src/index.ts read ${aliceNsec} ${bobNpub}`);
