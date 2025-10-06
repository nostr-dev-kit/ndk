import { EventEmitter } from "tseep";
import type { EncryptionMethod } from "../../events/encryption.js";
import type { NostrEvent } from "../../events/index.js";
import { NDKKind } from "../../events/kinds/index.js";
import type { NDK } from "../../ndk/index.js";
import type { NDKSubscription } from "../../subscription/index.js";
import type { NDKEncryptionScheme } from "../../types.js";
import type { Hexpubkey } from "../../user/index.js";
import { NDKUser } from "../../user/index.js";
import { ndkSignerFromPayload } from "../deserialization.js";
import type { NDKSigner } from "../index.js";
import { NDKPrivateKeySigner } from "../private-key/index.js";
import { registerSigner } from "../registry.js";
import { generateNostrConnectUri, type NostrConnectOptions, nostrConnectGenerateSecret } from "./nostrconnect.js";
import type { NDKRpcResponse } from "./rpc.js";
import { NDKNostrRpc } from "./rpc.js";
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
 * const nip05 = await prompt("enter your scheme-05") // Get a NIP-05 the user wants to login with
 * const privateKey = localStorage.getItem("nip46-local-key") // If we have a private key previously saved, use it
 * const signer = NDKNip46Signer.bunker(ndk, nip05, privateKey) // Create a signer with (or without) a private key
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
    private _user?: NDKUser;

    /**
     * The pubkey of the bunker that will be providing signatures
     */
    public bunkerPubkey: string | undefined;

    /**
     * The pubkey of the user that events will be published as
     */
    public userPubkey?: string | null;

    get pubkey(): string {
        if (!this.userPubkey) throw new Error("Not ready");
        return this.userPubkey;
    }

    /**
     * An optional secret value provided to connect to the bunker
     */
    public secret?: string | null;
    public localSigner: NDKPrivateKeySigner;
    private nip05?: string;
    public rpc: NDKNostrRpc;
    private debug: debug.Debugger;
    public relayUrls: string[] | undefined;
    private subscription: NDKSubscription | undefined;

    /**
     * If using nostrconnect://, stores the nostrConnectURI
     */
    public nostrConnectUri?: string;

    /**
     * The random secret used for nostrconnect:// flows.
     */
    private nostrConnectSecret?: string;

    /**
     *
     * Don't instantiate this directly. Use the static methods instead.
     *
     * @example:
     * // for bunker:// flow
     * const signer = NDKNip46Signer.bunker(ndk, "bunker://<connection-token>")
     * const signer = NDKNip46Signer.bunker(ndk, "<your-nip05>"); // with nip05 flow
     * // for nostrconnect:// flow
     * const signer = NDKNip46Signer.nostrconnect(ndk, "wss://relay.example.com")
     *
     * @param ndk - The NDK instance to use
     * @param userOrConnectionToken - The public key, or a connection token, of the npub that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    public constructor(
        ndk: NDK,
        userOrConnectionToken?: string | false,
        localSigner?: NDKPrivateKeySigner | string,
        relayUrls?: string[],
        nostrConnectOptions?: NostrConnectOptions,
    ) {
        super();

        this.ndk = ndk;
        this.debug = ndk.debug.extend("nip46:signer");
        this.relayUrls = relayUrls;

        if (!localSigner) {
            this.localSigner = NDKPrivateKeySigner.generate();
        } else {
            if (typeof localSigner === "string") {
                this.localSigner = new NDKPrivateKeySigner(localSigner);
            } else {
                this.localSigner = localSigner;
            }
        }

        if (userOrConnectionToken === false) {
        } else if (!userOrConnectionToken) {
            this.nostrconnectFlowInit(nostrConnectOptions);
        } else if (userOrConnectionToken.startsWith("bunker://")) {
            this.bunkerFlowInit(userOrConnectionToken);
        } else {
            this.nip05Init(userOrConnectionToken);
        }

        this.rpc = new NDKNostrRpc(this.ndk, this.localSigner, this.debug, this.relayUrls);
    }

    /**
     * Connnect with a bunker:// flow
     * @param ndk
     * @param userOrConnectionToken bunker:// connection string
     * @param localSigner If you have previously authenticated with this signer, you can restore the session by providing the previously authenticated key
     */
    static bunker(
        ndk: NDK,
        userOrConnectionToken?: string,
        localSigner?: NDKPrivateKeySigner | string,
    ): NDKNip46Signer {
        return new NDKNip46Signer(ndk, userOrConnectionToken, localSigner);
    }

    /**
     * Connect with a nostrconnect:// flow
     * @param ndk
     * @param relay - Relay used to connect with the signer
     * @param localSigner If you have previously authenticated with this signer, you can restore the session by providing the previously authenticated key
     */
    static nostrconnect(
        ndk: NDK,
        relay: string,
        localSigner?: NDKPrivateKeySigner | string,
        nostrConnectOptions?: NostrConnectOptions,
    ): NDKNip46Signer {
        return new NDKNip46Signer(ndk, undefined, localSigner, [relay], nostrConnectOptions);
    }

    private nostrconnectFlowInit(nostrConnectOptions?: NostrConnectOptions) {
        // generate secret
        this.nostrConnectSecret = nostrConnectGenerateSecret();

        // build URI
        const pubkey = this.localSigner.pubkey;
        this.nostrConnectUri = generateNostrConnectUri(
            pubkey,
            this.nostrConnectSecret,
            this.relayUrls?.[0],
            nostrConnectOptions,
        );
    }

    private bunkerFlowInit(connectionToken: string) {
        const bunkerUrl = new URL(connectionToken);
        const bunkerPubkey = bunkerUrl.hostname || bunkerUrl.pathname.replace(/^\/\//, "");
        const userPubkey = bunkerUrl.searchParams.get("pubkey");
        const relayUrls = bunkerUrl.searchParams.getAll("relay");
        const secret = bunkerUrl.searchParams.get("secret");

        this.bunkerPubkey = bunkerPubkey;
        this.userPubkey = userPubkey;
        this.relayUrls = relayUrls;
        this.secret = secret;
    }

    private nip05Init(nip05: string) {
        this.nip05 = nip05;
    }

    /**
     * We start listening for events from the bunker
     */
    private async startListening() {
        if (this.subscription) return;

        const localUser = await this.localSigner.user();

        if (!localUser) throw new Error("Local signer not ready");

        this.subscription = await this.rpc.subscribe({
            kinds: [NDKKind.NostrConnect],
            "#p": [localUser.pubkey],
        });
    }

    /**
     * Get the user that is being published as
     */
    public async user(): Promise<NDKUser> {
        // If user is already available, return it
        if (this._user) return this._user;

        // If not, block until ready, which sets _user
        return this.blockUntilReady();
    }

    public get userSync(): NDKUser {
        // userSync should only return if the user is definitively available
        if (!this._user) throw new Error("Remote user not ready synchronously");
        return this._user;
    }

    public async blockUntilReadyNostrConnect(): Promise<NDKUser> {
        return new Promise((resolve, reject) => {
            const connect = (response: NDKRpcResponse) => {
                if (response.result === this.nostrConnectSecret) {
                    this._user = response.event.author;
                    this.userPubkey = response.event.pubkey;
                    this.bunkerPubkey = response.event.pubkey;

                    this.rpc.off("response", connect);
                    resolve(this._user);
                }
            };

            this.startListening();
            this.rpc.on("response", connect);
        });
    }

    public async blockUntilReady(): Promise<NDKUser> {
        // Ensure bunkerPubkey is set before any logic
        if (!this.bunkerPubkey && !this.nostrConnectSecret && !this.nip05) {
            throw new Error("Bunker pubkey not set");
        }

        if (this.nostrConnectSecret) return this.blockUntilReadyNostrConnect();

        if (this.nip05 && !this.userPubkey) {
            const user = await NDKUser.fromNip05(this.nip05, this.ndk);

            if (user) {
                this._user = user;
                this.userPubkey = user.pubkey;
                this.relayUrls = user.nip46Urls;
                this.rpc = new NDKNostrRpc(this.ndk, this.localSigner, this.debug, this.relayUrls);
            }
        }

        if (!this.bunkerPubkey && this.userPubkey) {
            this.bunkerPubkey = this.userPubkey;
        } else if (!this.bunkerPubkey) {
            throw new Error("Bunker pubkey not set");
        }

        await this.startListening();

        this.rpc.on("authUrl", (...props) => {
            this.emit("authUrl", ...props);
        });

        return new Promise((resolve, reject) => {
            const connectParams = [this.userPubkey ?? ""];

            if (this.secret) connectParams.push(this.secret);

            if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");

            this.rpc.sendRequest(this.bunkerPubkey, "connect", connectParams, 24133, (response: NDKRpcResponse) => {
                if (response.result === "ack") {
                    this.getPublicKey().then((pubkey) => {
                        this.userPubkey = pubkey;
                        this._user = this.ndk.getUser({ pubkey });
                        resolve(this._user);
                    });
                } else {
                    reject(response.error);
                }
            });
        });
    }

    public stop() {
        this.subscription?.stop();
        this.subscription = undefined;
    }

    public async getPublicKey(): Promise<Hexpubkey> {
        if (this.userPubkey) return this.userPubkey;

        return new Promise<Hexpubkey>((resolve, _reject) => {
            if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");

            this.rpc.sendRequest(this.bunkerPubkey, "get_public_key", [], 24133, (response: NDKRpcResponse) => {
                resolve(response.result);
            });
        });
    }

    public async encryptionEnabled(scheme?: NDKEncryptionScheme): Promise<NDKEncryptionScheme[]> {
        if (scheme) return [scheme];
        return Promise.resolve(["nip04", "nip44"]);
    }

    public async encrypt(recipient: NDKUser, value: string, scheme: NDKEncryptionScheme = "nip04"): Promise<string> {
        return this.encryption(recipient, value, scheme, "encrypt");
    }

    public async decrypt(sender: NDKUser, value: string, scheme: NDKEncryptionScheme = "nip04"): Promise<string> {
        return this.encryption(sender, value, scheme, "decrypt");
    }

    private async encryption(
        peer: NDKUser,
        value: string,
        scheme: NDKEncryptionScheme,
        method: EncryptionMethod,
    ): Promise<string> {
        const promise = new Promise<string>((resolve, reject) => {
            if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");

            this.rpc.sendRequest(
                this.bunkerPubkey,
                `${scheme}_${method}`,
                [peer.pubkey, value],
                24133,
                (response: NDKRpcResponse) => {
                    if (!response.error) {
                        resolve(response.result);
                    } else {
                        reject(response.error);
                    }
                },
            );
        });

        return promise;
    }

    public async sign(event: NostrEvent): Promise<string> {
        const promise = new Promise<string>((resolve, reject) => {
            if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");

            this.rpc.sendRequest(
                this.bunkerPubkey,
                "sign_event",
                [JSON.stringify(event)],
                24133,
                (response: NDKRpcResponse) => {
                    if (!response.error) {
                        const json = JSON.parse(response.result);
                        resolve(json.sig);
                    } else {
                        reject(response.error);
                    }
                },
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
    public async createAccount(username?: string, domain?: string, email?: string): Promise<Hexpubkey> {
        await this.startListening();
        const req: string[] = [];

        if (username) req.push(username);
        if (domain) req.push(domain);
        if (email) req.push(email);

        return new Promise<Hexpubkey>((resolve, reject) => {
            if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");

            this.rpc.sendRequest(
                this.bunkerPubkey,
                "create_account",
                req,
                NDKKind.NostrConnect,
                (response: NDKRpcResponse) => {
                    if (!response.error) {
                        const pubkey = response.result;
                        resolve(pubkey);
                    } else {
                        reject(response.error);
                    }
                },
            );
        });
    }

    /**
     * Serializes the signer's connection details and local signer state.
     * @returns A JSON string containing the type, connection info, and local signer payload.
     */
    public toPayload(): string {
        if (!this.bunkerPubkey || !this.userPubkey) {
            throw new Error("NIP-46 signer is not fully initialized for serialization");
        }

        const payload = {
            type: "nip46",
            payload: {
                bunkerPubkey: this.bunkerPubkey,
                userPubkey: this.userPubkey,
                relayUrls: this.relayUrls,
                secret: this.secret,
                localSignerPayload: this.localSigner.toPayload(),
                // Store nip05 if it was used for initialization, otherwise null
                nip05: this.nip05 || null,
            },
        };
        return JSON.stringify(payload);
    }

    /**
     * Deserializes the signer from a payload string.
     * @param payloadString The JSON string obtained from toPayload().
     * @param ndk The NDK instance, required for NIP-46.
     * @returns An instance of NDKNip46Signer.
     */
    public static async fromPayload(payloadString: string, ndk: NDK): Promise<NDKNip46Signer> {
        if (!ndk) {
            throw new Error("NDK instance is required to deserialize NIP-46 signer");
        }

        const parsed = JSON.parse(payloadString);

        if (parsed.type !== "nip46") {
            throw new Error(`Invalid payload type: expected 'nip46', got ${parsed.type}`);
        }

        const payload = parsed.payload;

        if (!payload || typeof payload !== "object" || !payload.localSignerPayload) {
            throw new Error("Invalid payload content for nip46 signer");
        }

        // Deserialize the local signer first
        const localSigner = await ndkSignerFromPayload(payload.localSignerPayload, ndk);
        if (!localSigner) {
            throw new Error("Failed to deserialize local signer for NIP-46");
        }

        if (!(localSigner instanceof NDKPrivateKeySigner)) {
            throw new Error("Local signer must be an instance of NDKPrivateKeySigner");
        }

        let signer: NDKNip46Signer;

        // Reconstruct based on whether nip05 was originally used
        signer = new NDKNip46Signer(ndk, false, localSigner, payload.relayUrls);
        signer.userPubkey = payload.userPubkey;
        signer.bunkerPubkey = payload.bunkerPubkey;
        signer.relayUrls = payload.relayUrls;
        signer.secret = payload.secret;

        // Ensure the _user property is set after deserialization
        if (payload.userPubkey) {
            signer._user = new NDKUser({ pubkey: payload.userPubkey });
            if (signer._user) signer._user.ndk = ndk;
        }
        return signer;
    }
}

registerSigner("nip46", NDKNip46Signer);
