import "websocket-polyfill";
import { NDK } from "../../ndk/index.js";
import { NDKRelay } from "../index.js";
import { NDKRelaySet } from "../sets/index.js";

describe("NDKPool", () => {
    it("refuses connecting to blacklisted relays", async () => {
        const blacklistedRelay = new NDKRelay("wss://url1");
        const ndk = new NDK({
            blacklistRelayUrls: [blacklistedRelay.url],
        });
        const { pool } = ndk;
        pool.addRelay(blacklistedRelay);

        expect(pool.relays.size).toEqual(0);
    });

    it("connects to relays temporarily when creating relay sets", async () => {
        const ndk = new NDK({});
        const { pool } = ndk;
        const set = NDKRelaySet.fromRelayUrls(["wss://purplepag.es"], ndk);

        expect(set.size).toEqual(1);
        expect(pool.relays.size).toEqual(1);
    });
});
