import debug from "debug";

import type NDK from "@nostr-dev-kit/ndk";
import {
    type NDKEncryptionScheme,
    type NDKSigner,
    NDKUser,
    type NostrEvent,
    signerRegistry, // Import the registry from ndk-core
} from "@nostr-dev-kit/ndk";
import * as Nip55 from "expo-nip55";

export class NDKNip55Signer implements NDKSigner {
    private _pubkey: string;
    private _user?: NDKUser;
    public packageName: string;
    private ndk?: NDK;

    constructor(packageName: string, ndk?: NDK) {
        this.packageName = packageName;
        this.ndk = ndk;
    }

    /**
     * Blocks until the signer is ready and returns the associated NDKUser.
     * @returns A promise that resolves to the NDKUser instance.
     */
    async blockUntilReady(): Promise<NDKUser> {
        if (this._user) return this._user;

        await Nip55.setPackageName(this.packageName);

        const data = await Nip55.getPublicKey();
        if (!data) throw new Error("No signer available found");

        this._user = new NDKUser({ npub: data.npub });
        this._pubkey = this._user.pubkey;
        return this._user;
    }
    /**
     * Getter for the user property.
     * @returns A promise that resolves to the NDKUser instance.
     */
    async user(): Promise<NDKUser> {
        return this.blockUntilReady();
    }

    public get userSync(): NDKUser {
        if (!this._user) throw new Error("User not ready");
        return this._user;
    }

    public get pubkey(): string {
        if (!this._pubkey) throw new Error("Pubkey not ready");
        return this._pubkey;
    }

    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns A promise that resolves to the signature of the signed event.
     */
    async sign(event: NostrEvent): Promise<string> {
        const result = await Nip55.signEvent(
            this.packageName,
            JSON.stringify(event),
            event.id,
            this._pubkey
        );
        return result.signature;
    }

    /**
     * Determine the types of encryption (by nip) that this signer can perform.
     * Implementing classes SHOULD return a value even for legacy (only nip04) third party signers.
     * @nip Optionally returns an array with single supported nip or empty, to check for truthy or falsy.
     * @return A promised list of any (or none) of these strings  ['nip04', 'nip44']
     */
    async encryptionEnabled?(_scheme?: NDKEncryptionScheme): Promise<NDKEncryptionScheme[]> {
        return [];
    }

    /**
     * Encrypts the given Nostr event for the given recipient.
     * Implementing classes SHOULD equate legacy (only nip04) to nip == `nip04` || undefined
     * @param recipient - The recipient (pubkey or conversationKey) of the encrypted value.
     * @param value - The value to be encrypted.
     * @param nip - which NIP is being implemented ('nip04', 'nip44')
     */
    async encrypt(
        _recipient: NDKUser,
        _value: string,
        _scheme?: NDKEncryptionScheme
    ): Promise<string> {
        return "";
    }
    /**
     * Decrypts the given value.
     * Implementing classes SHOULD equate legacy (only nip04) to nip == `nip04` || undefined
     * @param sender - The sender (pubkey or conversationKey) of the encrypted value
     * @param value - The value to be decrypted
     * @param scheme - which NIP is being implemented ('nip04', 'nip44', 'nip49')
     */
    async decrypt(
        _sender: NDKUser,
        _value: string,
        _scheme?: NDKEncryptionScheme
    ): Promise<string> {
        return "";
    }

    /**
     * Serializes the signer's package name and pubkey.
     * @returns A JSON string containing the type, package name, and pubkey.
     */
    public toPayload(): string {
        if (!this._pubkey) {
            throw new Error("NIP-55 signer not ready for serialization (missing pubkey)");
        }
        const payload = {
            type: "nip55",
            payload: {
                packageName: this.packageName,
                pubkey: this._pubkey, // Include pubkey for potential re-initialization
            },
        };
        return JSON.stringify(payload);
    }

    /**
     * Deserializes the signer from a payload string.
     * @param payloadString The JSON string obtained from toPayload().
     * @param ndk Optional NDK instance.
     * @returns An instance of NDKNip55Signer.
     */
    public static async fromPayload(payloadString: string, ndk?: NDK): Promise<NDKNip55Signer> {
        const parsed = JSON.parse(payloadString);

        if (parsed.type !== "nip55") {
            throw new Error(`Invalid payload type: expected 'nip55', got ${parsed.type}`);
        }

        const payload = parsed.payload;

        if (!payload || typeof payload !== 'object' || !payload.packageName) {
            throw new Error("Invalid payload content for nip55 signer");
        }

        const signer = new NDKNip55Signer(payload.packageName, ndk);
        // We can optionally pre-set the pubkey if available in the payload
        // to potentially speed up the initial blockUntilReady, though it will verify anyway.
        if (payload.pubkey) {
            signer._pubkey = payload.pubkey;
        }

        return signer;
    }
} // End of NDKNip55Signer class

// Register this signer type with the core registry *outside* the class definition
// This ensures ndkSignerFromPayload can deserialize it.
signerRegistry.set("nip55", NDKNip55Signer);
