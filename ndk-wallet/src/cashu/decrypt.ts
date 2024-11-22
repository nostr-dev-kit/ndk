import { NDKEvent } from "@nostr-dev-kit/ndk";
import createDebug from "debug";

const debug = createDebug("ndk-wallet:cashu:decrypt");

/**
 * Decrypts an NDKEvent using nip44, and if that fails, using nip04.
 */
export async function decrypt(event: NDKEvent) {
    try {
        await event.decrypt(undefined, undefined, "nip44");
        return;
    } catch (e) {
        debug("unable to decrypt with nip44, attempting with nip04", e);
        await event.decrypt(undefined, undefined, "nip04");
        debug("✅ decrypted with nip04", event.id);
    }
}
