import { NDKRelay } from "./index.js";
import { NDKSubscription } from "../subscription/index.js";
import { NDK } from "../ndk/index.js";

const ndk = new NDK();

describe("NDKRelay", () => {
    let relay;

    beforeEach(() => {
        relay = new NDKRelay("wss://localhost");
    });

    describe("subscribe", () => {
        describe("when using a groupable subscription", () => {
            let sub: NDKSubscription;

            beforeEach(() => {
                sub = new NDKSubscription(
                    ndk,
                    {
                        kinds: [1],
                        authors: ["author1"],
                    },
                    { groupableDelay: 1000 }
                );
            });

            it("groups the subscription", () => {
                ndk.subscribe({ kinds: [1] });
            });
        });
    });
});
