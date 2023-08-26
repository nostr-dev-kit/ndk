import NDK, {
    NDKPrivateKeySigner,
    NDKSigner,
    NDKUser,
    NostrEvent,
} from "../../index.js";
import { NDKNostrRpc, NDKRpcResponse } from "./rpc.js";

/**
 * This NDKSigner implements NIP-46, which allows remote signing of events.
 * This class is meant to be used client-side, paired with the NDKNip46Backend or a NIP-46 backend (like Nostr-Connect)
 */
export class NDKNip46Signer implements NDKSigner {
    private ndk: NDK;
    public remoteUser: NDKUser;
    public remotePubkey: string;
    public token: string | undefined;
    public localSigner: NDKSigner;
    private rpc: NDKNostrRpc;
    private debug: debug.Debugger;

    /**
     * @param ndk - The NDK instance to use
     * @param token - connection token, in the form "npub#otp"
     * @param localSigner - The signer that will be used to request events to be signed
     */
    public constructor(ndk: NDK, token: string, localSigner?: NDKSigner);

    /**
     * @param ndk - The NDK instance to use
     * @param remoteNpub - The npub that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    public constructor(ndk: NDK, remoteNpub: string, localSigner?: NDKSigner);

    /**
     * @param ndk - The NDK instance to use
     * @param remotePubkey - The public key of the npub that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    public constructor(ndk: NDK, remotePubkey: string, localSigner?: NDKSigner);

    /**
     * @param ndk - The NDK instance to use
     * @param tokenOrRemotePubkey - The public key, or a connection token, of the npub that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    public constructor(
        ndk: NDK,
        tokenOrRemotePubkey: string,
        localSigner?: NDKSigner
    ) {
        let remotePubkey: string;
        let token: string | undefined;

        if (tokenOrRemotePubkey.includes("#")) {
            const parts = tokenOrRemotePubkey.split("#");
            remotePubkey = new NDKUser({ npub: parts[0] }).hexpubkey();
            token = parts[1];
        } else if (tokenOrRemotePubkey.startsWith("npub")) {
            remotePubkey = new NDKUser({
                npub: tokenOrRemotePubkey,
            }).hexpubkey();
        } else {
            remotePubkey = tokenOrRemotePubkey;
        }

        this.ndk = ndk;
        this.remotePubkey = remotePubkey;
        this.token = token;
        this.debug = ndk.debug.extend("nip46:signer");

        this.remoteUser = new NDKUser({ hexpubkey: remotePubkey });

        if (!localSigner) {
            this.localSigner = NDKPrivateKeySigner.generate();
        } else {
            this.localSigner = localSigner;
        }

        this.rpc = new NDKNostrRpc(ndk, this.localSigner, this.debug);
    }

    /**
     * Get the user that is being published as
     */
    public async user(): Promise<NDKUser> {
        return this.remoteUser;
    }

    public async blockUntilReady(): Promise<NDKUser> {
        const localUser = await this.localSigner.user();
        const user = this.ndk.getUser({ npub: localUser.npub });

        // Generates subscription, single subscription for the lifetime of our connection
        await this.rpc.subscribe({
            kinds: [24133 as number],
            "#p": [localUser.hexpubkey()],
        });

        return new Promise((resolve, reject) => {
            // There is a race condition between the subscription and sending the request;
            // introducing a small delay here to give a clear priority to the subscription
            // to happen first
            setTimeout(() => {
                const connectParams = [localUser.hexpubkey()];

                if (this.token) {
                    connectParams.push(this.token);
                }

                this.rpc.sendRequest(
                    this.remotePubkey,
                    "connect",
                    connectParams,
                    24133,
                    (response: NDKRpcResponse) => {
                        if (response.result === "ack") {
                            resolve(user);
                        } else {
                            reject(response.error);
                        }
                    }
                );
            }, 100);
        });
    }

    public async encrypt(recipient: NDKUser, value: string): Promise<string> {
        this.debug("asking for encryption");

        const promise = new Promise<string>((resolve, reject) => {
            this.rpc.sendRequest(
                this.remotePubkey,
                "nip04_encrypt",
                [recipient.hexpubkey(), value],
                24133,
                (response: NDKRpcResponse) => {
                    if (!response.error) {
                        resolve(response.result);
                    } else {
                        reject(response.error);
                    }
                }
            );
        });

        return promise;
    }

    public async decrypt(sender: NDKUser, value: string): Promise<string> {
        this.debug("asking for decryption");

        const promise = new Promise<string>((resolve, reject) => {
            this.rpc.sendRequest(
                this.remotePubkey,
                "nip04_decrypt",
                [sender.hexpubkey(), value],
                24133,
                (response: NDKRpcResponse) => {
                    if (!response.error) {
                        const value = JSON.parse(response.result);
                        resolve(value[0]);
                    } else {
                        reject(response.error);
                    }
                }
            );
        });

        return promise;
    }

    public async sign(event: NostrEvent): Promise<string> {
        this.debug("asking for a signature");

        const promise = new Promise<string>((resolve, reject) => {
            this.rpc.sendRequest(
                this.remotePubkey,
                "sign_event",
                [JSON.stringify(event)],
                24133,
                (response: NDKRpcResponse) => {
                    this.debug("got a response", response);
                    if (!response.error) {
                        const json = JSON.parse(response.result);
                        resolve(json.sig);
                    } else {
                        reject(response.error);
                    }
                }
            );
        });

        return promise;
    }
}
