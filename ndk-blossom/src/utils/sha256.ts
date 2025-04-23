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
 */
export const defaultSHA256Calculator = new DefaultSHA256Calculator();
