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

const uploadRepsonse = {
    status: "success",
    message: "File uploaded successfully",
    nip94_event: {
        tags: [
            ["url", "https://url.png"],
            ["ox", "719171db19525d9d08dd69cb716a18158a249b7b3b3ec4bbdec5698dca104b7b"],
            ["x", "543244319525d9d08dd69cb716a18158a249b7b3b3ec4bbde5435543acb34443"],
            ["m", "image/png"],
            ["dim", "800x600"],
        ],
        content: "",
    },
};

describe("Nip96", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("fetches the spec on first call", async () => {
        const blob = new Blob(["Hello, world!"], { type: "text/plain" });
        const nip96 = new Nip96("nostrcheck.me", ndk);
        ndk.httpFetch = jest
            .fn()
            .mockImplementationOnce(() =>
                Promise.resolve({
                    status: 200,
                    json: () => Promise.resolve(okSpec),
                })
            )
            .mockImplementationOnce(() =>
                Promise.resolve({ status: 200, json: () => Promise.resolve(uploadRepsonse) })
            );
        expect(nip96.spec).toBeUndefined();
        await nip96.upload(blob);
        expect(nip96.spec).toBeDefined();
    });

    it("generates a NIP98 header", async () => {
        const blob = new Blob(["Hello, world!"], { type: "text/plain" });
        const nip96 = new Nip96("nostrcheck.me", ndk);
        nip96.nip98Required = true;
        nip96.spec = okSpec;
        ndk.httpFetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve(uploadRepsonse),
            })
        );
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
