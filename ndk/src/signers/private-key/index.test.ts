import { generateSecretKey } from "nostr-tools/pure";
import type { NostrEvent } from "../../index.js";
import { NDKUser } from "../../index.js";
import { NDKPrivateKeySigner } from "./index.js";

describe("NDKPrivateKeySigner", () => {
    let privateKey: Uint8Array;
    beforeAll(() => {
        privateKey = generateSecretKey();
    });

    it("generates a new NDKPrivateKeySigner instance with a private key", () => {
        const signer = NDKPrivateKeySigner.generate();
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toBeDefined();
        expect(signer.privateKey?.length).toBe(64);
    });

    it("creates a new NDKPrivateKeySigner instance with a provided private key", () => {
        const signer = new NDKPrivateKeySigner(privateKey);
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toBe(privateKey);
    });

    it("returns a user instance with a public key corresponding to the private key", async () => {
        const signer = new NDKPrivateKeySigner(privateKey);
        const user = await signer.user();
        expect(user).toBeInstanceOf(NDKUser);
        expect(user.pubkey).toBe(
            "07f61c41b44a923952db82e6e7bcd184b059fe087f58f9d9a918da391f38d503"
        );
    });

    it("signs a NostrEvent with the private key", async () => {
        const signer = new NDKPrivateKeySigner(privateKey);

        const event: NostrEvent = {
            pubkey: "07f61c41b44a923952db82e6e7bcd184b059fe087f58f9d9a918da391f38d503",
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: "Test content",
            kind: 1,
        };

        const signature = await signer.sign(event);
        expect(signature).toBeDefined();
        expect(signature.length).toBe(128);
    });
});
