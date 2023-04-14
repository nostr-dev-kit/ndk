import { signEvent, generatePrivateKey, getPublicKey } from 'nostr-tools';
import type { UnsignedEvent } from 'nostr-tools';
import type { NostrEvent } from '../../events/index.js';
import { NDKSigner } from '../index.js';
import User from '../../user';

export class NDKPrivateKeySigner implements NDKSigner {
    private _user: User | undefined;
    privateKey?: string;

    public constructor(privateKey?: string) {
        if (privateKey) {
            this.privateKey = privateKey;
            this._user = new User({ hexpubkey: getPublicKey(this.privateKey) });
        }
    }

    public static generate() {
        const privateKey = generatePrivateKey();
        return new NDKPrivateKeySigner(privateKey);
    }

    public async blockUntilReady(): Promise<User> {
        if (!this._user) {
        throw new Error('User not initialized');
        }
        return this._user;
    }

    public async user(): Promise<User> {
        await this.blockUntilReady();
        return this._user as User;
    }

    public async sign(event: NostrEvent): Promise<string> {
        if (!this.privateKey) {
        throw Error('Attempted to sign without a private key');
        }

        return signEvent(event as UnsignedEvent, this.privateKey);
    }
}