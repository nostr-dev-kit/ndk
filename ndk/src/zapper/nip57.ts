import { nip57, NostrEvent } from "nostr-tools";
import { NDKTag, NDKEvent } from "../events";
import { NDKSigner } from "../signers";
import { NDKUser } from "../user";
import { NDK } from "../ndk";
import { NDKLnUrlData } from "./ln.js";

export async function generateZapRequest(
    target: NDKEvent | NDKUser,
    ndk: NDK,
    data: NDKLnUrlData,
    pubkey: string,
    amount: number, // amount to zap in millisatoshis
    relays: string[],
    comment?: string,
    tags?: NDKTag[],
    signer?: NDKSigner
): Promise<NDKEvent | null> {
    const zapEndpoint = data.callback;
    const zapRequest = nip57.makeZapRequest({
        profile: pubkey,

        // set the event to null since nostr-tools doesn't support nip-33 zaps
        event: null,
        amount,
        comment: comment || "",
        relays: relays.slice(0, 4),
    });

    // add the event tag if it exists; this supports both 'e' and 'a' tags
    if (target instanceof NDKEvent) {
        const tags = target.referenceTags();
        const nonPTags = tags.filter((tag) => tag[0] !== "p");
        zapRequest.tags.push(...nonPTags);
    }

    zapRequest.tags.push(["lnurl", zapEndpoint]);

    const event = new NDKEvent(ndk, zapRequest as NostrEvent);
    if (tags) {
        event.tags = event.tags.concat(tags);
    }

    // make sure we only have one `p` tag
    event.tags = event.tags.filter((tag) => tag[0] !== "p");
    event.tags.push(["p", pubkey]);

    await event.sign(signer);

    return event;
}
