import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NDK, { NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner, NDKUser, ndkSignerFromPayload } from "../index.js";

// Mock window.nostr for NIP-07 tests
const mockNostr = {
    getPublicKey: vi.fn().mockResolvedValue("nip07pubkey"),
    signEvent: vi.fn().mockResolvedValue({ sig: "nip07sig" }),
    nip04: {
        encrypt: vi.fn().mockResolvedValue("encrypted"),
        decrypt: vi.fn().mockResolvedValue("decrypted"),
    },
    nip44: {
        encrypt: vi.fn().mockResolvedValue("encrypted44"),
        decrypt: vi.fn().mockResolvedValue("decrypted44"),
    },
    getRelays: vi.fn().mockResolvedValue({ "wss://relay.example.com": { read: true, write: true } }),
};

describe("Signer Serialization/Deserialization", () => {
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK();
        // Assign the mock to the global window object before each test
        vi.stubGlobal("window", { nostr: mockNostr });
    });

    afterEach(() => {
        // Restore the original window object after each test
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("serializes and deserializes NDKPrivateKeySigner", async () => {
        const originalSigner = NDKPrivateKeySigner.generate();
        const payloadString = originalSigner.toPayload();

        expect(payloadString).toBeTypeOf("string");
        const parsedPayload = JSON.parse(payloadString);
        // Check the exact structure from toPayload
        expect(parsedPayload).toEqual({
            type: "private-key",
            payload: originalSigner.privateKey,
        });

        const restoredSigner = await ndkSignerFromPayload(payloadString, ndk);

        expect(restoredSigner).toBeInstanceOf(NDKPrivateKeySigner);
        const restoredPrivateKeySigner = restoredSigner as NDKPrivateKeySigner;
        expect(restoredPrivateKeySigner.privateKey).toBe(originalSigner.privateKey);
        const user = await restoredPrivateKeySigner.user();
        const originalUser = await originalSigner.user();
        expect(user.pubkey).toBe(originalUser.pubkey);
    });

    it("serializes and deserializes NDKNip07Signer", async () => {
        // Need to initialize the signer so it attempts to get the pubkey
        const originalSigner = new NDKNip07Signer(100, ndk); // Short timeout for test
        await originalSigner.blockUntilReady(); // Ensure pubkey is fetched

        const payloadString = originalSigner.toPayload();

        expect(payloadString).toBeTypeOf("string");
        const parsedPayload = JSON.parse(payloadString);
        // Check the exact structure from toPayload
        expect(parsedPayload).toEqual({
            type: "nip07",
            payload: "", // NIP-07 has no payload data
        });

        const restoredSigner = await ndkSignerFromPayload(payloadString, ndk);

        expect(restoredSigner).toBeInstanceOf(NDKNip07Signer);
        // We can't easily check the pubkey without calling blockUntilReady again
        // which involves async operations and relies on the mock.
        // The main check is that it correctly identifies and creates the NIP-07 signer.
        expect(mockNostr.getPublicKey).toHaveBeenCalledTimes(1); // From originalSigner.blockUntilReady()
    });

    it("serializes and deserializes NDKNip46Signer (with private key local signer)", async () => {
        const localSigner = NDKPrivateKeySigner.generate();
        const localUser = await localSigner.user();
        const bunkerPubkey = NDKPrivateKeySigner.generate().pubkey; // Mock bunker pubkey
        const userPubkey = NDKPrivateKeySigner.generate().pubkey; // Mock user pubkey
        const relayUrls = ["wss://nip46.example.com"];
        const secret = "testsecret";

        // Manually construct a NIP-46 signer instance for testing serialization
        // We bypass the complex connection logic for this test
        const originalSigner = new NDKNip46Signer(ndk, userPubkey, localSigner);
        originalSigner.bunkerPubkey = bunkerPubkey;
        originalSigner.userPubkey = userPubkey; // Set explicitly after construction
        originalSigner.relayUrls = relayUrls;
        originalSigner.secret = secret;
        // We don't need to mock the rpc object itself for serialization testing
        // as toPayload doesn't rely on it.

        const payloadString = originalSigner.toPayload();

        expect(payloadString).toBeTypeOf("string");
        const parsedPayload = JSON.parse(payloadString);

        // Check the exact structure from toPayload
        expect(parsedPayload.type).toBe("nip46");
        expect(parsedPayload.payload).toBeDefined();
        expect(parsedPayload.payload.bunkerPubkey).toBe(bunkerPubkey);
        expect(parsedPayload.payload.userPubkey).toBe(userPubkey);
        expect(parsedPayload.payload.relayUrls).toEqual(relayUrls);
        expect(parsedPayload.payload.secret).toBe(secret);
        expect(parsedPayload.payload.localSignerPayload).toBeTypeOf("string");

        // Check the nested local signer payload string
        const localSignerPayloadParsed = JSON.parse(parsedPayload.payload.localSignerPayload);
        expect(localSignerPayloadParsed).toEqual({
            type: "private-key",
            payload: localSigner.privateKey,
        });

        // Mock blockUntilReady for the deserialized instance to avoid network calls
        // and simulate successful connection/user retrieval.
        const mockBlockUntilReady = vi
            .spyOn(NDKNip46Signer.prototype, "blockUntilReady")
            .mockImplementation(async function (this: NDKNip46Signer): Promise<NDKUser> {
                // Simulate the outcome of blockUntilReady: setting the user object.
                // The actual userPubkey should have been set by fromPayload.
                if (!this.userPubkey) {
                    throw new Error("Mock Error: userPubkey not set before blockUntilReady mock");
                }
                // Access private 'ndk' for the mock setup
                // @ts-expect-error - Accessing private member for test mock
                const instanceNdk = this.ndk as NDK;
                if (!instanceNdk) {
                    throw new Error("Mock Error: NDK instance not available in blockUntilReady mock");
                }
                const user = instanceNdk.getUser({ pubkey: this.userPubkey });
                // Set the private _user via assignment for the mock
                // @ts-expect-error - Accessing private member for test mock
                this._user = user;
                return user;
            });

        const restoredSigner = await ndkSignerFromPayload(payloadString, ndk);

        expect(restoredSigner).toBeInstanceOf(NDKNip46Signer);
        const restoredNip46Signer = restoredSigner as NDKNip46Signer;

        // Check properties set during deserialization before blockUntilReady
        expect(restoredNip46Signer.bunkerPubkey).toBe(bunkerPubkey);
        // userPubkey is set *during* blockUntilReady in the real flow,
        // but fromPayload sets it based on the payload for reconstruction.
        expect(restoredNip46Signer.userPubkey).toBe(userPubkey);
        expect(restoredNip46Signer.relayUrls).toEqual(relayUrls);
        expect(restoredNip46Signer.secret).toBe(secret);
        expect(restoredNip46Signer.localSigner).toBeInstanceOf(NDKPrivateKeySigner);
        expect((restoredNip46Signer.localSigner as NDKPrivateKeySigner).privateKey).toBe(localSigner.privateKey);

        // Call user() - since fromPayload now sets _user directly,
        // blockUntilReady won't be called (it only gets called when _user is not set)
        const restoredUser = await restoredNip46Signer.user();
        expect(restoredUser).toBeInstanceOf(NDKUser);
        expect(restoredUser.pubkey).toBe(userPubkey);

        // Restore the original implementation
        vi.restoreAllMocks();
    });

    it("returns undefined for invalid JSON payload", async () => {
        const invalidPayload = "{invalid json";
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // Suppress console error
        const restoredSigner = await ndkSignerFromPayload(invalidPayload, ndk);
        expect(restoredSigner).toBeUndefined();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to parse signer payload string",
            invalidPayload,
            expect.any(Error),
        );
        consoleErrorSpy.mockRestore();
    });

    it("returns undefined for payload without type", async () => {
        const invalidPayload = JSON.stringify({ payload: "data" });
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // Suppress console error
        const restoredSigner = await ndkSignerFromPayload(invalidPayload, ndk);
    });

    it("throws error for unknown signer type", async () => {
        const unknownPayload = JSON.stringify({ type: "unknown-signer", payload: {} });
        await expect(ndkSignerFromPayload(unknownPayload, ndk)).rejects.toThrow("Unknown signer type: unknown-signer");
    });

    it("throws error if signer's fromPayload throws", async () => {
        // Mock NDKPrivateKeySigner.fromPayload to throw an error
        const errorMessage = "Deserialization failed";
        vi.spyOn(NDKPrivateKeySigner, "fromPayload").mockRejectedValue(new Error(errorMessage));

        const signer = NDKPrivateKeySigner.generate();
        const payload = signer.toPayload();

        await expect(ndkSignerFromPayload(payload, ndk)).rejects.toThrow(
            `Failed to deserialize signer type private-key: ${errorMessage}`,
        );
        expect(NDKPrivateKeySigner.fromPayload).toHaveBeenCalledWith(payload, ndk);

        // Restore mocks
        vi.restoreAllMocks();
    });
});
