import { EventEmitter } from "tseep";
import type { NostrEvent } from "../../events/index.js";
import type { NDK } from "../../ndk/index.js";
import type { Hexpubkey } from "../../user/index.js";
import { NDKUser } from "../../user/index.js";
import type { NDKSigner } from "../index.js";
import { NDKPrivateKeySigner } from "../private-key/index.js";
import type { NDKRpcResponse } from "./rpc.js";
import { NDKNostrRpc } from "./rpc.js";
import { NDKKind } from "../../events/kinds/index.js";
import type { NDKSubscription } from "../../subscription/index.js";

/**
 * This NDKSigner implements NIP-46, which allows remote signing of events.
 * This class is meant to be used client-side, paired with the NDKNip46Backend or a NIP-46 backend (like Nostr-Connect)
 *
 * @emits authUrl -- Emitted when the user should take an action in certain URL.
 *                   When a client receives this event, it should direct the user
 *                   to go to that URL to authorize the application.
 *
 * @example
 * const ndk = new NDK()
 * const nip05 = await prompt("enter your nip-05") // Get a NIP-05 the user wants to login with
 * const privateKey = localStorage.getItem("nip46-local-key") // If we have a private key previously saved, use it
 * const signer = new NDKNip46Signer(ndk, nip05, privateKey) // Create a signer with (or without) a private key
 *
 * // Save generated private key for future use
 * localStorage.setItem("nip46-local-key", signer.localSigner.privateKey)
 *
 * // If the backend sends an auth_url event, open that URL as a popup so the user can authorize the app
 * signer.on("authUrl", (url) => { window.open(url, "auth", "width=600,height=600") })
 *
 * // wait until the signer is ready
 * const loggedinUser = await signer.blockUntilReady()
 *
 * alert("You are now logged in as " + loggedinUser.npub)
 */
export class NDKNip46Signer extends EventEmitter implements NDKSigner {
    private ndk: NDK;
    public remoteUser: NDKUser;
    public remotePubkey: string | undefined;
    public token: string | undefined;
    public localSigner: NDKSigner;
    private nip05?: string;
    public rpc: NDKNostrRpc;
    private debug: debug.Debugger;
    public relayUrls: string[] | undefined;
    private subscription: NDKSubscription | undefined;

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
     * @param remoteNip05 - The nip05 that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    public constructor(ndk: NDK, remoteNip05: string, localSigner?: NDKSigner);

    /**
     * @param ndk - The NDK instance to use
     * @param remotePubkey - The public key of the npub that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    public constructor(ndk: NDK, remotePubkey: string, localSigner?: NDKSigner);

    /**
     * @param ndk - The NDK instance to use
     * @param tokenOrRemoteUser - The public key, or a connection token, of the npub that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    public constructor(ndk: NDK, tokenOrRemoteUser: string, localSigner?: NDKSigner) {
        super();

        let remotePubkey: string | undefined;
        let token: string | undefined;

        if (tokenOrRemoteUser.includes("#")) {
            const parts = tokenOrRemoteUser.split("#");
            if (parts[0].startsWith("npub")) {
                remotePubkey = new NDKUser({ npub: parts[0] }).pubkey;
            } else {
                remotePubkey = parts[0];
            }
            token = parts[1];
        } else if (tokenOrRemoteUser.startsWith("npub")) {
            remotePubkey = new NDKUser({
                npub: tokenOrRemoteUser,
            }).pubkey;
        } else if (tokenOrRemoteUser.match(/\./)) {
            this.nip05 = tokenOrRemoteUser;
        } else {
            remotePubkey = tokenOrRemoteUser;
        }

        this.ndk = ndk;
        if (remotePubkey) this.remotePubkey = remotePubkey;
        this.token = token;
        this.debug = ndk.debug.extend("nip46:signer");

        this.remoteUser = new NDKUser({ pubkey: remotePubkey });

        if (!localSigner) {
            this.localSigner = NDKPrivateKeySigner.generate();
        } else {
            this.localSigner = localSigner;
        }

        this.rpc = new NDKNostrRpc(this.ndk, this.localSigner, this.debug, this.relayUrls);
    }

    private async startListening() {
        if (this.subscription) return;

        const localUser = await this.localSigner.user();

        this.subscription = await this.rpc.subscribe({
            kinds: [NDKKind.NostrConnect, NDKKind.NostrConnect + 1],
            "#p": [localUser.pubkey],
        });
    }

    /**
     * Get the user that is being published as
     */
    public async user(): Promise<NDKUser> {
        return this.remoteUser;
    }

    public async blockUntilReady(): Promise<NDKUser> {
        if (this.nip05 && !this.remotePubkey) {
            const user = await NDKUser.fromNip05(this.nip05, this.ndk);

            if (user) {
                this.remoteUser = user;
                this.remotePubkey = user.pubkey;
                this.relayUrls = user.nip46Urls;
                this.rpc = new NDKNostrRpc(this.ndk, this.localSigner, this.debug, this.relayUrls);
            }
        }

        if (!this.remotePubkey) {
            throw new Error("Remote pubkey not set");
        }

        await this.startListening();

        this.rpc.on("authUrl", (...props) => {
            this.emit("authUrl", ...props);
        });

        return new Promise((resolve, reject) => {
            const connectParams = [this.remotePubkey!];

            if (this.token) {
                connectParams.push(this.token);
            }

            this.rpc.sendRequest(
                this.remotePubkey!,
                "connect",
                connectParams,
                24133,
                (response: NDKRpcResponse) => {
                    if (response.result === "ack") {
                        resolve(this.remoteUser);
                    } else {
                        reject(response.error);
                    }
                }
            );
        });
    }

    public async encrypt(recipient: NDKUser, value: string): Promise<string> {
        this.debug("asking for encryption");

        const promise = new Promise<string>((resolve, reject) => {
            this.rpc.sendRequest(
                this.remotePubkey!,
                "nip04_encrypt",
                [recipient.pubkey, value],
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
                this.remotePubkey!,
                "nip04_decrypt",
                [sender.pubkey, value],
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

    public async sign(event: NostrEvent): Promise<string> {
        this.debug("asking for a signature");

        const promise = new Promise<string>((resolve, reject) => {
            this.rpc.sendRequest(
                this.remotePubkey!,
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

    /**
     * Allows creating a new account on the remote server.
     * @param username Desired username for the NIP-05
     * @param domain Desired domain for the NIP-05
     * @param email Email address to associate with this account -- Remote servers may use this for recovery
     * @returns The public key of the newly created account
     */
    public async createAccount(
        username?: string,
        domain?: string,
        email?: string
    ): Promise<Hexpubkey> {
        await this.startListening();
        this.debug("asking to create an account");
        const req: string[] = [];

        if (username) req.push(username);
        if (domain) req.push(domain);
        if (email) req.push(email);

        return new Promise<Hexpubkey>((resolve, reject) => {
            this.rpc.sendRequest(
                this.remotePubkey!,
                "create_account",
                req,
                NDKKind.NostrConnect,
                (response: NDKRpcResponse) => {
                    this.debug("got a response", response);
                    if (!response.error) {
                        const pubkey = response.result;
                        resolve(pubkey);
                    } else {
                        reject(response.error);
                    }
                }
            );
        });
    }
}
