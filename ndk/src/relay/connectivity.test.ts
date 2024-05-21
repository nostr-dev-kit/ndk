import { NDKRelayConnectivity } from "./connectivity.js";
import { NDKRelay, NDKRelayStatus } from "./index.js";

describe("NDKRelayConnectivity", () => {
    let ndkRelayConnectivity: NDKRelayConnectivity;
    let ndkRelayMock: NDKRelay;
    let relayConnectSpy: jest.SpyInstance;
    let relayDisconnectSpy: jest.SpyInstance;

    beforeEach(async () => {
        ndkRelayMock = new NDKRelay("ws://localhost");
        ndkRelayConnectivity = new NDKRelayConnectivity(ndkRelayMock);
        // Mock the connect method on nostr tools relay
        relayConnectSpy = jest.spyOn(ndkRelayConnectivity.relay, "connect").mockResolvedValue();
        // Mock the close method on the nostr tools relay
        relayDisconnectSpy = jest.spyOn(ndkRelayConnectivity.relay, "close").mockReturnValue();
        await ndkRelayConnectivity.connect();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("connecting", () => {
        it("calls connect() on the nostr-tools AbstractRelay instance", () => {
            expect(relayConnectSpy).toHaveBeenCalled();
        });
    
        it("updates connected status properly", () => {
            // Check that we updated our status
            expect(ndkRelayConnectivity.status).toBe(NDKRelayStatus.CONNECTED);
            // Check that we're available
            expect(ndkRelayConnectivity.isAvailable()).toBe(true);
        });
    
        it("updates connectionStats on connect", () => {
            expect(ndkRelayConnectivity.connectionStats.attempts).toBe(1);
            expect(ndkRelayConnectivity.connectionStats.connectedAt).toBeDefined();
        });
    })

    // TODO: Test auth

    describe("disconnecting", () => {
        beforeEach(() => {
            ndkRelayConnectivity.disconnect();
        })

        it("disconnects from the relay", async () => {
            expect(relayDisconnectSpy).toHaveBeenCalled();
        });

        it("updates connected status properly", () => {
            expect(ndkRelayConnectivity.status).toBe(NDKRelayStatus.DISCONNECTING);
            expect(ndkRelayConnectivity.isAvailable()).toBe(false);
        })

        // Test that onclose callback was properly called
        it.skip("updates the connectionStats for disconnect", () => {
            expect(ndkRelayConnectivity.connectionStats.connectedAt).toBe(undefined);
            expect(ndkRelayConnectivity.connectionStats.durations.length).toBe(1);
        })

        // TODO: Can we test the emit on NDKRelay?
        // TODO: Test reconnection logic (disconnect called from AbstractRelay)
    })

    

    
});
