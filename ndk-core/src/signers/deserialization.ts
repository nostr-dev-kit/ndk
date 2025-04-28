import type { NDK } from "../ndk/index.js";
import type { NDKSigner, NDKSignerPayload } from "./index.js";
import { signerRegistry } from "./registry.js";
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
    // Ensure the payload has a valid type field
    if (!parsed || typeof (parsed as any).type !== "string") {
        console.error("Failed to parse signer payload string", payloadString, new Error("Missing type field"));
        return undefined;
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
