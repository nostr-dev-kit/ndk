import type { NDK } from "../ndk/index.js";
import type { NDKSigner, NDKSignerPayload, NDKSignerStatic } from "./index.js";
import { NDKNip07Signer } from "./nip07/index.js";
import { NDKNip46Signer } from "./nip46/index.js";
import { NDKPrivateKeySigner } from "./private-key/index.js";

/**
 * Registry to hold signer types and their corresponding deserialization functions.
 * Signer packages (like ndk-mobile for NIP-55) can add their types here.
 */
export const signerRegistry: Map<string, NDKSignerStatic<NDKSigner>> = new Map();

// Register built-in signers
signerRegistry.set("private-key", NDKPrivateKeySigner);
signerRegistry.set("nip07", NDKNip07Signer);
signerRegistry.set("nip46", NDKNip46Signer);

/**
 * Deserializes a signer from a payload string using the signer registry.
 * @param payloadString The JSON string obtained from a signer's toPayload().
 * @param ndk Optional NDK instance, required by some signers.
 * @returns An instance of the specific signer class, or undefined if the type is unknown.
 */
export async function ndkSignerFromPayload(payloadString: string, ndk?: NDK): Promise<NDKSigner> {
    let parsed: NDKSignerPayload;

    try {
        parsed = JSON.parse(payloadString);
    } catch (e) {
        throw new Error(`Failed to parse signer payload: ${e instanceof Error ? e.message : String(e)}`);
    }

    const SignerClass = signerRegistry.get(parsed.type);

    if (!SignerClass) {
        throw new Error(`Unknown signer type: ${parsed.type}`);
    }

    try {
        // Pass the full payload string to the static fromPayload method
        return await SignerClass.fromPayload(payloadString, ndk);
    } catch (e) {
        // Preserve the original error but add context about which signer type failed
        const errorMsg = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to deserialize signer type ${parsed.type}: ${errorMsg}`);
    }
}
