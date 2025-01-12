import { NDKRelay } from "./index.js";
import { NDK } from "../ndk/index.js";
import { NDKRelayStatus } from "./index.js";

const ndk = new NDK();
const relay = new NDKRelay("ws://localhost/");
ndk.addExplicitRelay(relay, undefined, false);

// function mockConnect(relay: NDKRelay) {
//     relay.emit("connect");
//     relay.emit("ready");
// }

// function mockDisconnect(relay: NDKRelay) {
//     relay.emit("disconnect");
// }

// function mockReconnect(relay: NDKRelay) {
//     mockDisconnect(relay);
//     mockConnect(relay);
// }

describe("NDKRelay", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // let relaySub: any;

    // beforeEach(() => {
    //     relaySub = jest.spyOn(relay.connectivity.relay, "subscribe");
    // });

    // afterEach(() => {
    //     relaySub.mockRestore();
    //     jest.clearAllMocks();
    //     jest.resetAllMocks();
    // });

    describe("constructor", () => {
        it("creates a new NDKRelay", () => {
            expect(relay).toBeInstanceOf(NDKRelay);
            expect(relay.url).toBe("ws://localhost/");
            expect(relay.status).toEqual(NDKRelayStatus.DISCONNECTED);
        });
    });

    describe("disconnect", () => {
        it("it doesn't try and disconnect if it already is disconnected", async () => {
            const mockedDisconnect = jest.spyOn(relay.connectivity, "disconnect");
            jest.spyOn(relay.connectivity, "status", "get").mockReturnValue(
                NDKRelayStatus.DISCONNECTED
            );
            relay.disconnect();
            expect(relay.status).toEqual(NDKRelayStatus.DISCONNECTED);
            expect(mockedDisconnect).not.toHaveBeenCalled();
        });
    });

    describe("referenceTags", () => {
        it("returns the right tag reference for the relay", () => {
            expect(relay.referenceTags()).toEqual([["r", "ws://localhost/"]]);
        });
    });

    /**
     * TODO: Need to refactor these tests
     */
    // describe("subscribe", () => {
    //     describe("when the REQ is sent to the relay", () => {
    //         let sub: NDKSubscription;

    //         beforeEach(() => {
    //             sub = ndk.subscribe(
    //                 filter,
    //                 { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY, groupable: false },
    //                 undefined,
    //                 false
    //             );

    //             sub.start();
    //             mockConnect(relay);
    //         });

    //         afterEach(() => {
    //             sub.stop();
    //         });

    //         it("calls the subscription execution method when it connects", () => {
    //             expect(relaySub).toHaveBeenCalledTimes(1);
    //         });

    //         describe("and the relay disconnects", () => {
    //             it("resends the REQ when the relay reconnects", () => {
    //                 expect(relaySub).toHaveBeenCalledTimes(1);
    //                 mockReconnect(relay);
    //                 expect(relaySub).toHaveBeenCalledTimes(2);
    //             });
    //         });
    //     });

    //     describe("when the relay is connected", () => {
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         let isAvailableCall: any;

    //         beforeEach(() => {
    //             isAvailableCall = jest
    //                 .spyOn(relay.connectivity, "isAvailable")
    //                 .mockReturnValue(true);
    //         });

    //         afterEach(() => {
    //             isAvailableCall.mockRestore();
    //         });

    //         describe("verification skipping", () => {
    //             describe("when the relay is trusted", () => {
    //                 beforeEach(() => {
    //                     relay.trusted = true;
    //                 });

    //                 afterEach(() => {
    //                     relay.trusted = false;
    //                 });

    //                 it("skips verification on subscriptions", () => {
    //                     ndk.subscribe(
    //                         {},
    //                         { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY, groupable: false }
    //                     );

    //                     expect(relaySub).toHaveBeenCalledWith(
    //                         [{}],
    //                         expect.objectContaining({ skipVerification: true })
    //                     );
    //                 });
    //             });

    //             describe("when the relay is not trusted", () => {
    //                 it("does not skips verification on subscriptions", () => {
    //                     ndk.subscribe(
    //                         {},
    //                         { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY, groupable: false }
    //                     );

    //                     expect(relaySub).toHaveBeenCalledWith(
    //                         [{}],
    //                         expect.not.objectContaining({ skipVerification: true })
    //                     );
    //                 });

    //                 it("skips when the subscription is trusted", () => {
    //                     ndk.subscribe(
    //                         {},
    //                         {
    //                             cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
    //                             groupable: false,
    //                             skipVerification: true,
    //                         }
    //                     );

    //                     expect(relaySub).toHaveBeenCalledWith(
    //                         [{}],
    //                         expect.objectContaining({ skipVerification: true })
    //                     );
    //                 });
    //             });
    //         });
    //     });
    // });
});
