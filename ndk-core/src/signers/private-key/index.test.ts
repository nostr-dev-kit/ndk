import { bytesToHex } from "@noble/hashes/utils";
import { nip19 } from "nostr-tools";
import { NDKEvent, type NostrEvent } from "../../index.js";
import { NDKPrivateKeySigner } from "./index";

describe("NDKPrivateKeySigner", () => {
    it("generates a new NDKPrivateKeySigner instance with a private key", () => {
        const signer = NDKPrivateKeySigner.generate();
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toBeDefined();
    });

    it("creates a new NDKPrivateKeySigner instance with an nsec", () => {
        const signer = new NDKPrivateKeySigner("nsec1jtwsdszm2n60d50pd96mddjy6pc4t6padw890rcf9vqfhg8ncjtsqg8msz");
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.nsec.startsWith("nsec")).toBe(true);
        expect(signer.pubkey).toBe("c4beafd98c4482e3a615080c09ace2824741e98ba81a3b7bc8debbe7fc8082a3");
    });

    it("creates a new NDKPrivateKeySigner instance with a provided hex encoded private key", async () => {
        const privateKeyString = "0277cc53c89ca9c8a441987265276fafa55bf5bed8a55b16fd640e0d6a0c21e2";
        const signer = new NDKPrivateKeySigner(privateKeyString);
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toEqual(privateKeyString);
        expect(signer.privateKey?.length).toBe(64);
        const user = await signer.user();
        expect(user.pubkey).toBe("c44f2be1b2fb5371330386046e60207bbd84938d4812ee0c7a3c11be605a7585");
    });

    it("creates a new NDKPrivateKeySigner instance with a provided bech32 encoded private key", async () => {
        const privateKeyString = "nsec1qfmuc57gnj5u3fzpnpex2fm047j4had7mzj4k9havs8q66svy83ql2sdnl";
        const signer = new NDKPrivateKeySigner(privateKeyString);
        const { data } = nip19.decode(privateKeyString);
        expect(signer).toBeInstanceOf(NDKPrivateKeySigner);
        expect(signer.privateKey).toEqual(bytesToHex(data));
        expect(signer.privateKey?.length).toBe(64);
        const user = await signer.user();
        expect(user.pubkey).toBe("c44f2be1b2fb5371330386046e60207bbd84938d4812ee0c7a3c11be605a7585");
    });

    it("provides synchronous access to pubkey", () => {
        const signer = NDKPrivateKeySigner.generate();
        expect(signer.pubkey).toBeDefined();
        expect(signer.pubkey).toHaveLength(64);

        // Test with a known private key to verify correct pubkey
        const privateKeyString = "0277cc53c89ca9c8a441987265276fafa55bf5bed8a55b16fd640e0d6a0c21e2";
        const knownSigner = new NDKPrivateKeySigner(privateKeyString);
        expect(knownSigner.pubkey).toBe("c44f2be1b2fb5371330386046e60207bbd84938d4812ee0c7a3c11be605a7585");
    });

    it("signs an event", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const event = new NDKEvent();
        event.content = "test content";
        event.kind = 1;

        await event.sign(signer);

        expect(event.sig).toBeDefined();
        expect(event.sig).toHaveLength(128);
    });
});
