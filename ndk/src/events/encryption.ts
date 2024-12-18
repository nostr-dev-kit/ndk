/**
 * Encryption and gift-wrapping of events
 * Implements Nip04, Nip44, Nip59 
 */
import type { NDKSigner } from "../signers";
import { NDKUser } from "../user";
import { NDKEvent } from "./index.js";

// NIP04 && NIP44

export type EncryptionNip = 'nip04' | 'nip44';
export type EncryptionMethod = 'encrypt' | 'decrypt'

// some clients may wish to set a default for message encryption...
let defaultEncryption : EncryptionNip | undefined = undefined;
export function useEncryption(nip: EncryptionNip) {
    defaultEncryption = nip;
}

export async function encrypt(
    this: NDKEvent,
    recipient?: NDKUser,
    signer?: NDKSigner,
    nip: EncryptionNip | undefined = defaultEncryption
): Promise<void> {
    let encrypted : string | undefined;
    if (!this.ndk) throw new Error("No NDK instance found!");
    if (!signer) {
        this.ndk.assertSigner();
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

    // support for encrypting events via legacy `nip04`. adapted from Coracle
    if ((!nip || nip == 'nip04') && await isEncryptionEnabled(signer!, 'nip04')) {
        encrypted = (await signer?.encrypt(recipient, this.content, 'nip04')) as string;
    }
    if ((!encrypted || nip == "nip44") && await isEncryptionEnabled(signer!, 'nip44')) {
        encrypted = (await signer?.encrypt(recipient, this.content, 'nip44')) as string;
    } 
    if(!encrypted) throw new Error('Failed to encrypt event.');
    this.content = encrypted;
}

export async function decrypt(this: NDKEvent, sender?: NDKUser, signer?: NDKSigner, nip: EncryptionNip | undefined = defaultEncryption): Promise<void> {
    let decrypted : string | undefined;
    if (!this.ndk) throw new Error("No NDK instance found!");
    if (!signer) {
        this.ndk.assertSigner();
        signer = this.ndk.signer;
    }
    if(!signer) throw new Error('no NDK signer');
    if (!sender) {
        sender = this.author;
    }
    // simple check for legacy `nip04` encrypted events. adapted from Coracle
    if ((!nip || nip=='nip04' || this.kind == 4) && await isEncryptionEnabled(signer, 'nip04') && this.content.search("\\?iv=")) {
        decrypted = (await signer?.decrypt(sender, this.content, 'nip04')) as string;
    }
    if (!decrypted && await isEncryptionEnabled(signer, 'nip44')) {
        decrypted = (await signer?.decrypt(sender, this.content, 'nip44')) as string;
    }
    if(!decrypted) throw new Error('Failed to decrypt event.');
    this.content = decrypted;
}

async function isEncryptionEnabled(signer : NDKSigner, nip?: EncryptionNip): Promise<Boolean> {
    if(!signer.encryptionEnabled) return false;
    if(!nip) return true;
    return Boolean(await signer.encryptionEnabled(nip));
}