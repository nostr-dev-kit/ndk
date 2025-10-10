import type { NostrEvent } from "../events/index.js";
import type { NDK } from "../ndk/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKEncryptionScheme } from "../types.js";
import type { NDKUser } from "../user";

/**
 * Interface for NDK signers.
 */
/**
 * Interface for a serialized signer payload
 */
export interface NDKSignerPayload {
    type: string;
    payload: string;
}

export interface NDKSigner {
    /**
     * Synchronously get the public key of the signer.
     * @throws {Error} "Not ready" when the signer is not ready to provide a pubkey synchronously (e.g., NIP-07 or NIP-46 signers)
     * @returns The public key in hex format
     */
    get pubkey(): string;

    /**
     * Blocks until the signer is ready and returns the associated NDKUser.
     * @returns A promise that resolves to the NDKUser instance.
     */
    blockUntilReady(): Promise<NDKUser>;

    /**
     * Getter for the user property.
     * @returns A promise that resolves to the NDKUser instance.
     */
    user(): Promise<NDKUser>;

    get userSync(): NDKUser;

    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns A promise that resolves to the signature of the signed event.
     */
    sign(event: NostrEvent): Promise<string>;

    /**
     * Getter for the preferred relays.
     * @returns A promise containing a simple map of preferred relays and their read/write policies.
     */
    relays?(ndk?: NDK): Promise<NDKRelay[]>;

    /**
     * Determine the types of encryption (by nip) that this signer can perform.
     * Implementing classes SHOULD return a value even for legacy (only nip04) third party signers.
     * @nip Optionally returns an array with single supported nip or empty, to check for truthy or falsy.
     * @return A promised list of any (or none) of these strings  ['nip04', 'nip44']
     */
    encryptionEnabled?(scheme?: NDKEncryptionScheme): Promise<NDKEncryptionScheme[]>;

    /**
     * Encrypts the given Nostr event for the given recipient.
     * Implementing classes SHOULD equate legacy (only nip04) to nip == `nip04` || undefined
     * @param recipient - The recipient (pubkey or conversationKey) of the encrypted value.
     * @param value - The value to be encrypted.
     * @param nip - which NIP is being implemented ('nip04', 'nip44')
     */
    encrypt(recipient: NDKUser, value: string, scheme?: NDKEncryptionScheme): Promise<string>;

    /**
     * Decrypts the given value.
     * Implementing classes SHOULD equate legacy (only nip04) to nip == `nip04` || undefined
     * @param sender - The sender (pubkey or conversationKey) of the encrypted value
     * @param value - The value to be decrypted
     * @param scheme - which NIP is being implemented ('nip04', 'nip44', 'nip49')
     */
    decrypt(sender: NDKUser, value: string, scheme?: NDKEncryptionScheme): Promise<string>;

    /**
     * Serializes the signer's essential data into a storable format.
     * @returns A JSON string containing the type and payload.
     */
    toPayload(): string;
}

/**
 * Interface for Signer classes that support static deserialization
 */
export interface NDKSignerStatic<T extends NDKSigner> {
    /**
     * Deserializes the signer from a payload string.
     * @param payload The JSON string obtained from toPayload().
     * @param ndk Optional NDK instance, required by some signers (e.g., NIP-46).
     * @returns An instance of the specific signer class.
     */
    fromPayload(payload: string, ndk?: NDK): Promise<T>;
}
