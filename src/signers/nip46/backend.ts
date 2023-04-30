import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from "../../index.js";
import { NDKNostrRpc } from "./rpc.js";

export type Nip46PermitCallback = (pubkey: string, method: string, param?: any) => boolean;

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

        this.debug('incoming event', {id, method, params});

        switch (method) {
            case 'connect':
                this.handleConnect(id, params);
                break;
            case 'sign_event':
                this.handleSignEvent(id, remotePubkey, params);
                break;
            default:
                this.debug('unsupported method', {method, params});
                break;
        }
    };

    private handleConnect(id: string, params: string[]) {
        const [ pubkey ] = params;

        this.debug(`connection request from ${pubkey}`);

        if (this.pubkeyAllowed(pubkey, 'connect')) {
            this.debug(`connection request from ${pubkey} allowed`);
            this.rpc.sendResponse(id, pubkey, 'ack');
        }
    }

    private async handleSignEvent(id: string, remotePubkey: string, params: string[]) {
        const [ eventString ] = params;

        this.debug(`sign event request from ${remotePubkey}`);

        const event = new NDKEvent(this.ndk, JSON.parse(eventString));

        this.debug('event to sign', event.rawEvent());

        if (!this.pubkeyAllowed(remotePubkey, 'sign_event', event)) {
            this.debug(`sign event request from ${remotePubkey} rejected`);
        }

        await event.sign(this.signer);
        this.rpc.sendResponse(id, remotePubkey, JSON.stringify(await event.toNostrEvent()));
    }

    /**
     * This method should be overriden by the user to allow or reject incoming
     * connections.
     */
    private pubkeyAllowed(pubkey: string, method: string, params?: any): boolean {
        return this.permitCallback(pubkey, method, params);
    }
}