import {signEvent, generatePrivateKey, getPublicKey} from 'nostr-tools';
import type {UnsignedEvent} from 'nostr-tools';
import type {NostrEvent} from '../../events/';
import {NDKSigner} from '../';
import User from '../../user';

export default class PrivateKeySigner implements NDKSigner {
    public user: User | undefined;
    privateKey?: string;

    public constructor(privateKey?: string) {
        if (privateKey) {
            this.privateKey = privateKey;
            this.user = new User({hexpubkey: getPublicKey(this.privateKey)});
        }
    }

    static generate() {
        const privateKey = generatePrivateKey();
        return new PrivateKeySigner(privateKey);
    }

    public async sign(event: NostrEvent): Promise<string> {
        if (!this.privateKey) {
            throw Error('Attempted to sign without a private key');
        }

        return signEvent(event as UnsignedEvent, this.privateKey);
    }
}
