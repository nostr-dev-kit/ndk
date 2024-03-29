import type { NDKSigner } from "../signers";
import type { NDKUser } from "../user";
import type { NDKEvent } from "./index.js";

export async function encrypt(
    this: NDKEvent,
    recipient?: NDKUser,
    signer?: NDKSigner
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

    this.content = (await signer?.encrypt(recipient, this.content)) as string;
}

export async function decrypt(this: NDKEvent, sender?: NDKUser, signer?: NDKSigner): Promise<void> {
    if (!this.ndk) throw new Error("No NDK instance found!");
    if (!signer) {
        await this.ndk.assertSigner();
        signer = this.ndk.signer;
    }
    if (!sender) {
        sender = this.author;
    }

    this.content = (await signer?.decrypt(sender, this.content)) as string;
}
