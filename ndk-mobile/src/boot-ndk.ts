import type NDK from '@nostr-dev-kit/ndk';
import type { Hexpubkey } from '@nostr-dev-kit/ndk';
// Cannot import ndkSignerFromPayload as it's async and this function is sync
import { loadSessionsFromStorageSync } from './session-storage.js';

/**
 * Initializes the NDK instance synchronously with the most recently active user from storage.
 * Sets ndk.activeUser if a session is found.
 * Does NOT set ndk.signer, as signer deserialization is asynchronous.
 * Should be called during app boot, potentially before React context is available.
 *
 * @param ndk The NDK instance to initialize.
 * @returns The pubkey of the user that was booted, or null if no session was found.
 */
export function bootNDK(ndk: NDK): Hexpubkey | null {
    try {
        const sessions = loadSessionsFromStorageSync(); // Use synchronous load
        if (sessions.length === 0) {
            console.log("bootNDK (sync): No sessions found in storage.");
            return null;
        }

        // The first session is the most recently active one due to sorting
        const mostRecentSession = sessions[0];
        const userPubkey = mostRecentSession.pubkey;

        console.log(`bootNDK (sync): Setting active user to ${userPubkey}`);

        ndk.activeUser = ndk.getUser({ pubkey: userPubkey });

        // Cannot set signer synchronously because ndkSignerFromPayload is async.
        // useSessionMonitor will handle async signer loading later.
        if (mostRecentSession.signerPayload) {
            console.log(`bootNDK (sync): Signer payload found for ${userPubkey}, but will be loaded asynchronously later.`);
        } else {
            console.log(`bootNDK (sync): No signer payload found for ${userPubkey}. User is read-only initially.`);
        }

        return userPubkey;
    } catch (error) {
        console.error('bootNDK (sync): Error initializing NDK with active user:', error);
        // Reset activeUser if an error occurred during boot
        ndk.activeUser = undefined;
        return null;
    }
}