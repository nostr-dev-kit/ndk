import {NDKSigner} from '../index';
import type {NostrEvent} from '../../events/index';
import NDKUser from '../../user/index';

export class NDKNip07Signer implements NDKSigner {
    public user: NDKUser | undefined;
    private window: any;

    public constructor() {}

    public async configure(window: any) {
        this.window = window;

        const pubkey = await this.window.nostr?.getPublicKey();
        this.user = new NDKUser({hexpubkey: pubkey});

        return this.user;
    }

    public async sign(event: NostrEvent): Promise<string> {
        const signedEvent = await this.window.nostr?.signEvent(event);
        return signedEvent.sig;
    }
}
