import { OutboxTracker } from "./tracker.js";
import {NDKUser} from "../user/index.js";
import { NDK } from "../ndk/index.js";

const ndk = new NDK();

describe("OutboxTracker", () => {
    it("increases the reference count when tracking an existing user", () => {
        const tracker = new OutboxTracker();
        const user = new NDKUser({ hexpubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52" });
        const user2 = new NDKUser({ hexpubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52" });

        tracker.track(user, 1, 1);
        tracker.track(user2, 1, 1);

        expect(tracker.data.get(user.hexpubkey)?.refCount).toBe(2);
    });
});