/**
 * Test utilities for NDK Svelte tests
 *
 * Re-exports useful test utilities from ndk-core and provides
 * Svelte-specific test helpers.
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

// Re-export all test utilities from ndk-core
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
    type Names,
} from "@nostr-dev-kit/ndk/test";

import { createNDK, type NDKSvelte } from "./ndk-svelte.svelte.js";

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

/**
 * Wait for reactive effects to settle
 *
 * Useful when testing Svelte 5 runes and $effect blocks.
 * Call this after triggering reactive changes to ensure
 * effects have run before making assertions.
 *
 * @param ms - Milliseconds to wait (defaults to 10ms)
 * @returns Promise that resolves after the specified delay
 *
 * @example
 * ```ts
 * setReactiveState(newValue);
 * await waitForEffects();
 * expect(result).toBe(expectedValue);
 * ```
 */
export function waitForEffects(ms: number = 10): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a cleanup function for $effect.root
 *
 * Helper to manage $effect.root cleanup in tests.
 * Returns a cleanup function and a setter to update the cleanup reference.
 *
 * @returns Tuple of [cleanup function, setter for cleanup reference]
 *
 * @example
 * ```ts
 * let [cleanup, setCleanup] = createEffectCleanup();
 *
 * setCleanup($effect.root(() => {
 *     // Your reactive code here
 *     createSubscription(ndk, () => config);
 * }));
 *
 * // Later, in afterEach:
 * cleanup?.();
 * ```
 */
export function createEffectCleanup(): [() => void, (fn: (() => void) | undefined) => void] {
    let cleanupFn: (() => void) | undefined;

    const cleanup = () => {
        if (cleanupFn) {
            cleanupFn();
            cleanupFn = undefined;
        }
    };

    const setCleanup = (fn: (() => void) | undefined) => {
        cleanupFn = fn;
    };

    return [cleanup, setCleanup];
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
