import { DEFAULT_ENCRYPTION_SCHEME, ENCRYPTION_SCHEMES, type NDKSigner } from "../signers";
import type { NDKUser } from "../user";
import type { NDKEvent } from "./index.js";

export async function encrypt(
    this: NDKEvent,
    recipient?: NDKUser,
    signer?: NDKSigner,
    type: ENCRYPTION_SCHEMES = DEFAULT_ENCRYPTION_SCHEME
): Promise<void> {
    if (!this.ndk) throw new Error("No NDK instance found!");
    if (!signer) {
        await this.ndk.assertSigner();
        signer = this.ndk.signer;
    }
    if (!recipient) {
        const pTags = this.getMatchingTags("p");

        if (pTags.length !== 1) {
            throw new Error(
                "No recipient could be determined and no explicit recipient was provided"
            );
        }

        recipient = this.ndk.getUser({ pubkey: pTags[0][1] });
    }

    this.content = (await signer?.encrypt(recipient, this.content, type)) as string;
}

export async function decrypt(
    this: NDKEvent,
    sender?: NDKUser,
    signer?: NDKSigner,
    type?: ENCRYPTION_SCHEMES
): Promise<void> {
    if (!this.ndk) throw new Error("No NDK instance found!");
    if (!signer) {
        await this.ndk.assertSigner();
        signer = this.ndk.signer;
    }
    if (!sender) {
        sender = this.author;
    }

    // if type is not set, check if this looks like nip04
    if (!type) {
        type = this.content.match(/\?iv=/) ? 'nip04' : 'nip44';
    }

    this.content = (await signer?.decrypt(sender, this.content, type)) as string;
}
