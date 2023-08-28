import type { NostrEvent } from "../events/index.js";
import NDKUser from "../user";

/**
 * Interface for NDK signers.
 */
export interface NDKSigner {
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

    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns A promise that resolves to the signature of the signed event.
     */
    sign(event: NostrEvent): Promise<string>;

    /**
     * Encrypts the given Nostr event for the given recipient.
     * @param value - The value to be encrypted.
     * @param recipient - The recipient of the encrypted value.
     */
    encrypt(recipient: NDKUser, value: string): Promise<string>;

    /**
     * Decrypts the given value.
     * @param value
     */
    decrypt(sender: NDKUser, value: string): Promise<string>;
}
