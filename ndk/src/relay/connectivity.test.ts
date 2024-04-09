import { NDKRelayConnectivity } from "./connectivity.js";
import { NDKRelay, NDKRelayStatus } from "./index.js";

describe("NDKRelayConnectivity", () => {
    let ndkRelayConnectivity: NDKRelayConnectivity;
    let ndkRelayMock: NDKRelay;
    let relayConnectSpy: jest.SpyInstance;
    beforeEach(() => {
        ndkRelayMock = new NDKRelay("ws://localhost");
        ndkRelayConnectivity = new NDKRelayConnectivity(ndkRelayMock);
        // Mock the connect method on nostr tools relay
        relayConnectSpy = jest.spyOn(ndkRelayConnectivity.relay, "connect").mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("connects and disconnects from the relay", async () => {
        // First connect
        await ndkRelayConnectivity.connect();
        expect(relayConnectSpy).toHaveBeenCalled();
        expect(ndkRelayConnectivity.status).toBe(NDKRelayStatus.CONNECTED);
        expect(ndkRelayConnectivity.isAvailable()).toBe(true);
        expect(ndkRelayConnectivity.connectionStats.attempts).toBe(1);
        expect(ndkRelayConnectivity.connectionStats.connectedAt).toBeDefined();
        // Then disconnect
        ndkRelayConnectivity.disconnect();
        expect(ndkRelayConnectivity.status).toBe(NDKRelayStatus.DISCONNECTING);
        expect(ndkRelayConnectivity.isAvailable()).toBe(false);
        // Can't test the connection stats updates without onclose callback firing from relay
    });
});