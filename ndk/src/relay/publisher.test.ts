import { NDKRelayPublisher } from "./publisher.js";
import { NDKRelay, NDKRelayStatus } from "./index.js";
import { NDKEvent } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import { NDK } from "../ndk/index.js";

function mockConnect(relay: NDKRelay) {
    relay.emit("connect");
    relay.emit("ready");
}

function mockDisconnect(relay: NDKRelay) {
    relay.emit("disconnect");
}

function mockReconnect(relay: NDKRelay) {
    mockDisconnect(relay);
    mockConnect(relay);
}

describe("NDKRelayPublisher", () => {
    const ndk = new NDK();
    let ndkRelayPublisher: NDKRelayPublisher;
    let ndkRelay: NDKRelay;
    let event: NDKEvent;
    beforeEach(() => {
        ndkRelay = new NDKRelay("ws://localhost");
        ndkRelayPublisher = new NDKRelayPublisher(ndkRelay);
        event = new NDKEvent(ndk, {
            kind: NDKKind.Text,
            pubkey: "pubkey",
            content: "Hello world",
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
        });
        jest.resetAllMocks();
    });

    describe("publish", () => {
        it("should publish an event to the relay when connected", async () => {
            jest.spyOn(ndkRelay, "status", "get").mockReturnValue(NDKRelayStatus.CONNECTED);
            const publishEventSpy = jest
                .spyOn(ndkRelayPublisher as any, "publishEvent")
                .mockResolvedValue(true);
            await ndkRelayPublisher.publish(event);
            expect(publishEventSpy).toHaveBeenCalled();
        });

        // it("should try and connect to the relay if not connected", async () => {
        //     expect(ndkRelay.status).toBe(NDKRelayStatus.DISCONNECTED);
        //     const publishEventSpy = jest
        //         .spyOn(ndkRelayPublisher as any, "publishEvent")
        //         .mockResolvedValue(true);
        //     const connectSpy = jest.spyOn(ndkRelay, "connect").mockResolvedValue();
        //     await ndkRelayPublisher.publish(event);
        //     expect(publishEventSpy).toHaveBeenCalled();
        // });
    });
});
