import NDKUser from '../user';
import type { NostrEvent } from '../events/index';

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
}
