import type { UnsignedEvent } from "nostr-tools/pure";
import { generateSecretKey, getPublicKey, finalizeEvent } from "nostr-tools/pure";
import * as nip04 from "nostr-tools/nip04";

import type { NostrEvent } from "../../events/index.js";
import { NDKUser } from "../../user/index.js";
import type { NDKSigner } from "../index.js";

export class NDKPrivateKeySigner implements NDKSigner {
    private _user: NDKUser | undefined;
    privateKey?: Uint8Array;

    public constructor(privateKey?: Uint8Array) {
        if (privateKey) {
            this.privateKey = privateKey;
            this._user = new NDKUser({
                hexpubkey: getPublicKey(this.privateKey),
            });
        }
    }

    public static generate(): NDKPrivateKeySigner {
        const privateKey = generateSecretKey();
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

        return finalizeEvent(event as UnsignedEvent, this.privateKey).sig;
    }

    public async encrypt(recipient: NDKUser, value: string): Promise<string> {
        if (!this.privateKey) {
            throw Error("Attempted to encrypt without a private key");
        }

        const recipientHexPubKey = recipient.pubkey;
        return await nip04.encrypt(this.privateKey, recipientHexPubKey, value);
    }

    public async decrypt(sender: NDKUser, value: string): Promise<string> {
        if (!this.privateKey) {
            throw Error("Attempted to decrypt without a private key");
        }

        const senderHexPubKey = sender.pubkey;
        return await nip04.decrypt(this.privateKey, senderHexPubKey, value);
    }
}
