import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RelayMock } from "../../../test/mocks/relay-mock.js";
import { NDK } from "../../ndk/index.js";
import { NDKRelay, NDKRelayStatus } from "../index.js";
import { NDKRelaySet } from "../sets/index.js";

describe("NDKPool", () => {
    it("refuses connecting to blacklisted relays", async () => {
        const blacklistedRelayUrl = "wss://url1";
        const ndk = new NDK({
            blacklistRelayUrls: [blacklistedRelayUrl],
        });
        const { pool } = ndk;

        const relay = new NDKRelay(blacklistedRelayUrl, undefined, ndk);
        pool.addRelay(relay);

        // Check that the relay isn't in the pool's relay Map
        expect(pool.relays.has(blacklistedRelayUrl)).toBe(false);
    });

    it("connects to relays temporarily when creating relay sets", async () => {
        const ndk = new NDK({});
        const { pool } = ndk;
        const set = NDKRelaySet.fromRelayUrls(["wss://purplepag.es"], ndk);

        expect(set.size).toEqual(1);
        expect(pool.relays.size).toEqual(1);
    });

    describe("connect method", () => {
        let ndk: NDK;
        let fastRelay: RelayMock;
        let slowRelay: RelayMock;

        beforeEach(() => {
            // Create a new NDK instance
            ndk = new NDK({
                explicitRelayUrls: [],
            });

            // Create mock relays with different connection speeds
            fastRelay = new RelayMock("wss://fast.relay", {
                autoConnect: false,
                connectionDelay: 50, // connects quickly (50ms)
            });

            slowRelay = new RelayMock("wss://slow.relay", {
                autoConnect: false,
                connectionDelay: 2000, // connects slowly (2000ms)
            });

            // Add the relays to the pool
            ndk.pool.addRelay(fastRelay as unknown as NDKRelay);
            ndk.pool.addRelay(slowRelay as unknown as NDKRelay);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should resolve after timeout even if some relays are still connecting", async () => {
            // This test verifies that pool.connect(timeout) resolves after the specified timeout
            // (or earlier if all relays connect), allowing faster relays to connect but not waiting
            // indefinitely for slower ones.
            // Set up a timer to track elapsed time
            const startTime = Date.now();

            // Call connect with a timeout that's less than the slow relay's connection time
            // but more than the fast relay's connection time
            const timeout = 500;
            await ndk.pool.connect(timeout);

            const elapsedTime = Date.now() - startTime; // Calculate elapsed time *after* connect resolves

            // The fast relay should be connected
            expect(fastRelay.status).toBe(NDKRelayStatus.CONNECTED);

            // The slow relay should still be connecting as the timeout is shorter than its connection delay
            expect(slowRelay.status).toBe(NDKRelayStatus.CONNECTING);

            // Verify the elapsed time is close to the timeout
            expect(elapsedTime).toBeGreaterThanOrEqual(timeout);
            // Allow some buffer for execution time
            expect(elapsedTime).toBeLessThan(timeout + 500);

            // Optional: Wait for the slow relay to eventually connect to ensure no side effects
            await new Promise((resolve) => setTimeout(resolve, 2000));
            expect(slowRelay.status).toBe(NDKRelayStatus.CONNECTED);
        });
    });
});

it("should resolve early if all relays connect before the timeout", async () => {
    const ndk = new NDK({});
    const fastRelay1 = new RelayMock("wss://fast1", { autoConnect: false, connectionDelay: 50 });
    const fastRelay2 = new RelayMock("wss://fast2", { autoConnect: false, connectionDelay: 100 });
    ndk.pool.addRelay(fastRelay1 as unknown as NDKRelay);
    ndk.pool.addRelay(fastRelay2 as unknown as NDKRelay);

    const startTime = Date.now();
    await ndk.pool.connect(1000);
    const elapsedTime = Date.now() - startTime;

    expect(fastRelay1.status).toBe(NDKRelayStatus.CONNECTED);
    expect(fastRelay2.status).toBe(NDKRelayStatus.CONNECTED);
    expect(elapsedTime).toBeLessThan(500); // Should resolve soon after last relay connects
});

it("should resolve at timeout if no relays connect", async () => {
    const ndk = new NDK({});
    // Simulate relays that never connect
    const stuckRelay1 = new RelayMock("wss://stuck1", {
        autoConnect: false,
        connectionDelay: 10000,
    });
    const stuckRelay2 = new RelayMock("wss://stuck2", {
        autoConnect: false,
        connectionDelay: 10000,
    });
    ndk.pool.addRelay(stuckRelay1 as unknown as NDKRelay);
    ndk.pool.addRelay(stuckRelay2 as unknown as NDKRelay);

    const startTime = Date.now();
    await ndk.pool.connect(300);
    const elapsedTime = Date.now() - startTime;

    expect(stuckRelay1.status).toBe(NDKRelayStatus.CONNECTING);
    expect(stuckRelay2.status).toBe(NDKRelayStatus.CONNECTING);
    expect(elapsedTime).toBeGreaterThanOrEqual(300);
    expect(elapsedTime).toBeLessThan(800);
});

it("should resolve at timeout if only some relays connect", async () => {
    const ndk = new NDK({});
    const fastRelay = new RelayMock("wss://fast", { autoConnect: false, connectionDelay: 50 });
    const slowRelay = new RelayMock("wss://slow", { autoConnect: false, connectionDelay: 1000 });
    ndk.pool.addRelay(fastRelay as unknown as NDKRelay);
    ndk.pool.addRelay(slowRelay as unknown as NDKRelay);

    const startTime = Date.now();
    await ndk.pool.connect(200);
    const elapsedTime = Date.now() - startTime;

    expect(fastRelay.status).toBe(NDKRelayStatus.CONNECTED);
    expect(slowRelay.status).toBe(NDKRelayStatus.CONNECTING);
    expect(elapsedTime).toBeGreaterThanOrEqual(200);
    expect(elapsedTime).toBeLessThan(700);
});

it("should resolve immediately if timeout is 0", async () => {
    const ndk = new NDK({});
    const fastRelay = new RelayMock("wss://fast", { autoConnect: false, connectionDelay: 50 });
    ndk.pool.addRelay(fastRelay as unknown as NDKRelay);

    const startTime = Date.now();
    await ndk.pool.connect(0);
    const elapsedTime = Date.now() - startTime;

    // Relay may or may not be connected, but connect() should return immediately
    expect(elapsedTime).toBeLessThan(100);
});

it("should resolve immediately if there are no relays", async () => {
    const ndk2 = new NDK({});
    const startTime = Date.now();
    await ndk2.pool.connect(500);
    const elapsedTime = Date.now() - startTime;
    expect(elapsedTime).toBeLessThan(100);
});

it("should resolve immediately if all relays are already connected", async () => {
    const ndk = new NDK({});
    const fastRelay = new RelayMock("wss://fast", { autoConnect: false, connectionDelay: 0 });
    ndk.pool.addRelay(fastRelay as unknown as NDKRelay);
    await fastRelay.connect();
    expect(fastRelay.status).toBe(NDKRelayStatus.CONNECTED);

    const startTime = Date.now();
    await ndk.pool.connect(500);
    const elapsedTime = Date.now() - startTime;
    expect(elapsedTime).toBeLessThan(100);
});
