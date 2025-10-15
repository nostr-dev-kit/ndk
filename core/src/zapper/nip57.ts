import type { NDKTag } from "../events";
import { NDKEvent } from "../events";
import type { NDK } from "../ndk";
import type { NDKSigner } from "../signers";
import type { NDKUser } from "../user";
import type { NDKLnUrlData } from "./ln.js";

/**
 * Generates a NIP-57 zap request (kind 9734)
 *
 * @param target - The user or event being zapped
 * @param ndk - NDK instance
 * @param data - LNURL data containing callback endpoint
 * @param pubkey - Recipient's pubkey
 * @param amount - Amount to zap in millisatoshis
 * @param relays - Relay URLs for the zap receipt
 * @param comment - Optional comment for the zap
 * @param tags - Additional tags to include
 * @param signer - Signer to use for signing the zap request
 * @returns The signed zap request event
 */
export async function generateZapRequest(
    target: NDKEvent | NDKUser,
    ndk: NDK,
    data: NDKLnUrlData,
    pubkey: string,
    amount: number, // amount to zap in millisatoshis
    relays: string[],
    comment?: string,
    tags?: NDKTag[],
    signer?: NDKSigner,
): Promise<NDKEvent | null> {
    const zapEndpoint = data.callback;

    // Create the base zap request event (kind 9734)
    const event = new NDKEvent(ndk);
    event.kind = 9734;
    event.content = comment || "";
    event.tags = [
        ["relays", ...relays.slice(0, 4)],
        ["amount", amount.toString()],
        ["lnurl", zapEndpoint],
        ["p", pubkey],
    ];

    // Add event reference tags if target is an event
    // This supports both regular events (e tag) and addressable events (a tag)
    if (target instanceof NDKEvent) {
        const referenceTags = target.referenceTags();
        const nonPTags = referenceTags.filter((tag) => tag[0] !== "p");
        event.tags.push(...nonPTags);

        // Add k tag with the kind of the target event (NIP-57)
        if (target.kind !== undefined) {
            event.tags.push(["k", target.kind.toString()]);
        }
    }

    // Add any additional tags
    if (tags) {
        event.tags = event.tags.concat(tags);
    }

    const eTaggedEvents = new Set<string>();
    const aTaggedEvents = new Set<string>();

    for (const tag of event.tags) {
        if (tag[0] === "e") {
            eTaggedEvents.add(tag[1]);
        } else if (tag[0] === "a") {
            aTaggedEvents.add(tag[1]);
        }
    }

    if (eTaggedEvents.size > 1) throw new Error("Only one e-tag is allowed");
    if (aTaggedEvents.size > 1) throw new Error("Only one a-tag is allowed");

    // make sure we only have one `p` tag
    event.tags = event.tags.filter((tag) => tag[0] !== "p");
    event.tags.push(["p", pubkey]);

    await event.sign(signer);

    return event;
}
