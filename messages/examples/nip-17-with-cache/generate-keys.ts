#!/usr/bin/env tsx
/**
 * Generate test keys for the example
 */

import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { writeFileSync } from 'fs';

// Generate keys for Alice
const aliceSecretKey = generateSecretKey();
const alicePrivateKey = bytesToHex(aliceSecretKey);
const alicePublicKey = getPublicKey(aliceSecretKey);

// Generate keys for Bob
const bobSecretKey = generateSecretKey();
const bobPrivateKey = bytesToHex(bobSecretKey);
const bobPublicKey = getPublicKey(bobSecretKey);

const keys = {
    alice: alicePrivateKey,
    bob: bobPrivateKey
};

// Save to file
writeFileSync('./keys.json', JSON.stringify(keys, null, 2));

console.log('🔑 Generated keys for Alice and Bob');
console.log('\nAlice:');
console.log('  Private key:', alicePrivateKey);
console.log('  Public key:', alicePublicKey);
console.log('\nBob:');
console.log('  Private key:', bobPrivateKey);
console.log('  Public key:', bobPublicKey);
console.log('\n✅ Keys saved to keys.json');
console.log('\nUsage:');
console.log('  USER=alice bun start <command>  # Run as Alice');
console.log('  USER=bob bun start <command>    # Run as Bob');