import "websocket-polyfill";
import { NDK } from "../../ndk/index.js";
import { NDKRelay } from "../index.js";

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
});
