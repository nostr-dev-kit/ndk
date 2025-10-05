import type { NDKSigner } from "@nostr-dev-kit/ndk";
import { ndkSignerFromPayload } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { SignerDeserializationError } from "../utils/errors";

/**
 * Serialize an NDKSigner for persistence across app restarts.
 * Uses NDK's built-in payload serialization format.
 */
export async function serializeSigner(signer: NDKSigner): Promise<string | undefined> {
    try {
        return signer.toPayload();
    } catch (error) {
        // Some signers may not support serialization (e.g., hardware signers)
        // Return undefined to indicate non-serializable signer
        return undefined;
    }
}

/**
 * Deserialize a signer from persisted payload.
 * Throws SignerDeserializationError for proper error propagation.
 */
export async function deserializeSigner(payload: string, ndk?: NDK): Promise<NDKSigner> {
    try {
        const signer = await ndkSignerFromPayload(payload, ndk);
        if (!signer) {
            throw new Error('NDK returned undefined signer');
        }
        return signer;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new SignerDeserializationError(`Failed to deserialize signer: ${message}`);
    }
}
