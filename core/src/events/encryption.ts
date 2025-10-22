import type { NDKSigner } from "../signers";
/**
 * Encryption and gift-wrapping of events
 * Implements Nip04, Nip44, Nip59
 */
import type { NDKEncryptionScheme } from "../types";
import type { NDKUser } from "../user";
import type { NDKEvent } from "./index.js";

export type EncryptionMethod = "encrypt" | "decrypt";

export async function encrypt(
    this: NDKEvent,
    recipient?: NDKUser,
    signer?: NDKSigner,
    scheme: NDKEncryptionScheme = "nip44",
): Promise<void> {
    let encrypted: string | undefined;
    if (!this.ndk) throw new Error("No NDK instance found!");
    let currentSigner = signer;
    if (!currentSigner) {
        this.ndk.assertSigner();
        currentSigner = this.ndk.signer;
    }
    if (!currentSigner) throw new Error("no NDK signer");

    const currentRecipient =
        recipient ||
        (() => {
            const pTags = this.getMatchingTags("p");
            if (pTags.length !== 1) {
                throw new Error("No recipient could be determined and no explicit recipient was provided");
            }
            return this.ndk.getUser({ pubkey: pTags[0][1] });
        })();

    if (scheme === "nip44" && (await isEncryptionEnabled(currentSigner, "nip44"))) {
        encrypted = (await currentSigner.encrypt(currentRecipient, this.content, "nip44")) as string;
    }

    // support for encrypting events via legacy `nip04`. adapted from Coracle
    if ((!encrypted || scheme === "nip04") && (await isEncryptionEnabled(currentSigner, "nip04"))) {
        encrypted = (await currentSigner.encrypt(currentRecipient, this.content, "nip04")) as string;
    }

    if (!encrypted) throw new Error("Failed to encrypt event.");
    this.content = encrypted;
}

export async function decrypt(
    this: NDKEvent,
    sender?: NDKUser,
    signer?: NDKSigner,
    scheme?: NDKEncryptionScheme,
): Promise<void> {
    // Check if we have this decrypted event in cache
    if (this.ndk?.cacheAdapter?.getDecryptedEvent) {
        const cachedEvent = await this.ndk.cacheAdapter.getDecryptedEvent(this.id);

        // If we found a cached decrypted event, use its content
        if (cachedEvent) {
            this.content = cachedEvent.content;
            return;
        }
    }

    let decrypted: string | undefined;
    if (!this.ndk) throw new Error("No NDK instance found!");
    let currentSigner = signer;
    if (!currentSigner) {
        this.ndk.assertSigner();
        currentSigner = this.ndk.signer;
    }
    if (!currentSigner) throw new Error("no NDK signer");

    const currentSender = sender || this.author;
    if (!currentSender) throw new Error("No sender provided and no author available");
    const currentScheme = scheme || (this.content.match(/\\?iv=/) ? "nip04" : "nip44");

    // simple check for legacy `nip04` encrypted events. adapted from Coracle
    if (
        (currentScheme === "nip04" || this.kind === 4) &&
        (await isEncryptionEnabled(currentSigner, "nip04")) &&
        this.content.search("\\?iv=")
    ) {
        decrypted = (await currentSigner.decrypt(currentSender, this.content, "nip04")) as string;
    }
    if (!decrypted && currentScheme === "nip44" && (await isEncryptionEnabled(currentSigner, "nip44"))) {
        decrypted = (await currentSigner.decrypt(currentSender, this.content, "nip44")) as string;
    }
    if (!decrypted) throw new Error("Failed to decrypt event.");

    this.content = decrypted;

    // Cache the decrypted event if we have a cache adapter that supports it
    // For regular encrypted events (not gift-wrapped), the event ID itself is the cache key
    if (this.ndk?.cacheAdapter?.addDecryptedEvent) {
        this.ndk.cacheAdapter.addDecryptedEvent(this.id, this);
    }
}

async function isEncryptionEnabled(signer: NDKSigner, scheme?: NDKEncryptionScheme): Promise<boolean> {
    if (!signer.encryptionEnabled) return false;
    if (!scheme) return true;
    return Boolean(await signer.encryptionEnabled(scheme));
}
