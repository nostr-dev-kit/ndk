import { nip19 } from "nostr-tools";
import type { ProfilePointer } from "../user/index.js";
import type { NDK } from ".";

/**
 *
 * @param this
 * @param entity
 * @returns
 */
export function getEntity(this: NDK, entity: string) {
    try {
        const decoded = nip19.decode(entity);

        if (decoded.type === "npub") return npub(this, decoded.data);
        if (decoded.type === "nprofile") return nprofile(this, decoded.data);
        return decoded;
    } catch (_e) {
        return null;
    }
}

function npub(ndk: NDK, pubkey: string) {
    return ndk.getUser({ pubkey });
}

function nprofile(ndk: NDK, profile: ProfilePointer) {
    const user = ndk.getUser({ pubkey: profile.pubkey });
    if (profile.relays) user.relayUrls = profile.relays;
    return user;
}
