import EventEmitter from "eventemitter3";
import NDK, {
    NDKEvent,
    NDKFilter,
    NDKSigner,
    NDKSubscription,
    NostrEvent,
} from "../../index.js";

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
    public async subscribe(filter: NDKFilter): Promise<NDKSubscription> {
        const sub = this.ndk.subscribe(filter, { closeOnEose: false });

        sub.on("event", async (event: NDKEvent) => {
            try {
                const parsedEvent = await this.parseEvent(event);
                if ((parsedEvent as NDKRpcRequest).method) {
                    this.emit("request", parsedEvent);
                } else {
                    this.emit(`response-${parsedEvent.id}`, parsedEvent);
                }
            } catch (e) {
                this.debug("error parsing event", e, event);
            }
        });

        return new Promise((resolve, reject) => {
            sub.on("eose", () => resolve(sub));
        });
    }

    public async parseEvent(
        event: NDKEvent
    ): Promise<NDKRpcRequest | NDKRpcResponse> {
        const remoteUser = this.ndk.getUser({ hexpubkey: event.pubkey });
        remoteUser.ndk = this.ndk;
        const decryptedContent = await this.signer.decrypt(
            remoteUser,
            event.content
        );
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
        kind = 24133,
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
            pubkey: localUser.hexpubkey(),
        } as NostrEvent);

        event.content = await this.signer.encrypt(remoteUser, event.content);
        await event.sign(this.signer);
        await this.ndk.publish(event);
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
            if (cb) this.once(`response-${id}`, cb);
        });

        const event = new NDKEvent(this.ndk, {
            kind,
            content: JSON.stringify(request),
            tags: [["p", remotePubkey]],
            pubkey: localUser.hexpubkey(),
        } as NostrEvent);

        event.content = await this.signer.encrypt(remoteUser, event.content);
        await event.sign(this.signer);
        this.debug("sending request to", remotePubkey);

        await this.ndk.publish(event);

        return promise;
    }
}
