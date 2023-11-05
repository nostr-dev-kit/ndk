import type { Event } from "nostr-tools";
import { verifySignature } from "nostr-tools";

import { NDKEvent } from "../../../events/index.js";
import type { NDK } from "../../../ndk/index.js";
import type { NDKUser } from "../../../user/index.js";
import { NDKPrivateKeySigner } from "../../private-key/index.js";
import { NDKNostrRpc } from "../rpc.js";
import ConnectEventHandlingStrategy from "./connect.js";
import GetPublicKeyHandlingStrategy from "./get-public-key.js";
import Nip04DecryptHandlingStrategy from "./nip04-decrypt.js";
import Nip04EncryptHandlingStrategy from "./nip04-encrypt.js";
import SignEventHandlingStrategy from "./sign-event.js";

export type Nip46PermitCallback = (
    /**
     * The backend
     */
    backend: NDKNip46Backend,

    /**
     * ID of the request
     */
    id: string,

    pubkey: string,
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any
) => Promise<boolean>;

export type Nip46ApplyTokenCallback = (pubkey: string, token: string) => Promise<void>;

export interface IEventHandlingStrategy {
    handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined>;
}

/**
 * This class implements a NIP-46 backend, meaning that it will hold a private key
 * of the npub that wants to be published as.
 *
 * This backend is meant to be used by an NDKNip46Signer, which is the class that
 * should run client-side, where the user wants to sign events from.
 */
export class NDKNip46Backend {
    readonly ndk: NDK;
    readonly signer: NDKPrivateKeySigner;
    public localUser?: NDKUser;
    readonly debug: debug.Debugger;
    public rpc: NDKNostrRpc;
    private permitCallback: Nip46PermitCallback;

    /**
     * @param ndk The NDK instance to use
     * @param privateKey The private key of the npub that wants to be published as
     */
    public constructor(ndk: NDK, privateKey: string, permitCallback: Nip46PermitCallback) {
        this.ndk = ndk;
        this.signer = new NDKPrivateKeySigner(privateKey);
        this.debug = ndk.debug.extend("nip46:backend");
        this.rpc = new NDKNostrRpc(ndk, this.signer, this.debug);
        this.permitCallback = permitCallback;
    }

    /**
     * This method starts the backend, which will start listening for incoming
     * requests.
     */
    public async start() {
        this.localUser = await this.signer.user();

        const sub = this.ndk.subscribe(
            {
                kinds: [24133 as number],
                "#p": [this.localUser.hexpubkey],
            },
            { closeOnEose: false }
        );

        sub.on("event", (e) => this.handleIncomingEvent(e));
    }

    public handlers: { [method: string]: IEventHandlingStrategy } = {
        connect: new ConnectEventHandlingStrategy(),
        sign_event: new SignEventHandlingStrategy(),
        nip04_encrypt: new Nip04EncryptHandlingStrategy(),
        nip04_decrypt: new Nip04DecryptHandlingStrategy(),
        get_public_key: new GetPublicKeyHandlingStrategy(),
    };

    /**
     * Enables the user to set a custom strategy for handling incoming events.
     * @param method - The method to set the strategy for
     * @param strategy - The strategy to set
     */
    public setStrategy(method: string, strategy: IEventHandlingStrategy) {
        this.handlers[method] = strategy;
    }

    /**
     * Overload this method to apply tokens, which can
     * wrap permission sets to be applied to a pubkey.
     * @param pubkey public key to apply token to
     * @param token token to apply
     */
    async applyToken(pubkey: string, token: string): Promise<void> {
        throw new Error("connection token not supported");
    }

    protected async handleIncomingEvent(event: NDKEvent) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { id, method, params } = (await this.rpc.parseEvent(event)) as any;
        const remotePubkey = event.pubkey;
        let response: string | undefined;

        this.debug("incoming event", { id, method, params });

        // validate signature explicitly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!verifySignature(event.rawEvent() as Event<any>)) {
            this.debug("invalid signature", event.rawEvent());
            return;
        }

        const strategy = this.handlers[method];
        if (strategy) {
            try {
                response = await strategy.handle(this, id, remotePubkey, params);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                this.debug("error handling event", e, { id, method, params });
                this.rpc.sendResponse(id, remotePubkey, "error", undefined, e.message);
            }
        } else {
            this.debug("unsupported method", { method, params });
        }

        if (response) {
            this.debug(`sending response to ${remotePubkey}`, response);
            this.rpc.sendResponse(id, remotePubkey, response);
        } else {
            this.rpc.sendResponse(id, remotePubkey, "error", undefined, "Not authorized");
        }
    }

    /**
     * This method should be overriden by the user to allow or reject incoming
     * connections.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async pubkeyAllowed(
        backend: NDKNip46Backend,
        id: string,
        pubkey: string,
        method: string,
        params?: any
    ): Promise<boolean> {
        return this.permitCallback(backend, id, pubkey, method, params);
    }
}
