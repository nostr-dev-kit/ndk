import { Hexpubkey } from "@nostr-dev-kit/ndk";
import { StoredSession } from "../hooks/use-ndk-session-monitor";

// Storage keys
const SESSIONS_STORE_KEY = "ndk-saved-sessions";
const ACTIVE_PUBKEY_STORE_KEY = "ndk-active-pubkey";

/**
 * Interface for a synchronous storage adapter for NDK session management.
 * This allows applications to provide their own storage implementations
 * (e.g., localStorage for web, SecureStore for mobile).
 */
export interface NDKSessionStorageAdapter {
    /**
     * Get an item from storage by key.
     * @param key The key to retrieve.
     * @returns The stored value or null if not found.
     */
    getItem(key: string): string | null;

    /**
     * Set an item in storage.
     * @param key The key to store.
     * @param value The value to store.
     */
    setItem(key: string, value: string): void;

    /**
     * Delete an item from storage.
     * @param key The key to delete.
     */
    deleteItem(key: string): void;
}

/**
 * Default implementation of NDKSessionStorageAdapter using browser localStorage.
 */
export class NDKSessionLocalStorage implements NDKSessionStorageAdapter {
    /**
     * Get an item from localStorage.
     * @param key The key to retrieve.
     * @returns The stored value or null if not found.
     */
    getItem(key: string): string | null {
        if (typeof localStorage === "undefined") {
            console.warn("localStorage is not available in this environment");
            return null;
        }
        return localStorage.getItem(key);
    }

    /**
     * Set an item in localStorage.
     * @param key The key to store.
     * @param value The value to store.
     */
    setItem(key: string, value: string): void {
        if (typeof localStorage === "undefined") {
            console.warn("localStorage is not available in this environment");
            return;
        }
        localStorage.setItem(key, value);
    }

    /**
     * Delete an item from localStorage.
     * @param key The key to delete.
     */
    deleteItem(key: string): void {
        if (typeof localStorage === "undefined") {
            console.warn("localStorage is not available in this environment");
            return;
        }
        localStorage.removeItem(key);
    }
}

/**
 * Load sessions from storage.
 * @param storage The storage adapter to use
 * @returns An array of stored sessions
 */
export function loadSessionsFromStorage(storage: NDKSessionStorageAdapter): StoredSession[] {
    try {
        const sessionsJson = storage.getItem(SESSIONS_STORE_KEY);
        if (!sessionsJson) return [];

        const sessions = JSON.parse(sessionsJson) as StoredSession[];
        return sessions;
    } catch (error) {
        console.error("[NDK] Error loading sessions from storage:", error);
        return [];
    }
}

/**
 * Save sessions to storage.
 * @param storage The storage adapter to use
 * @param sessions An array of sessions to save
 */
export function saveSessionsToStorage(storage: NDKSessionStorageAdapter, sessions: StoredSession[]): void {
    try {
        storage.setItem(SESSIONS_STORE_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error("[NDK] Error saving sessions to storage:", error);
    }
}

/**
 * Add or update a session in storage.
 * @param storage The storage adapter to use
 * @param pubkey The pubkey of the session
 * @param signerPayload Optional stringified signer payload
 */
export async function addOrUpdateStoredSession(
    storage: NDKSessionStorageAdapter,
    pubkey: Hexpubkey,
    signerPayload?: string,
): Promise<void> {
    try {
        const sessions = loadSessionsFromStorage(storage);
        const existingIndex = sessions.findIndex((s) => s.pubkey === pubkey);

        if (existingIndex !== -1) {
            // Update existing session
            // Update signer payload if provided, otherwise keep existing or undefined
            if (signerPayload !== undefined) {
                sessions[existingIndex].signerPayload = signerPayload;
            }
        } else {
            // Add new session
            sessions.push({
                pubkey,
                signerPayload, // Will be undefined for read-only sessions initially
            });
        }

        saveSessionsToStorage(storage, sessions);
    } catch (error) {
        console.error("[NDK] Error adding/updating stored session:", error);
    }
}

/**
 * Remove a session from storage.
 * @param storage The storage adapter to use
 * @param pubkey The pubkey of the session to remove
 */
export async function removeStoredSession(storage: NDKSessionStorageAdapter, pubkey: Hexpubkey): Promise<void> {
    try {
        const sessions = loadSessionsFromStorage(storage);
        const updatedSessions = sessions.filter((s) => s.pubkey !== pubkey);
        saveSessionsToStorage(storage, updatedSessions);
    } catch (error) {
        console.error("[NDK] Error removing session from storage:", error);
    }
}

/**
 * Get the active pubkey from storage.
 * @param storage The storage adapter to use
 * @returns The active pubkey or undefined if not set
 */
export function getActivePubkey(storage: NDKSessionStorageAdapter): Hexpubkey | undefined {
    try {
        const activePubkey = storage.getItem(ACTIVE_PUBKEY_STORE_KEY);
        return activePubkey || undefined;
    } catch (error) {
        console.error("[NDK] Error getting active pubkey from storage:", error);
        return undefined;
    }
}

/**
 * Set the active pubkey in storage.
 * @param storage The storage adapter to use
 * @param pubkey The pubkey to set as active
 */
export function storeActivePubkey(storage: NDKSessionStorageAdapter, pubkey: Hexpubkey): void {
    try {
        storage.setItem(ACTIVE_PUBKEY_STORE_KEY, pubkey);
    } catch (error) {
        console.error("[NDK] Error setting active pubkey in storage:", error);
    }
}

/**
 * Clear the active pubkey from storage.
 * @param storage The storage adapter to use
 */
export async function clearActivePubkey(storage: NDKSessionStorageAdapter): Promise<void> {
    try {
        storage.deleteItem(ACTIVE_PUBKEY_STORE_KEY);
    } catch (error) {
        console.error("[NDK] Error clearing active pubkey from storage:", error);
    }
}
