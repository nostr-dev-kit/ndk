import { Debugger } from "debug";
import createDebug from "debug";
import { EventEmitter } from "tseep";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDK } from "../../ndk/index.js";
import type { NDKPool } from "../../relay/pool";
import type { NDKRelaySet } from "../../relay/sets";
import { NDKUser } from "../../user/index.js";
import type { NDKSigner } from "../index.js";
import { NDKPrivateKeySigner } from "../private-key/index.js";
import { NDKNip46Signer } from "./index";
import { NDKNostrRpc } from "./rpc.js";
import type { NDKRpcResponse } from "./rpc.js";

const _debug = createDebug("test");

vi.mock("./rpc.js", () => {
    return {
        NDKNostrRpc: vi.fn().mockImplementation(() => ({
            on: vi.fn(),
            sendRequest: vi.fn((_, __, ___, ____, callback) => {
                callback({ result: "test-pubkey" });
            }),
            subscribe: vi.fn().mockResolvedValue({}),
        })),
    };
});

const bunkerPubkey = "0a7c23a70a83bf413ed2b12d583418671eb75bbd0e21db2647c1c83dbdb917ff";
const userPubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";

const _connectionToken = `bunker://${bunkerPubkey}?pubkey=${userPubkey}`;

describe("NDKNip46Signer", () => {
    let ndk: NDK;
    let localSigner: NDKSigner;
    let mockLocalUser: NDKUser;

    beforeEach(() => {
        ndk = new NDK({});
        mockLocalUser = new NDKUser({ pubkey: "local-pubkey" });

        // Create a mock local signer
        localSigner = {
            pubkey: "local-pubkey",
            user: vi.fn().mockResolvedValue(mockLocalUser),
            blockUntilReady: vi.fn().mockResolvedValue(mockLocalUser),
            sign: vi.fn(),
            encrypt: vi.fn(),
            decrypt: vi.fn(),
        };

        // Mock NDKNostrRpc
        vi.mock("./rpc.js", () => ({
            NDKNostrRpc: vi.fn().mockImplementation(() => ({
                on: vi.fn(),
                sendRequest: vi.fn((_, __, ___, ____, callback) => {
                    callback({ result: "test-pubkey" });
                }),
                subscribe: vi.fn().mockResolvedValue({}),
            })),
        }));
    });

    it("throws 'Not ready' when accessing pubkey before initialization", () => {
        const signer = new NDKNip46Signer(ndk, "test@domain.com", localSigner);
        expect(() => signer.pubkey).toThrow("Not ready");
    });

    it("provides synchronous access to pubkey after initialization with connection token", () => {
        const mockPubkey = "mock-pubkey";
        const connectionToken = `bunker://bunker-pubkey?pubkey=${mockPubkey}`;
        const signer = new NDKNip46Signer(ndk, connectionToken, localSigner);

        expect(signer.pubkey).toBe(mockPubkey);
    });

    describe("nip-05 login", () => {
        it("supports using a NIP-05 login", async () => {
            const signer = new NDKNip46Signer(ndk, "test@domain.com", localSigner);
            expect(signer).toBeInstanceOf(NDKNip46Signer);
        });

        it("fetches the remote pubkey using NIP-05", async () => {
            const mockUser = new NDKUser({
                pubkey: "test-pubkey",
                nip46Urls: ["wss://relay.example.com"],
            });

            // Mock NDKUser.fromNip05
            const fromNip05Spy = vi.spyOn(NDKUser, "fromNip05").mockResolvedValue(mockUser);

            // Mock NDKNostrRpc
            vi.mock("./rpc.js", () => {
                return {
                    NDKNostrRpc: vi.fn().mockImplementation(() => ({
                        on: vi.fn(),
                        sendRequest: vi.fn(
                            (
                                _remotePubkey: string,
                                _method: string,
                                _params?: string[],
                                _kind?: number,
                                cb?: (res: NDKRpcResponse) => void,
                            ) => {
                                const response: NDKRpcResponse = {
                                    id: "test-id",
                                    result: "ack",
                                    event: {} as any,
                                };
                                if (cb) cb(response);
                                return Promise.resolve(response);
                            },
                        ),
                        subscribe: vi.fn().mockResolvedValue({}),
                        parseEvent: vi.fn().mockResolvedValue({}),
                        sendResponse: vi.fn().mockResolvedValue(undefined),
                        encryptionType: "nip04",
                    })),
                };
            });

            const signer = new NDKNip46Signer(ndk, "test@domain.com", localSigner);

            // Wait for the signer to be ready
            await signer.blockUntilReady();

            // Verify that fromNip05 was called with the correct parameters
            expect(fromNip05Spy).toHaveBeenCalledWith("test@domain.com", ndk);
            expect(signer.pubkey).toBe("test-pubkey");
        });
    });
});
