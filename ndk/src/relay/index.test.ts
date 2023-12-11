import { NDKRelay } from "./index.js";
import { NDK } from "../ndk/index.js";
import { NDKSubscription, NDKSubscriptionCacheUsage } from "../subscription/index.js";
import { NDKRelaySet } from "./sets/index.js";

const ndk = new NDK();

const filter = { kinds: [9999] };
const relay = new NDKRelay("ws://localhost");

jest.spyOn(relay.connectivity, "connect").mockImplementation(async () => {
    relay.emit("connect");
});

function mockConnect(relay: NDKRelay) {
    relay.emit("connect");
}

function mockDisconnect(relay: NDKRelay) {
    relay.emit("disconnect");
}

function mockReconnect(relay: NDKRelay) {
    mockDisconnect(relay);
    mockConnect(relay);
}

describe("NDKRelay", () => {
    let relaySub: any;

    beforeEach(() => {
        relaySub = jest.spyOn(relay.connectivity.relay, "sub");
    });

    afterEach(() => {
        relaySub.mockRestore();
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    describe("subscribe", () => {
        describe("when the REQ is sent to the relay", () => {
            let sub: NDKSubscription;

            beforeEach(() => {
                sub = ndk.subscribe(
                    filter,
                    { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY, groupable: false },
                    new NDKRelaySet(new Set([relay]), ndk),
                    false
                );

                sub.start();
                mockConnect(relay);
            });

            afterEach(() => {
                sub.stop();
            });

            it("calls the subscription execution method when it connects", () => {
                expect(relaySub).toHaveBeenCalledTimes(1);
            });

            describe("and the relay disconnects", () => {
                it("resends the REQ when the relay reconnects", () => {
                    expect(relaySub).toHaveBeenCalledTimes(1);
                    mockReconnect(relay);
                    expect(relaySub).toHaveBeenCalledTimes(2);
                });
            });
        });
    });
});
