import type { NostrEvent } from "../events/index.js";
import type { NDK } from "../ndk/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKUser } from "../user";

export type ENCRYPTION_SCHEMES = "nip04" | "nip44";
export const DEFAULT_ENCRYPTION_SCHEME: ENCRYPTION_SCHEMES = "nip44";

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
    relays?(ndk?: NDK): Promise<NDKRelay[]>;

    /**
     * Encrypts the given Nostr event for the given recipient.
     * @param value - The value to be encrypted.
     * @param recipient - The recipient of the encrypted value.
     * @param type - The encryption scheme to use. Defaults to "nip04".
     */
    encrypt(recipient: NDKUser, value: string, type?: ENCRYPTION_SCHEMES): Promise<string>;

    /**
     * Decrypts the given value.
     * @param value
     * @param sender
     * @param type - The encryption scheme to use. Defaults to "nip04".
     */
    decrypt(sender: NDKUser, value: string, type?: ENCRYPTION_SCHEMES): Promise<string>;

    /**
     * @deprecated use nip44Encrypt instead
     */
    nip04Encrypt(recipient: NDKUser, value: string): Promise<string>;

    /**
     * @deprecated use nip44Decrypt instead
     */
    nip04Decrypt(sender: NDKUser, value: string): Promise<string>;

    /**
     * @deprecated use nip44Encrypt instead
     */
    nip44Encrypt(recipient: NDKUser, value: string): Promise<string>;

    /**
     * @deprecated use nip44Decrypt instead
     */
    nip44Decrypt(sender: NDKUser, value: string): Promise<string>;
}
