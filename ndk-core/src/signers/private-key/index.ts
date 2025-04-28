import type { UnsignedEvent } from "nostr-tools";
import { finalizeEvent, generateSecretKey, getPublicKey, nip04, nip44 } from "nostr-tools";

import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { nip19 } from "nostr-tools";
import type { NostrEvent } from "../../events/index.js";
import type { NDK } from "../../ndk/index.js";
import type { NDKEncryptionScheme } from "../../types.js";
import { NDKUser } from "../../user";
import type { NDKSigner } from "../index.js";
import { registerSigner } from "../registry.js";

/**
 * A signer that uses an in-memory private key (nsec).
 *
 * @example
 * ```ts
 * const signer = NDKPrivateKeySigner.generate();
 * console.log('your nsec is', signer.nsec);
 * console.log('your pubkey is', signer.pubkey);
 * console.log('your npub is', signer.npub);
 * ```
 *
 * @example
 * ```ts
 * const signer = new NDKPrivateKeySigner(nsec);
 * ```
 */
export class NDKPrivateKeySigner implements NDKSigner {
    private _user: NDKUser;
    private _privateKey: Uint8Array;
    private _pubkey?: string;

    /**
     * Create a new signer from a private key.
     * @param privateKey - The private key to use in hex form or nsec.
     * @param ndk - The NDK instance to use.
     */
    public constructor(privateKeyOrNsec: Uint8Array | string, ndk?: NDK) {
        // If it's a string, it can be either a hex encoded private key or an nsec.
        if (typeof privateKeyOrNsec === "string") {
            // If it's an nsec, try and decode
            if (privateKeyOrNsec.startsWith("nsec1")) {
                const { type, data } = nip19.decode(privateKeyOrNsec);
                if (type === "nsec") this._privateKey = data;
                else throw new Error("Invalid private key provided.");
            } else if (privateKeyOrNsec.length === 64) {
                this._privateKey = hexToBytes(privateKeyOrNsec);
            } else {
                throw new Error("Invalid private key provided.");
            }
        } else {
            this._privateKey = privateKeyOrNsec as Uint8Array;
        }

        this._pubkey = getPublicKey(this._privateKey);
        if (ndk) this._user = ndk.getUser({ pubkey: this._pubkey });
        this._user ??= new NDKUser({ pubkey: this._pubkey });
    }

    /**
     * Get the private key in hex form.
     */
    get privateKey(): string {
        if (!this._privateKey) throw new Error("Not ready");
        return bytesToHex(this._privateKey);
    }

    /**
     * Get the public key in hex form.
     */
    get pubkey(): string {
        if (!this._pubkey) throw new Error("Not ready");
        return this._pubkey;
    }

    /**
     * Get the private key in nsec form.
     */
    get nsec(): string {
        if (!this._privateKey) throw new Error("Not ready");
        return nip19.nsecEncode(this._privateKey);
    }

    /**
     * Get the public key in npub form.
     */
    get npub(): string {
        if (!this._pubkey) throw new Error("Not ready");
        return nip19.npubEncode(this._pubkey);
    }

    /**
     * Generate a new private key.
     */
    public static generate(): NDKPrivateKeySigner {
        const privateKey = generateSecretKey();
        return new NDKPrivateKeySigner(privateKey);
    }

    /**
     * Noop in NDKPrivateKeySigner.
     */
    public async blockUntilReady(): Promise<NDKUser> {
        return this._user;
    }

    /**
     * Get the user.
     */
    public async user(): Promise<NDKUser> {
        return this._user;
    }

    /**
     * Get the user.
     */
    public get userSync(): NDKUser {
        return this._user;
    }

    public async sign(event: NostrEvent): Promise<string> {
        if (!this._privateKey) {
            throw Error("Attempted to sign without a private key");
        }

        return finalizeEvent(event as UnsignedEvent, this._privateKey).sig;
    }

    public async encryptionEnabled(scheme?: NDKEncryptionScheme): Promise<NDKEncryptionScheme[]> {
        const enabled: NDKEncryptionScheme[] = [];
        if (!scheme || scheme === "nip04") enabled.push("nip04");
        if (!scheme || scheme === "nip44") enabled.push("nip44");
        return enabled;
    }

    public async encrypt(recipient: NDKUser, value: string, scheme?: NDKEncryptionScheme): Promise<string> {
        if (!this._privateKey || !this.privateKey) {
            throw Error("Attempted to encrypt without a private key");
        }

        const recipientHexPubKey = recipient.pubkey;
        if (scheme === "nip44") {
            const conversationKey = nip44.v2.utils.getConversationKey(this._privateKey, recipientHexPubKey);
            return await nip44.v2.encrypt(value, conversationKey);
        }
        return await nip04.encrypt(this._privateKey, recipientHexPubKey, value);
    }

    public async decrypt(sender: NDKUser, value: string, scheme?: NDKEncryptionScheme): Promise<string> {
        if (!this._privateKey || !this.privateKey) {
            throw Error("Attempted to decrypt without a private key");
        }

        const senderHexPubKey = sender.pubkey;
        if (scheme === "nip44") {
            const conversationKey = nip44.v2.utils.getConversationKey(this._privateKey, senderHexPubKey);
            return await nip44.v2.decrypt(value, conversationKey);
        }
        return await nip04.decrypt(this._privateKey, senderHexPubKey, value);
    }

    /**
     * Serializes the signer's private key into a storable format.
     * @returns A JSON string containing the type and the hex private key.
     */
    public toPayload(): string {
        if (!this._privateKey) throw new Error("Private key not available");
        const payload = {
            type: "private-key",
            payload: this.privateKey, // Use the hex private key
        };
        return JSON.stringify(payload);
    }

    /**
     * Deserializes the signer from a payload string.
     * @param payloadString The JSON string obtained from toPayload().
     * @param ndk Optional NDK instance.
     * @returns An instance of NDKPrivateKeySigner.
     */
    public static async fromPayload(payloadString: string, ndk?: NDK): Promise<NDKPrivateKeySigner> {
        const payload = JSON.parse(payloadString);

        if (payload.type !== "private-key") {
            throw new Error(`Invalid payload type: expected 'private-key', got ${payload.type}`);
        }

        if (!payload.payload || typeof payload.payload !== "string") {
            throw new Error("Invalid payload content for private-key signer");
        }

        return new NDKPrivateKeySigner(payload.payload, ndk);
    }
}

registerSigner("private-key", NDKPrivateKeySigner);
