import NDK, { NDKEvent, NDKFilter, NDKSigner, NostrEvent } from '../../index.js';
import EventEmitter from 'eventemitter3';

export interface NDKRpcRequest {
    id: string;
    method: string;
    params: string[];
}

export interface NDKRpcResponse {
    id: string;
    result: string;
    error?: string;
}

export class NDKNostrRpc extends EventEmitter {
    private ndk: NDK;
    private signer: NDKSigner;
    private debug: debug.Debugger;

    public constructor(ndk: NDK, signer: NDKSigner, debug: debug.Debugger) {
        super();
        this.ndk = ndk;
        this.signer = signer;
        this.debug = debug.extend('rpc');
    }

    public subscribe(filter: NDKFilter) {
        const sub = this.ndk.subscribe(filter, { closeOnEose: false });

        sub.on('event', async (event: NDKEvent) => {
            this.debug('received event', await event.toNostrEvent());
            const parsedEvent = await this.parseEvent(event);
            this.debug('parsed event', parsedEvent);

            if ((parsedEvent as NDKRpcRequest).method) {
                this.emit('request', parsedEvent);
            } else {
                this.emit(`response-${parsedEvent.id}`, parsedEvent);
            }
        });
    }

    public async parseEvent(event: NDKEvent): Promise<NDKRpcRequest | NDKRpcResponse> {
        const remoteUser = this.ndk.getUser({ hexpubkey: event.pubkey });
        remoteUser.ndk = this.ndk;
        const decryptedContent = await this.signer.decrypt(remoteUser, event.content);
        const parsedContent = JSON.parse(decryptedContent);
        const { id, method, params, result, error } = parsedContent;

        if (method) {
            return { id, method, params };
        } else {
            return { id, result, error };
        }
    };

    public async sendResponse(id: string, remotePubkey: string, result: string, error?: string) {
        const res = { id, result } as NDKRpcResponse;
        if (error) { res.error = error; }

        const localUser = await this.signer.user();
        const remoteUser = this.ndk.getUser({ hexpubkey: remotePubkey });
        const event = new NDKEvent(this.ndk, {
            kind: 24133,
            content: JSON.stringify(res),
            tags: [
                ['p', remotePubkey],
            ],
            pubkey: localUser.hexpubkey(),
        } as NostrEvent);

        event.content = await this.signer.encrypt(remoteUser, event.content);
        await event.sign(this.signer);
        this.debug('sending response', await event.toNostrEvent());

        await this.ndk.publish(event);
    }

    public async sendRequest(remotePubkey: string, method: string, params: string[], id?: string) {
        const localUser = await this.signer.user();
        const remoteUser = this.ndk.getUser({ hexpubkey: remotePubkey });
        const randomId = Math.random().toString(36).substring(7);
        const request = { id: id || randomId, method, params };

        const event = new NDKEvent(this.ndk, {
            kind: 24133,
            content: JSON.stringify(request),
            tags: [
                ['p', remotePubkey],
            ],
            pubkey: localUser.hexpubkey(),
        } as NostrEvent);

        event.content = await this.signer.encrypt(remoteUser, event.content);
        await event.sign(this.signer);
        this.debug('sending request to', remotePubkey);

        await this.ndk.publish(event);
    }
}