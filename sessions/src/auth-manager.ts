import type NDK from "@nostr-dev-kit/ndk";
import type { Hexpubkey, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import type { SessionStore } from "./store";
import type { LoginOptions } from "./types";
import { NoActiveSessionError } from "./utils/errors";

/**
 * Handles authentication operations for the session manager.
 * Responsible for login, logout, and session switching.
 */
export class AuthManager {
    constructor(
        private store: SessionStore,
        private getStore: () => SessionStore,
    ) {}

    /**
     * Login with a signer or user
     * Orchestrates authentication without handling persistence
     */
    async login(userOrSigner: NDKUser | NDKSigner, options: LoginOptions = {}): Promise<Hexpubkey> {
        const { setActive = true, ...startOptions } = options;

        // Add session
        const pubkey = await this.store.addSession(userOrSigner, setActive);

        // Start fetching data (startSession handles empty options)
        this.store.startSession(pubkey, startOptions);

        return pubkey;
    }

    /**
     * Logout (remove) a session
     */
    logout(pubkey?: Hexpubkey): void {
        const targetPubkey = pubkey ?? this.getStore().activePubkey;
        if (!targetPubkey) {
            throw new NoActiveSessionError();
        }

        this.store.removeSession(targetPubkey);
    }

    /**
     * Switch to a different session
     */
    switchTo(pubkey: Hexpubkey | null): void {
        this.store.switchToUser(pubkey);
    }
}
