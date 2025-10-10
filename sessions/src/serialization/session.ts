import type { NDKSigner } from "@nostr-dev-kit/ndk";
import type { NDKSession, SerializedSession } from "../types";
import { serializeSigner } from "./signer";

/**
 * Serialize a session for storage
 * Only persists identity and signer - all data comes from NDK cache
 */
export async function serializeSession(session: NDKSession, signer?: NDKSigner): Promise<SerializedSession> {
    return {
        pubkey: session.pubkey,
        signerPayload: signer ? await serializeSigner(signer) : undefined,
        lastActive: session.lastActive,
    };
}
