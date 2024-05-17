import type { NDKSigner } from "../signers/index.js";
import type { NostrEvent } from "./index.js";
import { NDKEvent } from "./index.js";
import { NDKKind } from "./kinds/index.js";

/**
 * NIP-18 reposting event.
 *
 * @param publish Whether to publish the reposted event automatically
 * @param signer The signer to use for signing the reposted event
 * @returns The reposted event
 */
export async function repost(
    this: NDKEvent,
    publish = true,
    signer?: NDKSigner
): Promise<NDKEvent> {
    if (!signer && publish) {
        if (!this.ndk) throw new Error("No NDK instance found");
        this.ndk.assertSigner();
        signer = this.ndk.signer;
    }

    const e = new NDKEvent(this.ndk, {
        kind: getKind(this),
        content: "",
    } as NostrEvent);
    e.tag(this);

    if (e.kind === NDKKind.GenericRepost) {
        e.tags.push(["k", `${this.kind}`]);
    } else {
        e.content = JSON.stringify(this.rawEvent());
    }

    if (signer) await e.sign(signer);
    if (publish) await e.publish();

    return e;
}

function getKind(event: NDKEvent): NDKKind {
    if (event.kind === 1) {
        return NDKKind.Repost;
    }

    return NDKKind.GenericRepost;
}
