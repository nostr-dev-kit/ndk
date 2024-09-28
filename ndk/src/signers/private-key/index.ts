import type { UnsignedEvent } from "nostr-tools";
import { generateSecretKey, getPublicKey, finalizeEvent, nip04, nip44 } from "nostr-tools";

import type { NostrEvent } from "../../events/index.js";
import { NDKUser } from "../../user";
import { DEFAULT_ENCRYPTION_SCHEME, ENCRYPTION_SCHEMES, type NDKSigner } from "../index.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { nip19 } from "nostr-tools";

export class NDKPrivateKeySigner implements NDKSigner {
    private _user: NDKUser | undefined;
    _privateKey?: Uint8Array;

    public constructor(privateKey?: Uint8Array | string) {
        if (privateKey) {
            // If it's a string, it can be either a hex encoded private key or an nsec.
            if (typeof privateKey === "string") {
                // If it's an nsec, try and decode
                if (privateKey.startsWith("nsec1")) {
                    const { type, data } = nip19.decode(privateKey);
                    // console.log(type, data);
                    if (type === "nsec") this._privateKey = data;
                    // If it's a hex encoded private key, convert to Uint8Array
                } else if (privateKey.length === 64) {
                    this._privateKey = hexToBytes(privateKey);
                } else {
                    throw new Error("Invalid private key provided.");
                }
            } else {
                this._privateKey = privateKey as Uint8Array;
            }

            if (this._privateKey) {
                this._user = new NDKUser({
                    pubkey: getPublicKey(this._privateKey),
                });
            }
        }
    }

    get privateKey(): string | undefined {
        if (!this._privateKey) return undefined;
        return bytesToHex(this._privateKey);
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
        if (!this._privateKey) {
            throw Error("Attempted to sign without a private key");
        }

        return finalizeEvent(event as UnsignedEvent, this._privateKey).sig;
    }

    private getConversationKey(recipient: NDKUser): Uint8Array {
        if (!this._privateKey) {
            throw Error("Attempted to get conversation key without a private key");
        }

        const recipientHexPubKey = recipient.pubkey;
        return nip44.getConversationKey(this._privateKey, recipientHexPubKey);
    }

    public async nip44Encrypt(recipient: NDKUser, value: string): Promise<string> {
        const conversationKey = this.getConversationKey(recipient);
        return await nip44.encrypt(value, conversationKey);
    }

    public async nip44Decrypt(sender: NDKUser, value: string): Promise<string> {
        const conversationKey = this.getConversationKey(sender);
        return await nip44.decrypt(value, conversationKey);
    }

    /**
     * This method is deprecated and will be removed in a future release, for compatibility
     * this function calls nip04Encrypt.
     */
    public async encrypt(
        recipient: NDKUser,
        value: string,
        type: ENCRYPTION_SCHEMES = DEFAULT_ENCRYPTION_SCHEME
    ): Promise<string> {
        if (type === "nip44") {
            return this.nip44Encrypt(recipient, value);
        } else {
            return this.nip04Encrypt(recipient, value);
        }
    }

    /**
     * This method is deprecated and will be removed in a future release, for compatibility
     * this function calls nip04Decrypt.
     */
    public async decrypt(
        sender: NDKUser,
        value: string,
        type: ENCRYPTION_SCHEMES = DEFAULT_ENCRYPTION_SCHEME
    ): Promise<string> {
        if (type === "nip44") {
            return this.nip44Decrypt(sender, value);
        } else {
            return this.nip04Decrypt(sender, value);
        }
    }

    public async nip04Encrypt(recipient: NDKUser, value: string): Promise<string> {
        if (!this._privateKey) {
            throw Error("Attempted to encrypt without a private key");
        }

        const recipientHexPubKey = recipient.pubkey;
        return await nip04.encrypt(this._privateKey, recipientHexPubKey, value);
    }

    public async nip04Decrypt(sender: NDKUser, value: string): Promise<string> {
        if (!this._privateKey) {
            throw Error("Attempted to decrypt without a private key");
        }

        const senderHexPubKey = sender.pubkey;
        return await nip04.decrypt(this._privateKey, senderHexPubKey, value);
    }
}
