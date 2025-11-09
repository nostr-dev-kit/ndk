/**
 * Test utilities for Registry package
 *
 * Re-exports test utilities from @nostr-dev-kit/ndk/test which provides:
 * - UserGenerator: Generate deterministic test users (alice, bob, carol, dave, eve)
 * - SignerGenerator: Generate signers for test users
 * - TestEventFactory: Create signed events, DMs, replies, chains
 * - TestFixture: Complete test environment with NDK instance
 * - RelayMock: Mock relay for testing subscriptions and publishing
 * - EventGenerator: Generate various event types
 * - TimeController: Control time in tests
 *
 * @example
 * ```ts
 * import { UserGenerator, TestEventFactory, createTestNDK } from './test-utils';
 *
 * const ndk = createTestNDK();
 * const alice = await UserGenerator.getUser("alice", ndk);
 * const factory = new TestEventFactory(ndk);
 * const note = await factory.createSignedTextNote("Hello world", "alice");
 * ```
 */

export {
    UserGenerator,
    SignerGenerator,
    TestEventFactory,
    TestFixture,
    EventGenerator,
    RelayMock,
    RelayPoolMock,
    TimeController,
    withTimeControl,
    mockNutzap,
    mockProof,
} from "@nostr-dev-kit/ndk/test";

import { createNDK, type NDKSvelte } from "@nostr-dev-kit/svelte";

/**
 * Create a test NDK instance with default configuration
 *
 * @param relayUrls - Optional relay URLs (defaults to ["wss://relay.test"])
 * @returns Configured NDKSvelte instance for testing
 *
 * @example
 * ```ts
 * const ndk = createTestNDK();
 * const ndk2 = createTestNDK(["wss://relay1.test", "wss://relay2.test"]);
 * ```
 */
export function createTestNDK(relayUrls: string[] = ["wss://relay.test"]): NDKSvelte {
    return createNDK({
        explicitRelayUrls: relayUrls,
    });
}

import { flushSync } from "svelte";

/**
 * Wait for reactive effects to settle
 *
 * Useful when testing Svelte 5 runes and $effect blocks.
 * Call this after triggering reactive changes to ensure
 * effects have run before making assertions.
 *
 * Uses Svelte's flushSync() to synchronously execute pending effects,
 * which is more reliable than setTimeout-based approaches.
 *
 * @example
 * ```ts
 * setReactiveState(newValue);
 * flushEffects();
 * expect(result).toBe(expectedValue);
 * ```
 */
export function flushEffects(): void {
    flushSync();
}

/**
 * @deprecated Use flushEffects() instead. This uses flushSync() which is more reliable.
 * Kept for backwards compatibility with existing tests.
 */
export function waitForEffects(ms: number = 10): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a valid hex pubkey for testing
 *
 * Creates a deterministic 64-character hex string for use as a pubkey in tests.
 *
 * @param seed - String to use as seed (defaults to "test")
 * @returns 64-character hex string
 *
 * @example
 * ```ts
 * const pubkey1 = generateTestPubkey(); // Uses "test" as seed
 * const pubkey2 = generateTestPubkey("user1");
 * const pubkey3 = generateTestPubkey("user2");
 * ```
 */
export function generateTestPubkey(seed: string = "test"): string {
    // Create a deterministic 64-char hex string from the seed
    const repeated = (seed + seed + seed + seed + seed + seed + seed + seed)
        .slice(0, 64)
        .split('')
        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 64);

    return repeated.padEnd(64, '0');
}

/**
 * Generate a valid event ID for testing
 *
 * Creates a deterministic 64-character hex string for use as an event ID.
 *
 * @param seed - String to use as seed (defaults to "event")
 * @returns 64-character hex string
 *
 * @example
 * ```ts
 * testEvent.id = generateTestEventId("note1");
 * testEvent.id = generateTestEventId(); // Uses "event" as seed
 * ```
 */
export function generateTestEventId(seed: string = "event"): string {
    return generateTestPubkey(seed);
}
