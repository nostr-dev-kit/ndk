import type { NDKSigner } from "@nostr-dev-kit/ndk";
import type { NDKSession, SerializedSession } from "../types";
import { serializeSigner } from "./signer";

/**
 * Serialize a session for storage
 */
export async function serializeSession(session: NDKSession, signer?: NDKSigner): Promise<SerializedSession> {
    return {
        pubkey: session.pubkey,
        signerPayload: signer ? await serializeSigner(signer) : undefined,
        profile: session.profile,
        followSet: session.followSet ? Array.from(session.followSet) : undefined,
        muteSet: session.muteSet ? Array.from(session.muteSet.entries()) : undefined,
        mutedWords: session.mutedWords ? Array.from(session.mutedWords) : undefined,
        blockedRelays: session.blockedRelays ? Array.from(session.blockedRelays) : undefined,
        relayList: session.relayList ? Array.from(session.relayList.entries()) : undefined,
        lastActive: session.lastActive,
    };
}
