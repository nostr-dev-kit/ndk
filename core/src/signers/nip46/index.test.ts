import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignerGenerator, UserGenerator } from "../../../test";
import type { NostrEvent } from "../../events/index";
import type { NDK } from "../../ndk/index";
import { NDKUser } from "../../user/index";
import type { NDKPrivateKeySigner } from "../private-key/index";
import { NDKNip46Signer, NDKNip46TimeoutError } from "./index";
import type { NDKNostrRpc } from "./rpc";

// Helper to create a mock NDK instance
function createMockNDK() {
    // Create a mock debug function with an extend method that returns itself
    const debugMock: any = Object.assign(() => {}, { extend: () => debugMock });
    return {
        debug: debugMock,
        getUser: vi.fn((opts: { pubkey: string }) => new NDKUser({ pubkey: opts.pubkey })),
        pools: [],
        // Mock subscribe: returns a subscription-like object and immediately triggers onEose
        subscribe: vi.fn((_filter: any, opts: any) => {
            const sub = { stop: vi.fn(), on: vi.fn(), off: vi.fn() };
            // Trigger onEose asynchronously so the RPC subscribe promise resolves
            if (opts?.onEose) queueMicrotask(() => opts.onEose());
            return sub;
        }),
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
        debug: { extend: vi.fn() },
    } as unknown as NDKNostrRpc;
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

            // Mock sendRequest to handle get_public_key and switch_relays
            (mockRpc.sendRequest as any).mockImplementation(
                (_remotePubkey: string, method: string, _params: any[], _kind: number, cb: Function) => {
                    if (method === "get_public_key") {
                        cb({ result: alice.pubkey });
                    } else if (method === "switch_relays") {
                        cb({ result: "null" });
                    }
                },
            );

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
            expect(user.pubkey).toBe(alice.pubkey);
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

        it("fromPayload initializes the RPC subscription (issue #332)", async () => {
            // Create and serialize a signer
            const token = `bunker://${bob.pubkey}?pubkey=${alice.pubkey}&relay=wss://relay.nsec.app`;
            const signer = new NDKNip46Signer(ndk, token, localSigner);
            const payload = signer.toPayload();

            // Deserialize — fromPayload should call startListening()
            const deserialized = await NDKNip46Signer.fromPayload(payload, ndk);

            // The subscription should have been initialized
            expect((deserialized as any).subscription).toBeDefined();
        });

        it("restored signer can sign events via RPC (issue #332)", async () => {
            // Create and serialize a signer
            const token = `bunker://${bob.pubkey}?pubkey=${alice.pubkey}&relay=wss://relay.nsec.app`;
            const signer = new NDKNip46Signer(ndk, token, localSigner);
            const payload = signer.toPayload();

            // Deserialize
            const deserialized = await NDKNip46Signer.fromPayload(payload, ndk);

            // Replace the RPC with a mock that responds to sign requests
            const mockRpc = createMockRpc();
            (deserialized as any).rpc = mockRpc;

            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, _method: string, _params: any[], _kind: number, cb: Function) => {
                    cb({ result: JSON.stringify({ sig: "restored-sig" }) });
                },
            );

            const event: NostrEvent = {
                kind: 1,
                pubkey: alice.pubkey,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: "test",
                id: "eventid",
                sig: "signature",
            };

            const sig = await deserialized.sign(event);
            expect(sig).toBe("restored-sig");
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

    describe("timeout", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("has no timeout by default", () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            expect(signer.timeout).toBeUndefined();
        });

        it("sign rejects with NDKNip46TimeoutError when timeout expires", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            signer.timeout = 5000;

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            // sendRequest never calls the callback — simulates unresponsive bunker
            (mockRpc.sendRequest as any).mockImplementation(() => {});

            const event: NostrEvent = makeEvent("userpubkey");
            const promise = signer.sign(event);

            // Set up rejection handler before advancing timers
            const rejection = expect(promise).rejects.toThrow(NDKNip46TimeoutError);

            // Advance past the timeout
            await vi.advanceTimersByTimeAsync(5001);

            await rejection;
        });

        it("encrypt rejects with NDKNip46TimeoutError when timeout expires", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            signer.timeout = 3000;

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            (mockRpc.sendRequest as any).mockImplementation(() => {});

            const promise = signer.encrypt(bob, "hello");
            const rejection = expect(promise).rejects.toThrow(NDKNip46TimeoutError);
            await vi.advanceTimersByTimeAsync(3001);

            await rejection;
        });

        it("decrypt rejects with NDKNip46TimeoutError when timeout expires", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            signer.timeout = 3000;

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            (mockRpc.sendRequest as any).mockImplementation(() => {});

            const promise = signer.decrypt(bob, "encrypted");
            const rejection = expect(promise).rejects.toThrow(NDKNip46TimeoutError);
            await vi.advanceTimersByTimeAsync(3001);

            await rejection;
        });

        it("blockUntilReady rejects with NDKNip46TimeoutError when timeout expires", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            signer.timeout = 10000;

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).startListening = vi.fn();
            (signer as any).bunkerPubkey = "bunkerpubkey";

            // sendRequest never calls cb — bunker doesn't respond
            (mockRpc.sendRequest as any).mockImplementation(() => {});

            const promise = signer.blockUntilReady();
            const rejection = expect(promise).rejects.toThrow(NDKNip46TimeoutError);
            await vi.advanceTimersByTimeAsync(10001);

            await rejection;
        });

        it("does not timeout when operation succeeds before deadline", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            signer.timeout = 30000;

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            // sendRequest calls back immediately
            (mockRpc.sendRequest as any).mockImplementation(
                (_bunkerPubkey: string, _method: string, _params: any[], _kind: number, cb: Function) => {
                    cb({ result: JSON.stringify({ sig: "signature" }) });
                },
            );

            const event: NostrEvent = makeEvent("userpubkey");
            const sig = await signer.sign(event);
            expect(sig).toBe("signature");
        });

        it("timeout error contains operation name and duration", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            signer.timeout = 7500;

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            (mockRpc.sendRequest as any).mockImplementation(() => {});

            const event: NostrEvent = makeEvent("userpubkey");
            const promise = signer.sign(event);

            // Attach handler before advancing timers
            const catchPromise = promise.catch((e) => e);
            await vi.advanceTimersByTimeAsync(7501);

            const error = await catchPromise;
            expect(error).toBeInstanceOf(NDKNip46TimeoutError);
            expect(error.operation).toBe("sign");
            expect(error.timeoutMs).toBe(7500);
            expect(error.name).toBe("NDKNip46TimeoutError");
        });

        it("getPublicKey rejects with NDKNip46TimeoutError when timeout expires", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            signer.timeout = 4000;

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";
            // Clear userPubkey so getPublicKey actually sends an RPC request
            (signer as any).userPubkey = undefined;

            (mockRpc.sendRequest as any).mockImplementation(() => {});

            const promise = signer.getPublicKey();
            const rejection = expect(promise).rejects.toThrow(NDKNip46TimeoutError);
            await vi.advanceTimersByTimeAsync(4001);

            await rejection;
        });

        it("createAccount rejects with NDKNip46TimeoutError when timeout expires", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            signer.timeout = 6000;

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";
            (signer as any).startListening = vi.fn();

            (mockRpc.sendRequest as any).mockImplementation(() => {});

            const promise = signer.createAccount("testuser", "example.com");
            const rejection = expect(promise).rejects.toThrow(NDKNip46TimeoutError);
            await vi.advanceTimersByTimeAsync(6001);

            await rejection;
        });

        it("does not apply timeout when timeout is undefined", async () => {
            const token = "bunker://bunkerpubkey?pubkey=userpubkey&relay=wss://relay.example.com";
            const signer = NDKNip46Signer.bunker(ndk, token, localSigner);
            // timeout is undefined by default

            const mockRpc = createMockRpc();
            (signer as any).rpc = mockRpc as NDKNostrRpc;
            (signer as any).bunkerPubkey = "bunkerpubkey";

            // Never calls callback
            (mockRpc.sendRequest as any).mockImplementation(() => {});

            const event: NostrEvent = makeEvent("userpubkey");
            const promise = signer.sign(event);

            // Attach a no-op catch so Node doesn't complain if it ever rejects
            promise.catch(() => {});

            // Advance time significantly — should NOT reject since there's no timeout
            await vi.advanceTimersByTimeAsync(120000);

            // The promise should still be pending (not rejected)
            let resolved = false;
            let rejected = false;
            promise.then(() => { resolved = true; }, () => { rejected = true; });

            // Flush microtasks
            await vi.advanceTimersByTimeAsync(0);
            expect(resolved).toBe(false);
            expect(rejected).toBe(false);
        });
    });
});
