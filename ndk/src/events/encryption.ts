/**
 * Encryption and giftwrapping of events
 * Implemnents Nip04, Nip44, (TODO) Nip59 
 */
import type { NDKSigner } from "../signers";
import type { NDKUser } from "../user";
import type { NDKEvent } from "./index.js";

export type EncryptionNip = 'nip04' | 'nip44';

// some clients may wish to set a default for message encryption...
// TODO how should replies to 'nip04' encrypted messages be handled?
let defaultEncryption : EncryptionNip | undefined = undefined;
export function useEncryption(nip : EncryptionNip){
    defaultEncryption = nip;
}


export async function encrypt(
    this: NDKEvent,
    recipient?: NDKUser,
    signer?: NDKSigner,
    nip : EncryptionNip | undefined = defaultEncryption
): Promise<void> {
    let encrypted : string;
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

    // support for encrypting events via legacy `nip04`. adapted from Coracle
    if ((!nip || nip == 'nip04') && isNip04Enabled(signer)) {
        try{
            encrypted = (await signer?.encrypt(recipient, this.content, 'nip04')) as string;
        }catch{}
    }
    if ((!encrypted || nip == "nip44") && isNip44Enabled(signer)) {
            encrypted = (await signer?.encrypt(recipient, this.content, 'nip44')) as string;
    } 
    if(!encrypted) throw new Error('Failed to encrypt event.')
        this.content = encrypted
    }

export async function decrypt(this: NDKEvent, sender?: NDKUser, signer?: NDKSigner, nip: EncryptionNip | undefined = defaultEncryption): Promise<void> {
    let decrypted : string;
    if (!this.ndk) throw new Error("No NDK instance found!");
    if (!signer) {
        await this.ndk.assertSigner();
        signer = this.ndk.signer;
    }
    if (!sender) {
        sender = this.author;
    }
    // simple check for legacy `nip04` encrypted events. adapted from Coracle
    if ((!nip || nip=='nip04') && isNip04Enabled(signer) && this.content.search("?iv=")) {
        try{ 
            decrypted = (await signer?.decrypt(sender, this.content, 'nip04')) as string;
        }catch{}
    }
    if (!decrypted && isNip44Enabled(signer)) {
            decrypted = (await signer?.decrypt(sender, this.content, 'nip44')) as string;
    }
    if(!decrypted) throw new Error('Failed to decrypt event.')
    this.content = decrypted
}

async function isNip04Enabled(signer : NDKSigner){
    let enabled = await signer.encryptionEnabled();
    if(enabled.indexOf('nip04') != -1) return true;
    return false;
}

async function isNip44Enabled(signer : NDKSigner){
    let enabled = await signer.encryptionEnabled();
    if(enabled.indexOf('nip44') != -1) return true;
    return false;
}