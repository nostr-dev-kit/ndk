import NDKEvent from ".";
import { NDKSigner } from "../signers";
import NDKUser from "../user";

export async function encrypt(
    this: NDKEvent,
    recipient?: NDKUser,
    signer?: NDKSigner
) {
    if (!signer) {
        if (!this.ndk) {
            throw new Error("No signer available");
        }

        await this.ndk.assertSigner();

        signer = this.ndk.signer!;
    }

    if (!recipient) {
        const pTags = this.getMatchingTags("p");

        if (pTags.length !== 1) {
            throw new Error(
                "No recipient could be determined and no explicit recipient was provided"
            );
        }

        recipient = new NDKUser({ hexpubkey: pTags[0][1] });
        recipient.ndk = this.ndk;
    }

    this.content = await signer.encrypt(recipient, this.content);
}

export async function decrypt(
    this: NDKEvent,
    sender?: NDKUser,
    signer?: NDKSigner
) {
    if (!signer) {
        if (!this.ndk) {
            throw new Error("No signer available");
        }

        await this.ndk.assertSigner();

        signer = this.ndk.signer!;
    }

    if (!sender) {
        sender = this.author;
    }

    this.content = await signer.decrypt(sender, this.content);
}
