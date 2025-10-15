import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NDKEvent } from "../events";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";
import type { NDKRelayAuthPolicy } from "./auth-policies";
import { NDKRelay } from "./index";

describe("Auth-required publish retry", () => {
    let ndk: NDK;
    let relay: NDKRelay;

    beforeEach(() => {
        const signer = NDKPrivateKeySigner.generate();
        ndk = new NDK({ signer });
        relay = new NDKRelay("wss://test-relay.example.com", undefined, ndk);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should retry publish after successful auth when relay returns auth-required", async () => {
        // Mock the WebSocket
        const mockWs = {
            readyState: WebSocket.OPEN,
            send: vi.fn(),
            close: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };

        // Replace the websocket
        (relay.connectivity as any).ws = mockWs;
        (relay.connectivity as any)._status = 2; // CONNECTED

        // Create an auth policy that approves auth
        const authPolicy: NDKRelayAuthPolicy = vi.fn().mockResolvedValue(true);
        relay.authPolicy = authPolicy;

        // Create a test event
        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = "Test event";
        event.pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
        await event.sign();

        // Start the publish (don't await yet)
        const publishPromise = relay.publish(event);

        // Simulate the relay responding with auth-required
        const eventMessage = {
            data: JSON.stringify(["OK", event.id, false, "auth-required: please authenticate"]),
        };
        (relay.connectivity as any).onMessage(eventMessage);

        // Simulate the relay requesting auth
        const authMessage = {
            data: JSON.stringify(["AUTH", "test-challenge"]),
        };
        (relay.connectivity as any).onMessage(authMessage);

        // Wait a bit for auth flow to start
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Simulate successful AUTH response
        const authOkMessage = {
            data: JSON.stringify(["OK", "auth-event-id", true, ""]),
        };
        (relay.connectivity as any).onMessage(authOkMessage);

        // Wait for auth to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Verify the event was sent twice (once initially, once after auth)
        expect(mockWs.send).toHaveBeenCalledTimes(2);

        // The second send should be the retry
        const calls = (mockWs.send as any).mock.calls;
        const secondCall = calls[1][0];
        expect(secondCall).toContain('"EVENT"');
        expect(secondCall).toContain(event.id);

        // Now simulate successful publish after auth
        const successMessage = {
            data: JSON.stringify(["OK", event.id, true, ""]),
        };
        (relay.connectivity as any).onMessage(successMessage);

        // The publish promise should now resolve
        await expect(publishPromise).resolves.toBeDefined();
    });

    it("should reject publish when auth fails after auth-required", async () => {
        // Mock the WebSocket
        const mockWs = {
            readyState: WebSocket.OPEN,
            send: vi.fn(),
            close: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };

        (relay.connectivity as any).ws = mockWs;
        (relay.connectivity as any)._status = 2; // CONNECTED

        // Create an auth policy that approves auth but will fail
        const authPolicy: NDKRelayAuthPolicy = vi.fn().mockResolvedValue(true);
        relay.authPolicy = authPolicy;

        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = "Test event";
        event.pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
        await event.sign();

        const publishPromise = relay.publish(event);

        // Simulate auth-required response
        const eventMessage = {
            data: JSON.stringify(["OK", event.id, false, "auth-required: please authenticate"]),
        };
        (relay.connectivity as any).onMessage(eventMessage);

        // Simulate auth request
        const authMessage = {
            data: JSON.stringify(["AUTH", "test-challenge"]),
        };
        (relay.connectivity as any).onMessage(authMessage);

        await new Promise((resolve) => setTimeout(resolve, 50));

        // Simulate AUTH failure
        const authOkMessage = {
            data: JSON.stringify(["OK", "auth-event-id", false, "invalid signature"]),
        };
        (relay.connectivity as any).onMessage(authOkMessage);

        // The publish promise should reject
        await expect(publishPromise).rejects.toThrow();
    });

    it("should immediately reject non-auth-required errors", async () => {
        const mockWs = {
            readyState: WebSocket.OPEN,
            send: vi.fn(),
            close: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };

        (relay.connectivity as any).ws = mockWs;
        (relay.connectivity as any)._status = 2; // CONNECTED

        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = "Test event";
        event.pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
        await event.sign();

        const publishPromise = relay.publish(event);

        // Simulate a different error (not auth-required)
        const eventMessage = {
            data: JSON.stringify(["OK", event.id, false, "invalid: event rejected"]),
        };
        (relay.connectivity as any).onMessage(eventMessage);

        // Should reject immediately with the error
        await expect(publishPromise).rejects.toThrow("invalid: event rejected");
    });

    it("should handle multiple pending publishes with auth-required", async () => {
        const mockWs = {
            readyState: WebSocket.OPEN,
            send: vi.fn(),
            close: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };

        (relay.connectivity as any).ws = mockWs;
        (relay.connectivity as any)._status = 2; // CONNECTED

        const authPolicy: NDKRelayAuthPolicy = vi.fn().mockResolvedValue(true);
        relay.authPolicy = authPolicy;

        // Create two events
        const event1 = new NDKEvent(ndk);
        event1.kind = 1;
        event1.content = "Test event 1";
        event1.pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
        await event1.sign();

        const event2 = new NDKEvent(ndk);
        event2.kind = 1;
        event2.content = "Test event 2";
        event2.pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
        await event2.sign();

        // Publish both
        const publish1Promise = relay.publish(event1);
        const publish2Promise = relay.publish(event2);

        // Both get auth-required
        (relay.connectivity as any).onMessage({
            data: JSON.stringify(["OK", event1.id, false, "auth-required"]),
        });
        (relay.connectivity as any).onMessage({
            data: JSON.stringify(["OK", event2.id, false, "auth-required"]),
        });

        // Auth flow
        (relay.connectivity as any).onMessage({
            data: JSON.stringify(["AUTH", "test-challenge"]),
        });

        await new Promise((resolve) => setTimeout(resolve, 50));

        (relay.connectivity as any).onMessage({
            data: JSON.stringify(["OK", "auth-event-id", true, ""]),
        });

        await new Promise((resolve) => setTimeout(resolve, 50));

        // Both events should be retried
        const calls = (mockWs.send as any).mock.calls;
        const eventSends = calls.filter((call: any[]) => call[0].includes('"EVENT"'));
        expect(eventSends.length).toBeGreaterThanOrEqual(4); // 2 initial + 2 retries

        // Both should eventually succeed
        (relay.connectivity as any).onMessage({
            data: JSON.stringify(["OK", event1.id, true, ""]),
        });
        (relay.connectivity as any).onMessage({
            data: JSON.stringify(["OK", event2.id, true, ""]),
        });

        await expect(publish1Promise).resolves.toBeDefined();
        await expect(publish2Promise).resolves.toBeDefined();
    });
});
