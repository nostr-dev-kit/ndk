import type { NDK } from "../ndk/index.js";
import type { NDKSigner, NDKSignerStatic, NDKSignerPayload } from "./index.js";
import { NDKPrivateKeySigner } from "./private-key/index.js";
import { NDKNip07Signer } from "./nip07/index.js";
import { NDKNip46Signer } from "./nip46/index.js";

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
export async function ndkSignerFromPayload(payloadString: string, ndk?: NDK): Promise<NDKSigner | undefined> {
    let parsed: NDKSignerPayload;

    try {
        parsed = JSON.parse(payloadString);
    } catch (e) {
        console.error("Failed to parse signer payload string", payloadString, e);
        return undefined;
    }

    if (!parsed || typeof parsed !== "object" || !parsed.type) {
        console.error("Invalid signer payload format", parsed);
        return undefined;
    }

    const SignerClass = signerRegistry.get(parsed.type);

    if (!SignerClass) {
        console.warn(`Unknown signer type encountered: ${parsed.type}`);
        return undefined;
    }

    try {
        // Pass the full payload string to the static fromPayload method
        return await SignerClass.fromPayload(payloadString, ndk);
    } catch (e) {
        console.error(`Failed to deserialize signer type ${parsed.type}`, e);
        return undefined;
    }
}
