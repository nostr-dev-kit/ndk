import * as SecureStore from "expo-secure-store";
import { loadSessionsFromStorage, type NDKSessionStorageAdapter } from "@nostr-dev-kit/ndk-hooks";

/**
 * Implementation of NDKSessionStorageAdapter using Expo's SecureStore.
 */
export class NDKSessionExpoSecureStore implements NDKSessionStorageAdapter {
    /**
     * Get an item from SecureStore.
     *
     * @param key The key to retrieve.
     * @returns The stored value or null if not found.
     */
    getItem(key: string): string | null {
        return SecureStore.getItem(key);
    }

    /**
     * Set an item in SecureStore.
     *
     * @param key The key to store.
     * @param value The value to store.
     */
    setItem(key: string, value: string): void {
        SecureStore.setItem(key, value);
    }

    /**
     * Delete an item from SecureStore.
     * Note: This is a synchronous wrapper around the asynchronous SecureStore API.
     *
     * @param key The key to delete.
     */
    deleteItem(key: string): void {
        SecureStore.deleteItemAsync(key);
    }
}

const SESSIONS_STORE_KEY = "ndk-saved-sessions";
const LEGACY_LOGIN_STORE_KEY = "login";

/**
 * Migrate legacy login data to the new session storage format.
 * @returns A promise that resolves when migration is complete.
 */
export async function migrateLegacyLogin(sessionStore: NDKSessionStorageAdapter): Promise<void> {
    try {
        const legacySessionKey = await SecureStore.getItemAsync(LEGACY_LOGIN_STORE_KEY);
        if (legacySessionKey) {
            console.log("[NDK-Mobile] Found legacy login, migrating...");

            // Import dynamically to avoid circular dependencies
            const { NDKPrivateKeySigner } = await import("@nostr-dev-kit/ndk");

            if (legacySessionKey.startsWith("nsec1")) {
                const signer = new NDKPrivateKeySigner(legacySessionKey);
                const pubkey = await signer.user().then((user) => user.pubkey);

                if (pubkey) {
                    const sessions = await loadSessionsFromStorage(sessionStore);
                    const existingSession = sessions.find((s) => s.pubkey === pubkey);

                    if (!existingSession) {
                        const signerPayload = signer.toPayload();
                        if (signerPayload) {
                            sessions.push({ pubkey, signerPayload });
                            await SecureStore.setItemAsync(SESSIONS_STORE_KEY, JSON.stringify(sessions));
                            console.log(`[NDK-Mobile] Migrated legacy login for pubkey ${pubkey}`);
                        }
                    }
                }
            }

            // Delete the legacy login key after migration
            await SecureStore.deleteItemAsync(LEGACY_LOGIN_STORE_KEY);
            console.log("[NDK-Mobile] Legacy login migration complete");
        }
    } catch (error) {
        console.error("[NDK-Mobile] Error migrating legacy login:", error);
    }
}
