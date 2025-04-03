import * as SecureStore from 'expo-secure-store';
import type { Hexpubkey } from '@nostr-dev-kit/ndk';

const SESSIONS_STORE_KEY = 'ndk-saved-sessions';

/**
 * Interface for a stored user session, mirroring the structure used for persistence.
 */
export interface StoredSession {
    pubkey: Hexpubkey;
    signerPayload?: string; // Store the stringified payload from signer.toPayload()
    lastActive: number;
}

/**
 * Load sessions from secure storage asynchronously.
 * @returns A promise that resolves to an array of stored sessions, sorted by lastActive descending.
 */
export async function loadSessionsFromStorage(): Promise<StoredSession[]> {
    try {
        const sessionsJson = await SecureStore.getItemAsync(SESSIONS_STORE_KEY);
        if (!sessionsJson) return [];

        const sessions = JSON.parse(sessionsJson) as StoredSession[];
        // Sort by lastActive (most recent first)
        return sessions.sort((a, b) => b.lastActive - a.lastActive);
    } catch (error) {
        console.error('Error loading sessions from storage (async):', error);
        return [];
    }
}

/**
 * Load sessions from secure storage synchronously.
 * Note: Synchronous storage access can block the JS thread. Use judiciously.
 * @returns An array of stored sessions, sorted by lastActive descending.
 */
export function loadSessionsFromStorageSync(): StoredSession[] {
    try {
        const sessionsJson = SecureStore.getItem(SESSIONS_STORE_KEY);
        if (!sessionsJson) return [];

        const sessions = JSON.parse(sessionsJson) as StoredSession[];
        // Sort by lastActive (most recent first)
        return sessions.sort((a, b) => b.lastActive - a.lastActive);
    } catch (error) {
        console.error('Error loading sessions from storage (sync):', error);
        return [];
    }
}


/**
 * Save sessions to secure storage asynchronously.
 * @param sessions An array of sessions to save.
 */
export async function saveSessionsToStorage(
    sessions: StoredSession[]
): Promise<void> {
    try {
        // Sort by lastActive (most recent first) before saving
        const sortedSessions = [...sessions].sort((a, b) => b.lastActive - a.lastActive);
        await SecureStore.setItemAsync(
            SESSIONS_STORE_KEY,
            JSON.stringify(sortedSessions)
        );
    } catch (error) {
        console.error('Error saving sessions to storage:', error);
    }
}

/**
 * Retrieve a specific stored session by pubkey asynchronously.
 * @param pubkey The pubkey of the session to retrieve.
 * @returns A promise resolving to the stored session or undefined if not found.
 */
export async function getStoredSession(
    pubkey: Hexpubkey
): Promise<StoredSession | undefined> {
    const sessions = await loadSessionsFromStorage();
    return sessions.find(s => s.pubkey === pubkey);
}

/**
 * Add or update a session in secure storage asynchronously.
 * @param pubkey The pubkey of the session.
 * @param signerPayload Optional stringified signer payload.
 */
export async function addOrUpdateStoredSession(
    pubkey: Hexpubkey,
    signerPayload?: string
): Promise<void> {
    try {
        const sessions = await loadSessionsFromStorage(); // Keep async load here for updates
        const existingIndex = sessions.findIndex(s => s.pubkey === pubkey);
        const now = Date.now();

        if (existingIndex !== -1) {
            // Update existing session
            sessions[existingIndex].lastActive = now;
            // Update signer payload if provided, otherwise keep existing or undefined
            if (signerPayload !== undefined) {
                sessions[existingIndex].signerPayload = signerPayload;
            }
        } else {
            // Add new session
            sessions.push({
                pubkey,
                signerPayload, // Will be undefined for read-only sessions initially
                lastActive: now,
            });
        }

        await saveSessionsToStorage(sessions);
    } catch (error) {
        console.error('Error adding/updating stored session:', error);
    }
}

/**
 * Remove a session from secure storage asynchronously.
 * @param pubkey The pubkey of the session to remove.
 */
export async function removeStoredSession(pubkey: Hexpubkey): Promise<void> {
    try {
        const sessions = await loadSessionsFromStorage(); // Keep async load here
        const updatedSessions = sessions.filter(s => s.pubkey !== pubkey);
        await saveSessionsToStorage(updatedSessions);
        console.log(`Removed session ${pubkey} from storage.`);
    } catch (error) {
        console.error('Error removing session from storage:', error);
    }
}