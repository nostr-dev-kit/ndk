import { NDKRelay } from "./index.js";
import { NDK } from "../ndk/index.js";
import { NDKSubscription, NDKSubscriptionCacheUsage } from "../subscription/index.js";
import { NDKRelaySet } from "./sets/index.js";

const ndk = new NDK();

const filter = { kinds: [9999] };
const relay = new NDKRelay("ws://localhost");

ndk.addExplicitRelay(relay, undefined, false);

jest.spyOn(relay.connectivity, "connect").mockImplementation(async () => {
    relay.emit("connect");
    relay.emit("ready");
});

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
                    undefined,
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

        describe("when the relay is connected", () => {
            let isAvailableCall: any;

            beforeEach(() => {
                isAvailableCall = jest
                    .spyOn(relay.connectivity, "isAvailable")
                    .mockReturnValue(true);
            });

            afterEach(() => {
                isAvailableCall.mockRestore();
            });

            describe("verification skipping", () => {
                describe("when the relay is trusted", () => {
                    beforeEach(() => {
                        relay.trusted = true;
                    });

                    afterEach(() => {
                        relay.trusted = false;
                    });

                    it("skips verification on subscriptions", () => {
                        ndk.subscribe(
                            {},
                            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY, groupable: false }
                        );

                        expect(relaySub).toHaveBeenCalledWith(
                            [{}],
                            expect.objectContaining({ skipVerification: true })
                        );
                    });
                });

                describe("when the relay is not trusted", () => {
                    it("does not skips verification on subscriptions", () => {
                        ndk.subscribe(
                            {},
                            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY, groupable: false }
                        );

                        expect(relaySub).toHaveBeenCalledWith(
                            [{}],
                            expect.not.objectContaining({ skipVerification: true })
                        );
                    });

                    it("skips when the subscription is trusted", () => {
                        ndk.subscribe(
                            {},
                            {
                                cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
                                groupable: false,
                                skipVerification: true,
                            }
                        );

                        expect(relaySub).toHaveBeenCalledWith(
                            [{}],
                            expect.objectContaining({ skipVerification: true })
                        );
                    });
                });
            });
        });
    });
});
