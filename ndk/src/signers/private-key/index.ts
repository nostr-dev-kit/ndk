import type { UnsignedEvent } from "nostr-tools";
import { generatePrivateKey, getPublicKey, getSignature, nip04 } from "nostr-tools";

import type { NostrEvent } from "../../events/index.js";
import { NDKUser } from "../../user";
import type { NDKSigner } from "../index.js";

export class NDKPrivateKeySigner implements NDKSigner {
    private _user: NDKUser | undefined;
    privateKey?: string;

    public constructor(privateKey?: string) {
        if (privateKey) {
            this.privateKey = privateKey;
            this._user = new NDKUser({
                hexpubkey: getPublicKey(this.privateKey),
            });
        }
    }

    public static generate() {
        const privateKey = generatePrivateKey();
        return new NDKPrivateKeySigner(privateKey);
    }

    public async blockUntilReady(): Promise<NDKUser> {
        if (!this._user) {
            throw new Error("NDKUser not initialized");
        }
        return this._user;
    }

    public async user(): Promise<NDKUser> {
        await this.blockUntilReady();
        return this._user as NDKUser;
    }

    public async sign(event: NostrEvent): Promise<string> {
        if (!this.privateKey) {
            throw Error("Attempted to sign without a private key");
        }

        return getSignature(event as UnsignedEvent, this.privateKey);
    }

    public async encrypt(recipient: NDKUser, value: string): Promise<string> {
        if (!this.privateKey) {
            throw Error("Attempted to encrypt without a private key");
        }

        const recipientHexPubKey = recipient.hexpubkey;
        return await nip04.encrypt(this.privateKey, recipientHexPubKey, value);
    }

    public async decrypt(sender: NDKUser, value: string): Promise<string> {
        if (!this.privateKey) {
            throw Error("Attempted to decrypt without a private key");
        }

        const senderHexPubKey = sender.hexpubkey;
        return await nip04.decrypt(this.privateKey, senderHexPubKey, value);
    }
}
