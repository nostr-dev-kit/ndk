import { NDKSigner } from '../index.js';
import type { NostrEvent } from '../../events/index.js';
import NDKUser from '../../user/index.js';

/**
 * NDKNip07Signer implements the NDKSigner interface for signing Nostr events
 * with a NIP-07 browser extension (e.g., getalby, nos2x).
 */
export class NDKNip07Signer implements NDKSigner {
    private _userPromise: Promise<NDKUser> | undefined;

    public constructor() {
        if (!window.nostr) {
            throw new Error('NIP-07 extension not available');
        }
    }

    public async blockUntilReady(): Promise<NDKUser> {
        const pubkey = await window.nostr?.getPublicKey();

        // If the user rejects granting access, error out
        if (!pubkey) {
            throw new Error('User rejected access');
        }

        return new NDKUser({ hexpubkey: pubkey });
    }

    /**
     * Getter for the user property.
     * @returns The NDKUser instance.
     */
    public async user(): Promise<NDKUser> {
        if (!this._userPromise) {
            this._userPromise = this.blockUntilReady();
        }

        return this._userPromise;
    }

    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns The signature of the signed event.
     * @throws Error if the NIP-07 is not available on the window object.
     */
    public async sign(event: NostrEvent): Promise<string> {
        if (!window.nostr) {
            throw new Error('NIP-07 extension not available');
        }

        const signedEvent = await window.nostr.signEvent(event);
        return signedEvent.sig;
    }

    public async encrypt(recipient: NDKUser, value: string): Promise<string> {
        if (!window.nostr) {
            throw new Error('NIP-07 extension not available');
        }

        const recipientHexPubKey = recipient.hexpubkey();
        return window.nostr.nip04.encrypt(recipientHexPubKey, value);
    }

    public async decrypt(sender: NDKUser, value: string): Promise<string> {
        if (!window.nostr) {
            throw new Error('NIP-07 extension not available');
        }

        const senderHexPubKey = sender.hexpubkey();
        return window.nostr.nip04.decrypt(senderHexPubKey, value);
    }
}

declare global {
    interface Window {
        nostr?: {
            getPublicKey(): Promise<string>;
            signEvent(event: NostrEvent): Promise<{ sig: string }>;
            nip04: {
                encrypt(recipientHexPubKey: string, value: string): Promise<string>;
                decrypt(senderHexPubKey: string, value: string): Promise<string>;
            }
        };
    }
}
