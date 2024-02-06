import { Nip96 } from ".";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";

const ndk = new NDK();
ndk.signer = NDKPrivateKeySigner.generate();

const okSpec = {
    api_url: "https://api.nostrcheck.me",
    plans: {
        free: {
            name: "Free",
            is_nip98_required: true,
        },
    },
};

describe("Nip96", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("fetches the spec on first call", async () => {
        const blob = new Blob(["Hello, world!"], { type: "text/plain" });
        const nip96 = new Nip96("nostrcheck.me", ndk);
        ndk.httpFetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve(okSpec),
            })
        );
        expect(nip96.spec).toBeUndefined();
        await nip96.upload(blob);
        expect(nip96.spec).toBeDefined();
        console.log(nip96.spec);
    });

    it("generates a NIP98 header", async () => {
        const blob = new Blob(["Hello, world!"], { type: "text/plain" });
        const nip96 = new Nip96("nostrcheck.me", ndk);
        nip96.nip98Required = true;
        nip96.spec = okSpec;
        ndk.httpFetch = jest.fn().mockImplementation(() => Promise.resolve({ status: 200 }));
        await nip96.upload(blob);
        expect(ndk.httpFetch).toHaveBeenCalledWith("https://api.nostrcheck.me", {
            method: "POST",
            headers: {
                Authorization: expect.stringMatching(/^Nostr /),
            },
            body: expect.any(FormData),
        });
    });
});
