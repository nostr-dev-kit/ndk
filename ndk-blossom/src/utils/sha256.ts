import { SHA256Calculator } from "../types";

/**
 * Default implementation of SHA256 calculator
 * Uses Web Crypto API
 */
export class DefaultSHA256Calculator implements SHA256Calculator {
    /**
     * Calculate SHA256 hash of a file
     *
     * @param file File to hash
     * @returns Hash as hex string
     */
    async calculateSha256(file: File): Promise<string> {
        // Convert file to ArrayBuffer
        const buffer = await file.arrayBuffer();

        // Hash the buffer
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

        // Convert to hex string
        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
}

/**
 * Singleton instance of the default SHA256 calculator
 * Created lazily to avoid issues in non-browser environments
 */
let _defaultSHA256Calculator: DefaultSHA256Calculator | undefined;

export function getDefaultSHA256Calculator(): SHA256Calculator {
    if (!_defaultSHA256Calculator) {
        _defaultSHA256Calculator = new DefaultSHA256Calculator();
    }
    return _defaultSHA256Calculator;
}

// For backwards compatibility, export as defaultSHA256Calculator
export const defaultSHA256Calculator = {
    calculateSha256: async (file: File) => {
        return getDefaultSHA256Calculator().calculateSha256(file);
    },
} as SHA256Calculator;
