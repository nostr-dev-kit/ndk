import { NDK } from "../ndk/index.js";
import { NDKUser } from "../user/index.js";
import { OutboxTracker } from "./tracker.js";

const ndk = new NDK();

describe("OutboxTracker", () => {
    it("increases the reference count when tracking an existing user", () => {
        const tracker = new OutboxTracker(ndk);
        const user = new NDKUser({
            pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
        });
        const user2 = new NDKUser({
            pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
        });

        tracker.track(user);
        tracker.track(user2);
    });
});
