import type { NDKSigner, NDKSignerStatic } from "./index.js";

/**
 * Registry to hold signer types and their corresponding deserialization functions.
 * Signer packages (like ndk-mobile for NIP-55) can add their types here.
 */
export const signerRegistry: Map<string, NDKSignerStatic<NDKSigner>> = new Map();

/**
 * Register a signer in the registry
 */
export function registerSigner(type: string, signerClass: NDKSignerStatic<NDKSigner>): void {
    signerRegistry.set(type, signerClass);
}
