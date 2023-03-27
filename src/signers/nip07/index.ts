import {Signer} from '../';
import type {NostrEvent} from '../../events';
import User from '../../user';

export class Nip07Signer implements Signer {
    public user: User | undefined;
    private window: any;

    public constructor() {}

    public async configure(window: any) {
        this.window = window;

        const pubkey = await this.window.nostr?.getPublicKey();
        this.user = new User({hexpubkey: pubkey});

        return this.user;
    }

    public async sign(event: NostrEvent): Promise<string> {
        const signedEvent = await this.window.nostr?.signEvent(event);
        return signedEvent.sig;
    }
}
