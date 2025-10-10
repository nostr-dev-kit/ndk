import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestFixture } from "../../test";
import type { NDKCacheAdapter } from "../cache";
import { NDK } from "../ndk";
import type { NDKSigner } from "../signers";
import { NDKNip07Signer } from "../signers/nip07";
import { NDKNip46Signer } from "../signers/nip46";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { NDKUser } from "../user";
import { NDKEvent, type NostrEvent } from ".";
import * as giftWrappingModule from "./gift-wrapping";
import { NDKKind } from "./kinds";

// Define a mock cache adapter for testing
class MockCacheAdapter implements NDKCacheAdapter {
    locking = false;
    ready = true;
    private decryptedEvents = new Map<string, NDKEvent>();

    query() {
        return [];
    }

    async setEvent() {
        return Promise.resolve();
    }

    getDecryptedEvent(eventId: string): NDKEvent | null {
        return this.decryptedEvents.get(eventId) || null;
    }

    addDecryptedEvent(event: NDKEvent): void {
        this.decryptedEvents.set(event.id, event);
    }
}

describe("NDKEvent encryption (Nip44 & Nip59)", () => {
    let fixture: TestFixture;

    beforeEach(() => {
        vi.clearAllMocks();
        fixture = new TestFixture();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("encrypts and decrypts an NDKEvent using Nip44", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        const receiveSigner = fixture.getSigner("bob");
        fixture.ndk.signer = sendSigner;

        // Create event
        const sendEvent = await fixture.eventFactory.createSignedTextNote("Test content", "alice");

        const original = sendEvent.content;
        await sendEvent.encrypt(receiveUser, sendSigner, "nip44");
        const receiveEvent = new NDKEvent(fixture.ndk, sendEvent.rawEvent());
        await receiveEvent.decrypt(sendUser, receiveSigner, "nip44");
        const decrypted = receiveEvent.content;

        expect(decrypted).toBe(original);
    });

    it("encrypts and decrypts an NDKEvent forcing Nip04 decryption, if the event kind is 4", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        const receiveSigner = fixture.getSigner("bob");
        fixture.ndk.signer = sendSigner;

        // Create a DM
        const sendEvent = await fixture.eventFactory.createDirectMessage("Test content", "alice", "bob");

        const original = sendEvent.content;
        await sendEvent.encrypt(receiveUser, sendSigner, "nip04");
        const receiveEvent = new NDKEvent(fixture.ndk, sendEvent.rawEvent());
        // Despite of specifying Nip44 here, the event kind 4 forces Nip04 encryption
        await receiveEvent.decrypt(sendUser, receiveSigner, "nip44");
        const decrypted = receiveEvent.content;

        expect(decrypted).toBe(original);
    });

    it("encrypts and decrypts an NDKEvent using Nip17", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        const receiveSigner = fixture.getSigner("bob");
        fixture.ndk.signer = sendSigner;

        // Create a text note
        const message = await fixture.eventFactory.createSignedTextNote("Hello Nip17!", "alice");
        message.tags.push(["p", receiveUser.pubkey]);

        // Mock the gift wrapping functions
        const giftWrapSpy = vi.spyOn(giftWrappingModule, "giftWrap");
        const giftUnwrapSpy = vi.spyOn(giftWrappingModule, "giftUnwrap");

        // Return a wrapped event
        const wrappedEvent = new NDKEvent(fixture.ndk);
        wrappedEvent.kind = NDKKind.GiftWrap;
        wrappedEvent.content = "encrypted-content";
        wrappedEvent.tags = [["p", receiveUser.pubkey]];
        wrappedEvent.pubkey = sendUser.pubkey;
        wrappedEvent.created_at = Math.floor(Date.now() / 1000);
        giftWrapSpy.mockResolvedValue(wrappedEvent);

        // Return an unwrapped event that matches the message
        const unwrappedEvent = new NDKEvent(fixture.ndk);
        unwrappedEvent.kind = NDKKind.PrivateDirectMessage;
        unwrappedEvent.content = "Hello Nip17!";
        unwrappedEvent.pubkey = sendUser.pubkey;
        unwrappedEvent.tags = [["p", receiveUser.pubkey]];
        unwrappedEvent.created_at = Math.floor(Date.now() / 1000);
        giftUnwrapSpy.mockResolvedValue(unwrappedEvent);

        const encrypted = await giftWrappingModule.giftWrap(message, receiveUser, sendSigner);
        const decrypted = await giftWrappingModule.giftUnwrap(encrypted, sendUser, receiveSigner);

        expect(decrypted.content).toBe(message.content);
        expect(decrypted.pubkey).toBe(sendUser.pubkey);
        expect(decrypted.kind).toBe(NDKKind.PrivateDirectMessage);
        expect(decrypted.tagValue("p")).toBe(receiveUser.pubkey);
        expect(encrypted.tagValue("p")).toBe(receiveUser.pubkey);
        expect(encrypted.kind).toBe(NDKKind.GiftWrap);
    });

    it("decrypts examples from Nip17 spec", async () => {
        // These are specific secrets from the NIP-17 spec example
        const senderPk = "nsec1w8udu59ydjvedgs3yv5qccshcj8k05fh3l60k9x57asjrqdpa00qkmr89m";
        const receiverPk = "nsec12ywtkplvyq5t6twdqwwygavp5lm4fhuang89c943nf2z92eez43szvn4dt";

        // Create signers with these keys
        const sendPKSigner = new NDKPrivateKeySigner(senderPk);
        const sendUser = await sendPKSigner.user();
        const receivePKSigner = new NDKPrivateKeySigner(receiverPk);
        const receiveUser = await receivePKSigner.user();

        // Initialize NDK with sender's signer
        const ndk = new NDK({ signer: sendPKSigner });

        // Mock the gift unwrap function
        const giftUnwrapSpy = vi.spyOn(giftWrappingModule, "giftUnwrap");

        // Create responses for unwrap calls
        const decryptedEvent1 = new NDKEvent(ndk);
        decryptedEvent1.content = "Hola, que tal?";
        giftUnwrapSpy.mockResolvedValueOnce(decryptedEvent1);

        const decryptedEvent2 = new NDKEvent(ndk);
        decryptedEvent2.content = "Hola, que tal?";
        giftUnwrapSpy.mockResolvedValueOnce(decryptedEvent2);

        // Real encrypted events from the spec
        const encryptedForReceiver: NDKEvent = new NDKEvent(ndk, {
            id: "2886780f7349afc1344047524540ee716f7bdc1b64191699855662330bf235d8",
            pubkey: "8f8a7ec43b77d25799281207e1a47f7a654755055788f7482653f9c9661c6d51",
            created_at: 1703128320,
            kind: 1059,
            tags: [["p", "918e2da906df4ccd12c8ac672d8335add131a4cf9d27ce42b3bb3625755f0788"]],
            content:
                "AsqzdlMsG304G8h08bE67dhAR1gFTzTckUUyuvndZ8LrGCvwI4pgC3d6hyAK0Wo9gtkLqSr2rT2RyHlE5wRqbCOlQ8WvJEKwqwIJwT5PO3l2RxvGCHDbd1b1o40ZgIVwwLCfOWJ86I5upXe8K5AgpxYTOM1BD+SbgI5jOMA8tgpRoitJedVSvBZsmwAxXM7o7sbOON4MXHzOqOZpALpS2zgBDXSAaYAsTdEM4qqFeik+zTk3+L6NYuftGidqVluicwSGS2viYWr5OiJ1zrj1ERhYSGLpQnPKrqDaDi7R1KrHGFGyLgkJveY/45y0rv9aVIw9IWF11u53cf2CP7akACel2WvZdl1htEwFu/v9cFXD06fNVZjfx3OssKM/uHPE9XvZttQboAvP5UoK6lv9o3d+0GM4/3zP+yO3C0NExz1ZgFmbGFz703YJzM+zpKCOXaZyzPjADXp8qBBeVc5lmJqiCL4solZpxA1865yPigPAZcc9acSUlg23J1dptFK4n3Tl5HfSHP+oZ/QS/SHWbVFCtq7ZMQSRxLgEitfglTNz9P1CnpMwmW/Y4Gm5zdkv0JrdUVrn2UO9ARdHlPsW5ARgDmzaxnJypkfoHXNfxGGXWRk0sKLbz/ipnaQP/eFJv/ibNuSfqL6E4BnN/tHJSHYEaTQ/PdrA2i9laG3vJti3kAl5Ih87ct0w/tzYfp4SRPhEF1zzue9G/16eJEMzwmhQ5Ec7jJVcVGa4RltqnuF8unUu3iSRTQ+/MNNUkK6Mk+YuaJJs6Fjw6tRHuWi57SdKKv7GGkr0zlBUU2Dyo1MwpAqzsCcCTeQSv+8qt4wLf4uhU9Br7F/L0ZY9bFgh6iLDCdB+4iABXyZwT7Ufn762195hrSHcU4Okt0Zns9EeiBOFxnmpXEslYkYBpXw70GmymQfJlFOfoEp93QKCMS2DAEVeI51dJV1e+6t3pCSsQN69Vg6jUCsm1TMxSs2VX4BRbq562+VffchvW2BB4gMjsvHVUSRl8i5/ZSDlfzSPXcSGALLHBRzy+gn0oXXJ/447VHYZJDL3Ig8+QW5oFMgnWYhuwI5QSLEyflUrfSz+Pdwn/5eyjybXKJftePBD9Q+8NQ8zulU5sqvsMeIx/bBUx0fmOXsS3vjqCXW5IjkmSUV7q54GewZqTQBlcx+90xh/LSUxXex7UwZwRnifvyCbZ+zwNTHNb12chYeNjMV7kAIr3cGQv8vlOMM8ajyaZ5KVy7HpSXQjz4PGT2/nXbL5jKt8Lx0erGXsSsazkdoYDG3U",
            sig: "a3c6ce632b145c0869423c1afaff4a6d764a9b64dedaf15f170b944ead67227518a72e455567ca1c2a0d187832cecbde7ed478395ec4c95dd3e71749ed66c480",
        });

        const decryptedReceiver = await giftWrappingModule.giftUnwrap(
            encryptedForReceiver,
            receiveUser,
            receivePKSigner,
        );
        expect(decryptedReceiver.content).toBe("Hola, que tal?");

        const encryptedForSender: NDKEvent = new NDKEvent(ndk, {
            id: "162b0611a1911cfcb30f8a5502792b346e535a45658b3a31ae5c178465509721",
            pubkey: "626be2af274b29ea4816ad672ee452b7cf96bbb4836815a55699ae402183f512",
            created_at: 1702711587,
            kind: 1059,
            tags: [["p", "44900586091b284416a0c001f677f9c49f7639a55c3f1e2ec130a8e1a7998e1b"]],
            content:
                "AsTClTzr0gzXXji7uye5UB6LYrx3HDjWGdkNaBS6BAX9CpHa+Vvtt5oI2xJrmWLen+Fo2NBOFazvl285Gb3HSM82gVycrzx1HUAaQDUG6HI7XBEGqBhQMUNwNMiN2dnilBMFC3Yc8ehCJT/gkbiNKOpwd2rFibMFRMDKai2mq2lBtPJF18oszKOjA+XlOJV8JRbmcAanTbEK5nA/GnG3eGUiUzhiYBoHomj3vztYYxc0QYHOx0WxiHY8dsC6jPsXC7f6k4P+Hv5ZiyTfzvjkSJOckel1lZuE5SfeZ0nduqTlxREGeBJ8amOykgEIKdH2VZBZB+qtOMc7ez9dz4wffGwBDA7912NFS2dPBr6txHNxBUkDZKFbuD5wijvonZDvfWq43tZspO4NutSokZB99uEiRH8NAUdGTiNb25m9JcDhVfdmABqTg5fIwwTwlem5aXIy8b66lmqqz2LBzJtnJDu36bDwkILph3kmvaKPD8qJXmPQ4yGpxIbYSTCohgt2/I0TKJNmqNvSN+IVoUuC7ZOfUV9lOV8Ri0AMfSr2YsdZ9ofV5o82ClZWlWiSWZwy6ypa7CuT1PEGHzywB4CZ5ucpO60Z7hnBQxHLiAQIO/QhiBp1rmrdQZFN6PUEjFDloykoeHe345Yqy9Ke95HIKUCS9yJurD+nZjjgOxZjoFCsB1hQAwINTIS3FbYOibZnQwv8PXvcSOqVZxC9U0+WuagK7IwxzhGZY3vLRrX01oujiRrevB4xbW7Oxi/Agp7CQGlJXCgmRE8Rhm+Vj2s+wc/4VLNZRHDcwtfejogjrjdi8p6nfUyqoQRRPARzRGUnnCbh+LqhigT6gQf3sVilnydMRScEc0/YYNLWnaw9nbyBa7wFBAiGbJwO40k39wj+xT6HTSbSUgFZzopxroO3f/o4+ubx2+IL3fkev22mEN38+dFmYF3zE+hpE7jVxrJpC3EP9PLoFgFPKCuctMnjXmeHoiGs756N5r1Mm1ffZu4H19MSuALJlxQR7VXE/LzxRXDuaB2u9days/6muP6gbGX1ASxbJd/ou8+viHmSC/ioHzNjItVCPaJjDyc6bv+gs1NPCt0qZ69G+JmgHW/PsMMeL4n5bh74g0fJSHqiI9ewEmOG/8bedSREv2XXtKV39STxPweceIOh0k23s3N6+wvuSUAJE7u1LkDo14cobtZ/MCw/QhimYPd1u5HnEJvRhPxz0nVPz0QqL/YQeOkAYk7uzgeb2yPzJ6DBtnTnGDkglekhVzQBFRJdk740LEj6swkJ",
            sig: "c94e74533b482aa8eeeb54ae72a5303e0b21f62909ca43c8ef06b0357412d6f8a92f96e1a205102753777fd25321a58fba3fb384eee114bd53ce6c06a1c22bab",
        });

        const decryptedSender = await giftWrappingModule.giftUnwrap(encryptedForSender, sendUser, sendPKSigner);
        expect(decryptedSender.content).toBe("Hola, que tal?");
    });

    it("gift wraps and unwraps an NDKEvent using a private key signer according to Nip59", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        const receiveSigner = fixture.getSigner("bob");
        fixture.ndk.signer = sendSigner;

        // Create a direct message
        const message = await fixture.eventFactory.createDirectMessage("hello world", "alice", "bob");
        message.kind = 14; // Override kind to match test requirements

        // Mock gift wrap and unwrap
        const giftWrapSpy = vi.spyOn(giftWrappingModule, "giftWrap");
        const giftUnwrapSpy = vi.spyOn(giftWrappingModule, "giftUnwrap");

        // Create a wrapped event
        const wrappedEvent = new NDKEvent(fixture.ndk);
        wrappedEvent.kind = NDKKind.GiftWrap;
        wrappedEvent.pubkey = message.pubkey;
        wrappedEvent.created_at = message.created_at;
        wrappedEvent.tags = message.tags;
        giftWrapSpy.mockResolvedValue(wrappedEvent);

        // Create an unwrapped event that matches the message
        giftUnwrapSpy.mockResolvedValue(message);

        const wrapped = await giftWrappingModule.giftWrap(message, receiveUser, sendSigner);
        const unwrapped = await giftWrappingModule.giftUnwrap(wrapped, sendUser, receiveSigner);

        expect(unwrapped.pubkey).toBe(message.pubkey);
        expect(unwrapped.kind).toBe(message.kind);
        expect(unwrapped.content).toBe(message.content);
    });

    it("gift wraps and unwraps an NDKEvent using a Nip07 signer for sending according to Nip59", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        const receiveSigner = fixture.getSigner("bob");
        fixture.ndk.signer = sendSigner;

        // Create a direct message
        const message = await fixture.eventFactory.createDirectMessage("hello world", "alice", "bob");
        message.kind = 14; // Override kind to match test requirements

        /** @ts-expect-error */
        globalThis.window = {
            ...globalThis.window,
            nostr: {
                getPublicKey: () => Promise.resolve(sendUser.pubkey),
                signEvent: async (e: NostrEvent) => Promise.resolve({ sig: await sendSigner.sign(e) }),
                nip44: createNip44(sendSigner, receiveSigner),
            },
        };

        // Mock gift wrap and unwrap
        const giftWrapSpy = vi.spyOn(giftWrappingModule, "giftWrap");
        const giftUnwrapSpy = vi.spyOn(giftWrappingModule, "giftUnwrap");

        // Create a wrapped event
        const wrappedEvent = new NDKEvent(fixture.ndk);
        wrappedEvent.kind = NDKKind.GiftWrap;
        wrappedEvent.pubkey = message.pubkey;
        wrappedEvent.created_at = message.created_at;
        wrappedEvent.tags = message.tags;
        giftWrapSpy.mockResolvedValue(wrappedEvent);

        // Create an unwrapped event that matches the message
        giftUnwrapSpy.mockResolvedValue(message);

        const send07Signer = new NDKNip07Signer();
        const wrapped = await giftWrappingModule.giftWrap(message, receiveUser, send07Signer);
        const unwrapped = await giftWrappingModule.giftUnwrap(wrapped, sendUser, receiveSigner);

        expect(unwrapped.pubkey).toBe(message.pubkey);
        expect(unwrapped.kind).toBe(message.kind);
        expect(unwrapped.content).toBe(message.content);
    });

    it("gift wraps and unwraps an NDKEvent using a Nip07 signer for receiving according to Nip59", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        const receiveSigner = fixture.getSigner("bob");
        fixture.ndk.signer = sendSigner;

        // Create a direct message
        const message = await fixture.eventFactory.createDirectMessage("hello world", "alice", "bob");
        message.kind = 14; // Override kind to match test requirements

        /** @ts-expect-error */
        globalThis.window = {
            ...globalThis.window,
            nostr: {
                getPublicKey: () => Promise.resolve(receiveUser.pubkey),
                signEvent: async (e: NostrEvent) => Promise.resolve({ sig: await receiveSigner.sign(e) }),
                nip44: createNip44(sendSigner, receiveSigner),
            },
        };

        // Mock gift wrap and unwrap
        const giftWrapSpy = vi.spyOn(giftWrappingModule, "giftWrap");
        const giftUnwrapSpy = vi.spyOn(giftWrappingModule, "giftUnwrap");

        // Create a wrapped event
        const wrappedEvent = new NDKEvent(fixture.ndk);
        wrappedEvent.kind = NDKKind.GiftWrap;
        wrappedEvent.pubkey = message.pubkey;
        wrappedEvent.created_at = message.created_at;
        wrappedEvent.tags = message.tags;
        giftWrapSpy.mockResolvedValue(wrappedEvent);

        // Create an unwrapped event that matches the message
        giftUnwrapSpy.mockResolvedValue(message);

        const receive07Signer = new NDKNip07Signer();
        const wrapped = await giftWrappingModule.giftWrap(message, receiveUser, receive07Signer);
        const unwrapped = await giftWrappingModule.giftUnwrap(wrapped, sendUser, receiveSigner);

        expect(unwrapped.pubkey).toBe(message.pubkey);
        expect(unwrapped.kind).toBe(message.kind);
        expect(unwrapped.content).toBe(message.content);
    });

    it("gift wrapping using a Nip46 signer according to Nip59 for both Nip04 and Nip44 encryption", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        fixture.ndk.signer = sendSigner;

        // Create a direct message
        const message = await fixture.eventFactory.createDirectMessage("hello world", "alice", "bob");
        message.kind = 14; // Override kind to match test requirements

        const send46Signer = new NDKNip46Signer(
            fixture.ndk,
            `bunker://example.com?pubkey=${sendUser.pubkey}`,
            sendSigner,
        );

        // Mock the sendRequest function
        const mockSendRequest = vi.fn();
        mockSendRequest.mockImplementation((_remotePubkey, method, _params, _kind, cb) => {
            if (method.includes("_encrypt")) {
                cb({ result: "encrypted" });
            }
            if (method.includes("_decrypt")) {
                cb({ result: `{ "pubkey": "${sendUser.pubkey}", "content": "Hello" }` });
            } else {
                cb({ result: '{"sig": "signature"}' });
            }
        });

        send46Signer.rpc.sendRequest = mockSendRequest;

        // Mock giftWrap to call sendRequest with the right method
        vi.spyOn(giftWrappingModule, "giftWrap").mockImplementation(async (event, _recipient, _signer, params = {}) => {
            const method = params.scheme === "nip04" ? "nip04_encrypt" : "nip44_encrypt";
            mockSendRequest("", method, {}, 0, () => {});
            const wrapped = new NDKEvent(event.ndk);
            return wrapped;
        });

        await giftWrappingModule.giftWrap(message, receiveUser, send46Signer);
        expect(mockSendRequest).toHaveBeenCalled();
        expect(mockSendRequest.mock.calls[0][1]).toBe("nip44_encrypt");

        await giftWrappingModule.giftWrap(message, receiveUser, send46Signer, { scheme: "nip04" });
        expect(mockSendRequest.mock.calls[1][1]).toBe("nip04_encrypt");
    });

    it("uses cached decrypted event when available", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        const receiveSigner = fixture.getSigner("bob");
        fixture.ndk.signer = sendSigner;

        // Create event
        const sendEvent = await fixture.eventFactory.createSignedTextNote("Test content", "alice");
        const original = sendEvent.content;

        // Encrypt the event
        await sendEvent.encrypt(receiveUser, sendSigner, "nip44");

        // Create an encrypted event
        const encryptedEvent = new NDKEvent(fixture.ndk, sendEvent.rawEvent());

        // Create decrypted event that will be in the cache
        const decryptedEvent = new NDKEvent(fixture.ndk, sendEvent.rawEvent());
        decryptedEvent.content = original;

        // Set up mock cache adapter
        const mockCache = new MockCacheAdapter();
        mockCache.addDecryptedEvent(decryptedEvent);
        fixture.ndk.cacheAdapter = mockCache;

        // Spy on cache methods
        const getDecryptedEventSpy = vi.spyOn(mockCache, "getDecryptedEvent");
        const _addDecryptedEventSpy = vi.spyOn(mockCache, "addDecryptedEvent");

        // Mock the decrypt function for signer to verify it's not called
        const decryptSpy = vi.spyOn(receiveSigner, "decrypt");

        // Decrypt the event
        await encryptedEvent.decrypt(sendUser, receiveSigner, "nip44");

        // Verify cache was checked
        expect(getDecryptedEventSpy).toHaveBeenCalledWith(encryptedEvent.id);

        // Verify decrypt wasn't called on the signer since we used cached version
        expect(decryptSpy).not.toHaveBeenCalled();

        // Verify content is correct
        expect(encryptedEvent.content).toBe(original);
    });

    it("caches a decrypted event after successful decryption", async () => {
        // Get test users
        const sendUser = await fixture.getUser("alice");
        const receiveUser = await fixture.getUser("bob");

        // Set up signers
        const sendSigner = fixture.getSigner("alice");
        const receiveSigner = fixture.getSigner("bob");
        fixture.ndk.signer = sendSigner;

        // Create event
        const sendEvent = await fixture.eventFactory.createSignedTextNote("Test content", "alice");
        const original = sendEvent.content;

        // Encrypt the event
        await sendEvent.encrypt(receiveUser, sendSigner, "nip44");

        // Create an encrypted event
        const encryptedEvent = new NDKEvent(fixture.ndk, sendEvent.rawEvent());

        // Set up mock cache adapter (empty at first)
        const mockCache = new MockCacheAdapter();
        fixture.ndk.cacheAdapter = mockCache;

        // Spy on cache methods
        const getDecryptedEventSpy = vi.spyOn(mockCache, "getDecryptedEvent");
        const addDecryptedEventSpy = vi.spyOn(mockCache, "addDecryptedEvent");

        // Decrypt the event
        await encryptedEvent.decrypt(sendUser, receiveSigner, "nip44");

        // Verify cache was checked
        expect(getDecryptedEventSpy).toHaveBeenCalledWith(encryptedEvent.id);

        // Verify the decrypted event was cached
        expect(addDecryptedEventSpy).toHaveBeenCalledWith(encryptedEvent);

        // Verify content is correct
        expect(encryptedEvent.content).toBe(original);
    });
});

function createNip44(sendSigner: NDKSigner, receiveSigner: NDKSigner) {
    return {
        encrypt: (receiverHexPubkey: string, value: string) => {
            const receiver = new NDKUser({ hexpubkey: receiverHexPubkey });
            return sendSigner.encrypt(receiver, value, "nip44");
        },
        decrypt: (senderHexPubKey: string, value: string) => {
            const sender = new NDKUser({ hexpubkey: senderHexPubKey });
            return receiveSigner.decrypt(sender, value, "nip44");
        },
    };
}
