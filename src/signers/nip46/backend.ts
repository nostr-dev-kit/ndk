import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from "../../index.js";
import { NDKNostrRpc } from "./rpc.js";

export type Nip46PermitCallback = (pubkey: string, method: string, param?: any) => Promise<boolean>;

/**
 * This class implements a NIP-46 backend, meaning that it will hold a private key
 * of the npub that wants to be published as.
 *
 * This backend is meant to be used by an NDKNip46Signer, which is the class that
 * should run client-side, where the user wants to sign events from.
 */
export class NDKNip46Backend {
    private ndk: NDK;
    private signer: NDKPrivateKeySigner;
    private localUser?: NDKUser;
    private debug: debug.Debugger;
    private rpc: NDKNostrRpc;
    private permitCallback: Nip46PermitCallback;

    /**
     * @param ndk The NDK instance to use
     * @param privateKey The private key of the npub that wants to be published as
     */
    public constructor(ndk: NDK, privateKey: string, permitCallback: Nip46PermitCallback) {
        this.ndk = ndk;
        this.signer = new NDKPrivateKeySigner(privateKey);
        this.debug = ndk.debug.extend('nip46:backend');
        this.rpc = new NDKNostrRpc(ndk, this.signer, this.debug);
        this.permitCallback = permitCallback;
    }

    /**
     * This method starts the backend, which will start listening for incoming
     * requests.
     */
    public async start() {
        this.localUser = await this.signer.user();

        const sub = this.ndk.subscribe({
            kinds: [24133],
            '#p': [ this.localUser.hexpubkey() ]
        }, { closeOnEose: false });

        sub.on('event', (e) => this.handleIncomingEvent(e));
    }

    private async handleIncomingEvent(event: NDKEvent) {
        const { id, method, params } = await this.rpc.parseEvent(event) as any;
        const remotePubkey = event.pubkey;
        let response: string | undefined;

        this.debug('incoming event', {id, method, params});

        switch (method) {
            case 'connect':
                response = await this.handleConnect(id, params);
                break;
            case 'sign_event':
                response = await this.handleSignEvent(id, remotePubkey, params);
                break;
            case 'publish_event':
                response = await this.handlePublishEvent(id, remotePubkey, params);
                break;
            case 'get_public_key':
                response = await this.handleGetPublicKey();
                break;
            case 'describe':
                response = await this.handleDescribe();
                break;
            default:
                this.debug('unsupported method', {method, params});
                break;
        }

        if (response) {
            this.rpc.sendResponse(id, remotePubkey, response);
        }
    };

    private async handleDescribe() {
        return JSON.stringify([
            'describe',
            'get_public_key',
            'sign_event',
            'publish_event',
            'connect',
            // 'nip04_encrypt',
            // 'nip04_decrypt'
        ]);
    }

    private async handleGetPublicKey() {
        return this.localUser?.hexpubkey();
    }

    private async handleConnect(id: string, params: string[]) {
        const [ pubkey ] = params;

        this.debug(`connection request from ${pubkey}`);

        if (await this.pubkeyAllowed(pubkey, 'connect')) {
            this.debug(`connection request from ${pubkey} allowed`);
            return 'ack';
        }
    }

    private async signEvent(remotePubkey: string, params: string[]): Promise<NDKEvent|undefined> {
        const [ eventString ] = params;

        this.debug(`sign event request from ${remotePubkey}`);

        const event = new NDKEvent(this.ndk, JSON.parse(eventString));

        this.debug('event to sign', event.rawEvent());

        if (!await this.pubkeyAllowed(remotePubkey, 'sign_event', event)) {
            this.debug(`sign event request from ${remotePubkey} rejected`);
            return undefined;
        }

        await event.sign(this.signer);
    }

    private async handleSignEvent(id: string, remotePubkey: string, params: string[]) {
        const event = await this.signEvent(remotePubkey, params);
        if (!event) return undefined;

        return JSON.stringify(await event.toNostrEvent());
    }

    private async handlePublishEvent(id: string, remotePubkey: string, params: string[]) {
        const event = await this.signEvent(remotePubkey, params);
        if (!event) return undefined;

        this.ndk.publish(event);

        return JSON.stringify(await event.toNostrEvent());
    }

    /**
     * This method should be overriden by the user to allow or reject incoming
     * connections.
     */
    private async pubkeyAllowed(pubkey: string, method: string, params?: any): Promise<boolean> {
        return this.permitCallback(pubkey, method, params);
    }
}