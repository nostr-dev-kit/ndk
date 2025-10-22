/**
 * Validates if a string is a valid 64-character hexadecimal string.
 * Used for pubkeys and event IDs.
 *
 * @param value - The string to validate
 * @returns true if the string is exactly 64 hex characters, false otherwise
 */
export function isValidHex64(value: string): boolean {
    if (typeof value !== "string" || value.length !== 64) {
        return false;
    }

    for (let i = 0; i < 64; i++) {
        const c = value.charCodeAt(i);
        // 0-9: 48-57, a-f: 97-102, A-F: 65-70
        if (!((c >= 48 && c <= 57) || (c >= 97 && c <= 102) || (c >= 65 && c <= 70))) {
            return false;
        }
    }

    return true;
}

/**
 * Validates if a string is a valid nostr pubkey (64-character hex string).
 *
 * @param pubkey - The string to validate
 * @returns true if the string is a valid pubkey, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidPubkey(pubkey)) {
 *     // Safe to use
 * }
 * ```
 */
export function isValidPubkey(pubkey: string): boolean {
    return isValidHex64(pubkey);
}

/**
 * Validates if a string is a valid event ID (64-character hex string).
 *
 * @param id - The string to validate
 * @returns true if the string is a valid event ID, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidEventId(eventId)) {
 *     // Safe to use
 * }
 * ```
 */
export function isValidEventId(id: string): boolean {
    return isValidHex64(id);
}

/**
 * Check if a string is a NIP-05 identifier (contains a dot indicating a domain).
 * This performs a simple format check, not full NIP-05 validation.
 *
 * @param input - String to check
 * @returns true if the input appears to be a NIP-05 identifier
 *
 * @example
 * ```typescript
 * isValidNip05("user@domain.com") // true
 * isValidNip05("domain.com") // true
 * isValidNip05("npub1...") // false
 * ```
 */
export function isValidNip05(input: string): boolean {
    if (typeof input !== "string") {
        return false;
    }

    // Simple check: must contain a dot (domain indicator)
    // This is a fast format check, actual NIP-05 validation happens during resolution
    for (let i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) === 46) { // 46 is '.'
            return true;
        }
    }

    return false;
}
