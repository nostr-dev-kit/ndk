import type { NostrEvent } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKUser } from "../user";

export enum EncryptionStrategy {
    nip04 = "nip04",
    nip44 = "nip44",
}

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
     * Getter for the preferred relays.
     * @returns A promise containing a simple map of preferred relays and their read/write policies.
     */
    relays?(): Promise<NDKRelay[]>;

    /**
     * Encrypts the given Nostr event for the given recipient.
     * @param value - The value to be encrypted.
     * @param recipient - The recipient of the encrypted value.
     * @param strategy - The encryption strategy to use (nip04 or nip44). Defaults to nip04.
     */
    encrypt(recipient: NDKUser, value: string, strategy?: EncryptionStrategy): Promise<string>;

    /**
     * Decrypts the given value.
     * @param value
     * @param strategy - The encryption strategy to use (nip04 or nip44). Defaults to nip04.
     */
    decrypt(sender: NDKUser, value: string, strategy?: EncryptionStrategy): Promise<string>;
}
