import { EventEmitter } from "tseep";

import type { NDKSigner } from "..";
import type { NostrEvent } from "../../events";
import { NDKEvent } from "../../events";
import type { NDK } from "../../ndk";
import type { NDKFilter, NDKSubscription } from "../../subscription";
import { NDKKind } from "../../events/kinds";

export interface NDKRpcRequest {
    id: string;
    pubkey: string;
    method: string;
    params: string[];
    event: NDKEvent;
}

export interface NDKRpcResponse {
    id: string;
    result: string;
    error?: string;
    event: NDKEvent;
}

export class NDKNostrRpc extends EventEmitter {
    private ndk: NDK;
    private signer: NDKSigner;
    private debug: debug.Debugger;

    public constructor(ndk: NDK, signer: NDKSigner, debug: debug.Debugger) {
        super();
        this.ndk = ndk;
        this.signer = signer;
        this.debug = debug.extend("rpc");
    }

    /**
     * Subscribe to a filter. This function will resolve once the subscription is ready.
     */
    public subscribe(filter: NDKFilter): Promise<NDKSubscription> {
        const sub = this.ndk.subscribe(filter, {
            closeOnEose: false,
            groupable: false,
        });

        sub.on("event", async (event: NDKEvent) => {
            try {
                const parsedEvent = await this.parseEvent(event);
                if ((parsedEvent as NDKRpcRequest).method) {
                    this.emit("request", parsedEvent);
                } else {
                    this.emit(`response-${parsedEvent.id}`, parsedEvent);
                }
            } catch (e) {
                this.debug("error parsing event", e, event.rawEvent());
            }
        });

        return new Promise((resolve, reject) => {
            sub.on("eose", () => resolve(sub));
        });
    }

    public async parseEvent(event: NDKEvent): Promise<NDKRpcRequest | NDKRpcResponse> {
        const remoteUser = this.ndk.getUser({ hexpubkey: event.pubkey });
        remoteUser.ndk = this.ndk;
        const decryptedContent = await this.signer.decrypt(remoteUser, event.content);
        const parsedContent = JSON.parse(decryptedContent);
        const { id, method, params, result, error } = parsedContent;

        if (method) {
            return { id, pubkey: event.pubkey, method, params, event };
        } else {
            return { id, result, error, event };
        }
    }

    public async sendResponse(
        id: string,
        remotePubkey: string,
        result: string,
        kind = NDKKind.NostrConnect,
        error?: string
    ) {
        const res = { id, result } as NDKRpcResponse;
        if (error) {
            res.error = error;
        }

        const localUser = await this.signer.user();
        const remoteUser = this.ndk.getUser({ hexpubkey: remotePubkey });
        const event = new NDKEvent(this.ndk, {
            kind,
            content: JSON.stringify(res),
            tags: [["p", remotePubkey]],
            pubkey: localUser.hexpubkey,
        } as NostrEvent);

        event.content = await this.signer.encrypt(remoteUser, event.content);
        await event.sign(this.signer);
        await event.publish();
    }

    /**
     * Sends a request.
     * @param remotePubkey
     * @param method
     * @param params
     * @param kind
     * @param id
     */
    public async sendRequest(
        remotePubkey: string,
        method: string,
        params: string[] = [],
        kind = 24133,
        cb?: (res: NDKRpcResponse) => void
    ) {
        const id = Math.random().toString(36).substring(7);
        const localUser = await this.signer.user();
        const remoteUser = this.ndk.getUser({ hexpubkey: remotePubkey });
        const request = { id, method, params };
        const promise = new Promise<NDKRpcResponse>((resolve) => {
            const responseHandler = (response: NDKRpcResponse) => {
                if (response.result === "auth_url") {
                    this.once(`response-${id}`, responseHandler);
                    this.emit("authUrl", response.error);
                } else if (cb) {
                    cb(response);
                }
            };

            this.once(`response-${id}`, responseHandler);
        });

        const event = new NDKEvent(this.ndk, {
            kind,
            content: JSON.stringify(request),
            tags: [["p", remotePubkey]],
            pubkey: localUser.pubkey,
        } as NostrEvent);

        event.content = await this.signer.encrypt(remoteUser, event.content);
        await event.sign(this.signer);
        this.debug(`sending ${method} request to`, remotePubkey);

        await event.publish();

        return promise;
    }
}
