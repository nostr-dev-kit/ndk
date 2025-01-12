import { Debugger } from "debug";
import { NDKNip46Signer } from ".";
import { NDK } from "../../ndk/index";
import { NDKUser } from "../../user/index";
import { NDKPrivateKeySigner } from "../private-key/index";
import { NDKNostrRpc } from "./rpc";
import createDebug from "debug";
import fetchMock from "jest-fetch-mock";

const debug = createDebug("test");

jest.mock("../private-key/index");
jest.mock("./rpc");

fetchMock.enableMocks();

const bunkerPubkey = "0a7c23a70a83bf413ed2b12d583418671eb75bbd0e21db2647c1c83dbdb917ff";
const userPubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";

const connectionToken = `bunker://${bunkerPubkey}?pubkey=${userPubkey}`;

describe("NDKNip46Signer", () => {
    let ndk: NDK;
    let localSigner: NDKPrivateKeySigner;
    let remoteUser: NDKUser;
    let rpc: NDKNostrRpc;

    beforeEach(() => {
        ndk = new NDK();
        ndk.debug = debug;
        localSigner = new NDKPrivateKeySigner();
        remoteUser = new NDKUser({
            pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
        });
        rpc = new NDKNostrRpc(ndk, localSigner, debug, undefined);

        (NDKPrivateKeySigner as unknown as jest.Mock).mockImplementation(() => localSigner);
        (NDKNostrRpc as unknown as jest.Mock).mockImplementation(() => rpc);

        fetchMock.resetMocks();
    });

    it("should initialize with a connection token", () => {
        const signer = new NDKNip46Signer(ndk, connectionToken, localSigner);
        expect(signer.bunkerPubkey).toBe(bunkerPubkey);
        expect(signer.userPubkey).toBe(userPubkey);
    });

    describe("nip-05 login", () => {
        it("supports using a NIP-05 login", () => {
            const signer = new NDKNip46Signer(ndk, "test@example.com", localSigner);
            expect(signer.bunkerPubkey).toBe(undefined);
            expect(signer.userPubkey).toBe(undefined);
        });

        it("fetches the remote pubkey using NIP-05", async () => {
            fetchMock.mockResponseOnce(
                JSON.stringify({
                    names: { test: userPubkey },
                    nip46: { [`${userPubkey}`]: ["wss://relay.example.com"] },
                })
            );
            ndk.httpFetch = fetch;

            const signer = new NDKNip46Signer(ndk, "test@example.com", localSigner);
            await signer.blockUntilReady();
            expect(signer.userPubkey).toBe(userPubkey);
            expect(signer.relayUrls).toEqual(["wss://relay.example.com"]);
        });
    });
});
