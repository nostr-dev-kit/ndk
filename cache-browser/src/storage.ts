import createDebug from "debug";

const debug = createDebug("ndk:cache-browser:storage");

/**
 * Adapter types supported by NDKCacheBrowser
 */
export type AdapterType = "wasm" | "dexie" | "none";

const STORAGE_KEY = "ndk-cache-adapter-preference";

/**
 * Get the previously successful adapter type from localStorage.
 * Returns null if no preference is stored or if localStorage is unavailable.
 */
export function getPreferredAdapter(): AdapterType | null {
    try {
        if (typeof localStorage === "undefined") {
            debug("localStorage not available");
            return null;
        }

        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored === "wasm" || stored === "dexie") {
            debug("Retrieved preferred adapter: %s", stored);
            return stored;
        }

        debug("No valid preference found");
        return null;
    } catch (error) {
        debug("Error reading from localStorage: %o", error);
        return null;
    }
}

/**
 * Save the successful adapter type to localStorage for future optimizations.
 */
export function setPreferredAdapter(type: AdapterType): void {
    try {
        if (typeof localStorage === "undefined") {
            debug("localStorage not available for saving preference");
            return;
        }

        localStorage.setItem(STORAGE_KEY, type);
        debug("Saved preferred adapter: %s", type);
    } catch (error) {
        debug("Error writing to localStorage: %o", error);
    }
}

/**
 * Clear the adapter preference from localStorage.
 * Useful for testing or when you want to force re-detection.
 */
export function clearPreferredAdapter(): void {
    try {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.removeItem(STORAGE_KEY);
        debug("Cleared adapter preference");
    } catch (error) {
        debug("Error clearing localStorage: %o", error);
    }
}
