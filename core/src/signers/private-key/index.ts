import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import type { UnsignedEvent } from "nostr-tools";
import { finalizeEvent, generateSecretKey, getPublicKey, nip04, nip19, nip44 } from "nostr-tools";
import * as nip49 from "nostr-tools/nip49";
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
     *
     * @ai-guardrail
     * If you have an nsec (bech32-encoded private key starting with "nsec1"), you can pass it directly
     * to this constructor without decoding it first. The constructor handles both hex and nsec formats automatically.
     * DO NOT use nip19.decode() to convert nsec to hex before passing it here - just pass the nsec string directly.
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
     * Encrypt the private key with a password to ncryptsec format.
     * @param password - The password to encrypt the private key.
     * @param logn - The log2 of the scrypt N parameter (default: 16).
     * @param ksb - The key security byte (0x00, 0x01, or 0x02, default: 0x02).
     * @returns The encrypted private key in ncryptsec format.
     *
     * @example
     * ```ts
     * const signer = new NDKPrivateKeySigner(nsec);
     * const ncryptsec = signer.encryptToNcryptsec("my-password");
     * console.log('encrypted key:', ncryptsec);
     * ```
     */
    public encryptToNcryptsec(password: string, logn: number = 16, ksb: 0x00 | 0x01 | 0x02 = 0x02): string {
        if (!this._privateKey) throw new Error("Private key not available");
        return nip49.encrypt(this._privateKey, password, logn, ksb);
    }

    /**
     * Generate a new private key.
     */
    public static generate(): NDKPrivateKeySigner {
        const privateKey = generateSecretKey();
        return new NDKPrivateKeySigner(privateKey);
    }

    /**
     * Create a signer from an encrypted private key (ncryptsec) using a password.
     * @param ncryptsec - The encrypted private key in ncryptsec format.
     * @param password - The password to decrypt the private key.
     * @param ndk - Optional NDK instance.
     * @returns A new NDKPrivateKeySigner instance.
     *
     * @example
     * ```ts
     * const signer = NDKPrivateKeySigner.fromNcryptsec(
     *   "ncryptsec1qgg9947rlpvqu76pj5ecreduf9jxhselq2nae2kghhvd5g7dgjtcxfqtd67p9m0w57lspw8gsq6yphnm8623nsl8xn9j4jdzz84zm3frztj3z7s35vpzmqf6ksu8r89qk5z2zxfmu5gv8th8wclt0h4p",
     *   "my-password"
     * );
     * console.log('your pubkey is', signer.pubkey);
     * ```
     */
    public static fromNcryptsec(ncryptsec: string, password: string, ndk?: NDK): NDKPrivateKeySigner {
        const privateKeyBytes = nip49.decrypt(ncryptsec, password);
        return new NDKPrivateKeySigner(privateKeyBytes, ndk);
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
