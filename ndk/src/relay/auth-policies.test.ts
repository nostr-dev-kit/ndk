import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { NDKRelayAuthPolicies } from "./auth-policies";
import type { NDKEvent } from "../events";

const ndk = new NDK({
    explicitRelayUrls: ["ws://localhost/"],
});
const pool = ndk.pool;
const relay = pool.relays.get("ws://localhost/")!;

describe("disconnect policy", () => {
    it("evicts the relay from the pool", () => {
        const policy = NDKRelayAuthPolicies.disconnect(pool);
        ndk.relayAuthDefaultPolicy = policy;
        relay.emit("auth", "1234-challenge");

        // it should have been removed from the pool
        expect(pool.relays.size).toBe(0);
    });
});