import { generateSecretKey } from "nostr-tools";
import type { NostrEvent } from "../../index.js";
import { NDKPrivateKeySigner } from "./index";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { nip19 } from "nostr-tools";

describe("NDKPrivateKeySigner", () => {
    it("generates a new NDKPrivateKeySigner instance with a private key", () => {
        const signer = NDKPrivateKeySigner.generate();
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toBeDefined();
    });

    it("creates a new NDKPrivateKeySigner instance with a provided Uint8Array private key", () => {
        const privateKey = generateSecretKey();
        const signer = new NDKPrivateKeySigner(privateKey);
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toBe(bytesToHex(privateKey));
        expect(signer.privateKey?.length).toBe(64);
    });

    it("creates a new NDKPrivateKeySigner instance with a provided hex encoded private key", async () => {
        const privateKeyString = "0277cc53c89ca9c8a441987265276fafa55bf5bed8a55b16fd640e0d6a0c21e2";
        const signer = new NDKPrivateKeySigner(privateKeyString);
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toEqual(privateKeyString);
        expect(signer.privateKey?.length).toBe(64);
        const user = await signer.user();
        expect(user.pubkey).toBe(
            "c44f2be1b2fb5371330386046e60207bbd84938d4812ee0c7a3c11be605a7585"
        );
    });

    it("creates a new NDKPrivateKeySigner instance with a provided bech32 encoded private key", async () => {
        const privateKeyString = "nsec1qfmuc57gnj5u3fzpnpex2fm047j4had7mzj4k9havs8q66svy83ql2sdnl";
        const signer = new NDKPrivateKeySigner(privateKeyString);
        const { data } = nip19.decode(privateKeyString);
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toEqual(bytesToHex(data));
        expect(signer.privateKey?.length).toBe(64);
        const user = await signer.user();
        expect(user.pubkey).toBe(
            "c44f2be1b2fb5371330386046e60207bbd84938d4812ee0c7a3c11be605a7585"
        );
    });

    it("signs a NostrEvent with the private key", async () => {
        const privateKey = generateSecretKey();
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
