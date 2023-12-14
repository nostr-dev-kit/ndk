import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { NDKRelayAuthPolicies } from "./auth-policies";
import { NDKEvent } from "../events";

const ndk = new NDK({
    explicitRelayUrls: ["ws://localhost"],
});
const pool = ndk.pool;
const relay = pool.relays.get("ws://localhost")!;

describe("disconnect policy", () => {
    it("evicts the relay from the pool", () => {
        const policy = NDKRelayAuthPolicies.disconnect(pool);
        ndk.relayAuthDefaultPolicy = policy;
        relay.emit("auth", "1234-challenge");

        // it should have been removed from the pool
        expect(pool.relays.size).toBe(0);
    });
});

describe("sign in policy", () => {
    it("signs in to the relay", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const policy = NDKRelayAuthPolicies.signIn({ signer });
        ndk.relayAuthDefaultPolicy = policy;

        const relayAuth = jest
            .spyOn(relay, "auth")
            .mockImplementation(async (event: NDKEvent): Promise<void> => {});

        await relay.emit("auth", "1234-challenge");
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        expect(relayAuth).toHaveBeenCalled();

        // evaluate the event that was published
        const event = relayAuth.mock.calls[0][0];
        expect(event.tagValue("relay")).toBe(relay.url);
        expect(event.tagValue("challenge")).toBe("1234-challenge");
    });
});
