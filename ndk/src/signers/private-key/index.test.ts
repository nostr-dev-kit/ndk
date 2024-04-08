import { generateSecretKey } from "nostr-tools/pure";
import type { NostrEvent } from "../../index.js";
import { NDKUser } from "../../index.js";
import { NDKPrivateKeySigner } from "./index.js";
import { hexToBytes } from "@noble/hashes/utils";

describe("NDKPrivateKeySigner", () => {
    let privateKey: Uint8Array;
    beforeAll(() => {
        privateKey = generateSecretKey();
    });

    it("generates a new NDKPrivateKeySigner instance with a private key", () => {
        const signer = NDKPrivateKeySigner.generate();
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toBeDefined();
        expect(signer.privateKey?.length).toBe(32);
    });

    it("creates a new NDKPrivateKeySigner instance with a provided private key", () => {
        const signer = new NDKPrivateKeySigner(privateKey);
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toBe(privateKey);
    });

    it("returns a user instance with a public key corresponding to the private key", async () => {
        // Hex private key string
        const privateKeyString = "72a14b14b51cd236c66ec77c872c3eed642c6f6970e0ca674ffa05f2a9d58268";
        // Encode to Uint8Array
        const privateKey = hexToBytes(privateKeyString);

        const signer = new NDKPrivateKeySigner(privateKey);
        const user = await signer.user();
        expect(user).toBeInstanceOf(NDKUser);
        expect(user.pubkey).toBe(
            "7e48cebee13c9fb7780db830cebb6245ebfa4ec31a0cdf8f29cf7ee70d71055d"
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
