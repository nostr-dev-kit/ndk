import { beforeEach, describe, expect, it, vi } from "vitest";
import { RelayMock, SignerGenerator, UserGenerator } from "../../../test";
import type { NostrEvent } from "../../events/index";
import type { NDK } from "../../ndk/index";
import type { NDKSubscription } from "../../subscription/index";
import { NDKUser } from "../../user/index";
import type { NDKPrivateKeySigner } from "../private-key/index";
import { NDKNip46Signer } from "./index";
import type { NDKNostrRpc } from "./rpc";

// Helper to create a mock NDK instance
function createMockNDK() {
    // Create a mock debug function with an extend method that returns itself
    const debugMock: any = Object.assign(() => {}, { extend: () => debugMock });
    return {
        debug: debugMock,
        getUser: vi.fn((opts: { pubkey: string }) => new NDKUser({ pubkey: opts.pubkey })),
        pools: [],
    } as unknown as NDK;
}

// Helper to create a mock NDKNostrRpc
function createMockRpc() {
    return {
        sendRequest: vi.fn(),
        subscribe: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
        debug: { exntend: vi.fn() },
    } as unknown as NDKNostrRpc;
}

// Helper to create a mock NDKSubscription
function createMockSubscription() {
    return {
        stop: vi.fn(),
    } as unknown as NDKSubscription;
}

describe("NDKNip46Signer", () => {
    let ndk: NDK;
    let alice: NDKUser;
    let bob: NDKUser;
    let localSigner: NDKPrivateKeySigner;

    beforeEach(async () => {
        ndk = createMockNDK();
        alice = await UserGenerator.getUser("alice");
        bob = await UserGenerator.getUser("bob");
        localSigner = SignerGenerator.getSigner("alice");
    });

    it("can serialize and deserialize and serialize again without error", async () => {
        // Use bunker:// URL to properly initialize bunkerPubkey and userPubkey
        const bunkerUrl = `bunker://${bob.pubkey}?pubkey=${alice.pubkey}&relay=wss://relay.nsec.app`;
        const signer = new NDKNip46Signer(ndk, bunkerUrl, localSigner);

        // First serialization
        const payload = signer.toPayload();

        // Deserialization
        const deserialized = await NDKNip46Signer.fromPayload(payload, ndk);

        // Second serialization (should not throw)
        expect(() => deserialized.toPayload()).not.toThrow();
    });

    function makeEvent(pubkey: string): NostrEvent {
        return {
            kind: 1,
            pubkey,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: "test",
            id: "eventid",
            sig: "signature",
        };
    }

    describe("bunker flow", () => {
        it("initializes with bunker:// connection token", () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com&secret=shh";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);

            expect(signer.bunkerPubkey).toBe("bunkerpubkey");
            expect(signer.userPubkey).toBe("userpubkey");
            expect(signer.relayUrls).toContain("wss://relay.example.com");
            expect(signer.secret).toBe("shh");
        });

        it("initializes with NIP-05 identifier", () => {
            const signer = NDKNip46Signer.bunker(ndk, "alice@example.com", localSigner);
            expect(signer).toBeInstanceOf(NDKNip46Signer);
        });

        it("blockUntilReady resolves user on ack", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com&secret=shh";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);

            // Mock rpc and subscription
            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).startListening = vi.fn();
            (signer as any).userPubkey = "userpubkey";
            (signer as any).bunkerPubkey = "bunkerpubkey";
            (signer as any).secret = "shh";

            // Simulate getPublicKey
            (signer as any).getPublicKey = vi.fn().mockResolvedValue("userpubkey");

            // Simulate sendRequest callback
            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, _method: string, _params: any[], _kind: number, cb: Function) => {
                    cb({ result: "ack" });
                },
            );

            const user = await signer.blockUntilReady();
            expect(user).toBeInstanceOf(NDKUser);
            expect(user.pubkey).toBe("userpubkey");
        });

        it("signs events via RPC", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            const event: NostrEvent = makeEvent("userpubkey");
            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, _method: string, _params: any[], _kind: number, cb: Function) => {
                    cb({ result: JSON.stringify({ sig: "signature" }) });
                },
            );

            const sig = await signer.sign(event);
            expect(sig).toBe("signature");
        });

        it("encrypts and decrypts via RPC", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, method: string, params: any[], _kind: number, cb: Function) => {
                    if (method.endsWith("encrypt")) cb({ result: "encrypted" });
                    else if (method.endsWith("decrypt")) cb({ result: "decrypted" });
                },
            );

            const encrypted = await signer.encrypt(bob, "hello");
            expect(encrypted).toBe("encrypted");
            const decrypted = await signer.decrypt(bob, "encrypted");
            expect(decrypted).toBe("decrypted");
        });
    });

    describe("nostrconnect flow", () => {
        it("initializes with relay URL", () => {
            const signer = NDKNip46Signer.nostrconnect(ndk, "wss://relay.example.com", localSigner);
            expect(signer.relayUrls).toContain("wss://relay.example.com");
            expect(signer.nostrConnectUri).toBeDefined();
        });

        it("blockUntilReadyNostrConnect resolves user on secret match", async () => {
            const signer = NDKNip46Signer.nostrconnect(ndk, "wss://relay.example.com", localSigner);
            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).nostrConnectSecret = "secret";
            (signer as any)._user = undefined;

            // Simulate startListening
            (signer as any).startListening = vi.fn();

            // Simulate on("response")
            let responseCb: any;
            (mockRpc.on as any).mockImplementation((event: string, cb: Function) => {
                if (event === "response") responseCb = cb;
            });

            // Call blockUntilReadyNostrConnect and trigger callback
            const promise = signer.blockUntilReadyNostrConnect();
            responseCb({
                result: "secret",
                event: { author: alice, pubkey: alice.pubkey },
            });
            const user = await promise;
            expect(user).toBe(alice);
            expect(signer.userPubkey).toBe(alice.pubkey);
            expect(signer.bunkerPubkey).toBe(alice.pubkey);
        });

        it("signs events via RPC in nostrconnect", async () => {
            const signer = NDKNip46Signer.nostrconnect(ndk, "wss://relay.example.com", localSigner);
            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            const event: NostrEvent = makeEvent("userpubkey");
            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, _method: string, _params: any[], _kind: number, cb: Function) => {
                    cb({ result: JSON.stringify({ sig: "signature" }) });
                },
            );

            const sig = await signer.sign(event);
            expect(sig).toBe("signature");
        });

        it("encrypts and decrypts via RPC in nostrconnect", async () => {
            const signer = NDKNip46Signer.nostrconnect(ndk, "wss://relay.example.com", localSigner);
            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, method: string, params: any[], _kind: number, cb: Function) => {
                    if (method.endsWith("encrypt")) cb({ result: "encrypted" });
                    else if (method.endsWith("decrypt")) cb({ result: "decrypted" });
                },
            );

            const encrypted = await signer.encrypt(bob, "hello");
            expect(encrypted).toBe("encrypted");
            const decrypted = await signer.decrypt(bob, "encrypted");
            expect(decrypted).toBe("decrypted");
        });
    });

    describe("serialization/deserialization", () => {
        it("toPayload produces valid payload", () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            (signer as any).userPubkey = "userpubkey";
            (signer as any).bunkerPubkey = "bunkerpubkey";
            const payload = signer.toPayload();
            expect(typeof payload).toBe("string");
            const parsed = JSON.parse(payload);
            expect(parsed.type).toBe("nip46");
            expect(parsed.payload.userPubkey).toBe("userpubkey");
            expect(parsed.payload.bunkerPubkey).toBe("bunkerpubkey");
            expect(parsed.payload.localSignerPayload).toBeDefined();
        });
    });

    describe("error handling", () => {
        it("throws if bunker pubkey is missing for sign", async () => {
            const signer = NDKNip46Signer.bunker(ndk, "alice@example.com", localSigner);
            (signer as any).bunkerPubkey = undefined;
            await expect(signer.sign({} as NostrEvent)).rejects.toThrow("Bunker pubkey not set");
        });

        it("rejects on RPC error in sign", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, _method: string, _params: any[], _kind: number, cb: Function) => {
                    cb({ error: "sign error" });
                },
            );

            await expect(signer.sign({} as NostrEvent)).rejects.toThrow("sign error");
        });

        it("rejects on RPC error in encrypt/decrypt", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, _method: string, _params: any[], _kind: number, cb: Function) => {
                    cb({ error: "encryption error" });
                },
            );

            await expect(signer.encrypt(bob, "hello")).rejects.toThrow("encryption error");
            await expect(signer.decrypt(bob, "encrypted")).rejects.toThrow("encryption error");
        });
    });
});
