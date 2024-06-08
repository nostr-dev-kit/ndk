/**
 * Encryption and giftwrapping of events
 * Implemnents Nip04, Nip44, Nip59 
 */
import type { NDKSigner } from "../signers";
import { NDKUser } from "../user";
import { NDKEvent, NostrEvent } from "./index.js";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { VerifiedEvent, getEventHash, verifiedSymbol } from "nostr-tools";


// NIP04 && NIP44

export type EncryptionNip = 'nip04' | 'nip44';
export type EncryptionMethod = 'encrypt' | 'decrypt'

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
    let encrypted : string | undefined;
    if (!this.ndk) throw new Error("No NDK instance found!");
    if (!signer) {
        await this.ndk.assertSigner();
        signer = this.ndk.signer;
    }
    if(!signer) throw new Error('no NDK signer');
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
    if ((!nip || nip == 'nip04') && await isEncryptionEnabled(signer, 'nip04')) {
        try{
            encrypted = (await signer?.encrypt(recipient, this.content, 'nip04')) as string;
        }catch{}
    }
    if ((!encrypted || nip == "nip44") && await isEncryptionEnabled(signer, 'nip44')) {
            encrypted = (await signer?.encrypt(recipient, this.content, 'nip44')) as string;
    } 
    if(!encrypted) throw new Error('Failed to encrypt event.')
        this.content = encrypted
    }

export async function decrypt(this: NDKEvent, sender?: NDKUser, signer?: NDKSigner, nip: EncryptionNip | undefined = defaultEncryption): Promise<void> {
    let decrypted : string | undefined;
    if (!this.ndk) throw new Error("No NDK instance found!");
    if (!signer) {
        await this.ndk.assertSigner();
        signer = this.ndk.signer;
    }
    if(!signer) throw new Error('no NDK signer');
    if (!sender) {
        sender = this.author;
    }
    // simple check for legacy `nip04` encrypted events. adapted from Coracle
    if ((!nip || nip=='nip04') && await isEncryptionEnabled(signer, 'nip04') && this.content.search("?iv=")) {
        try{ 
            decrypted = (await signer?.decrypt(sender, this.content, 'nip04')) as string;
        }catch{}
    }
    if (!decrypted && await isEncryptionEnabled(signer, 'nip44')) {
            decrypted = (await signer?.decrypt(sender, this.content, 'nip44')) as string;
    }
    if(!decrypted) throw new Error('Failed to decrypt event.')
    this.content = decrypted
}

async function isEncryptionEnabled(signer : NDKSigner, nip? : EncryptionNip){
    if(!signer.encryptionEnabled) return false;
    if(!nip) return true;
    return Boolean(await signer.encryptionEnabled(nip));
}


// NIP 59 - adapted from Coracle

export type GiftWrapParams = {
    encryptionNip?: EncryptionNip
    rumorKind?: number;
    wrapKind?: 1059 | 1060
    wrapTags?: string[][]
}

/**
 * Instantiate a new (Nip59 gift wrapped) NDKEvent from any NDKevent
 * @param this 
 * @param recipient 
 * @param signer 
 * @param params 
 * @returns 
 */
export async function giftWrap(this:NDKEvent, recipient: NDKUser, signer?:NDKSigner, params:GiftWrapParams = {}) : Promise<NDKEvent>{
  params.encryptionNip = params.encryptionNip || 'nip44';
  if(!signer){
      if(!this.ndk) 
          throw new Error('no signer available for giftWrap')
      signer = this.ndk.signer;
  }
  if(!signer) 
      throw new Error('no signer')
  if(!signer.encryptionEnabled || !signer.encryptionEnabled(params.encryptionNip)) 
      throw new Error('signer is not able to giftWrap')
  const rumor = getRumorEvent(this, params?.rumorKind)
  const seal = await getSealEvent(rumor, recipient, signer, params.encryptionNip);
  const wrap = await getWrapEvent(seal, recipient, params);
  return new NDKEvent(this.ndk, wrap);
}

/**
 * Instantiate a new (Nip59 un-wrapped rumor) NDKEvent from any gift wrapped NDKevent
 * @param this 
 */
export async function giftUnwrap(this:NDKEvent, sender?:NDKUser, signer?:NDKSigner, nip:EncryptionNip = 'nip44') : Promise<NDKEvent | null>{
    sender = sender || new NDKUser({pubkey:this.pubkey})
    if(!signer){
        if(!this.ndk) 
            throw new Error('no signer available for giftUnwrap')
        signer = this.ndk.signer;
    }
    if(!signer) 
        throw new Error('no signer')
    try {

      const seal = JSON.parse(await signer.decrypt(sender, this.content, nip));
      if (!seal) throw new Error("Failed to decrypt wrapper")

      const rumor = JSON.parse(await signer.decrypt(sender, seal.content, nip))
      if (!rumor) throw new Error("Failed to decrypt seal")

      if (seal.pubkey === rumor.pubkey) {
        return new NDKEvent(this.ndk, rumor as NostrEvent)
      }
    } catch (e) {
        console.log(e)
    }
    return null
  }



function getRumorEvent(event:NDKEvent, kind?:number):NDKEvent{
    let rumor = event.rawEvent();
    rumor.kind = kind || rumor.kind  || 1;
    rumor.sig = undefined;
    rumor.id = getEventHash(rumor as any);
    return new NDKEvent(event.ndk, rumor)
}

async function getSealEvent(rumor : NDKEvent, recipient : NDKUser, signer:NDKSigner, nip:EncryptionNip = 'nip44') : Promise<VerifiedEvent>{
    const content = await signer.encrypt(recipient, JSON.stringify(rumor), nip);
    let seal : any = {
        kind: 13,
        created_at: aproximateNow(5),
        tags: [],
        content ,
        pubkey : rumor.pubkey
    }
    seal.id = getEventHash(seal),
    seal.sig = await signer.sign(seal);
    seal[verifiedSymbol] = true
    return seal;
}
  
async function getWrapEvent(sealed:VerifiedEvent, recipient:NDKUser, params? : GiftWrapParams) : Promise<VerifiedEvent>{
    const signer = NDKPrivateKeySigner.generate();
    const content = await signer.encrypt(recipient, JSON.stringify(sealed), params?.encryptionNip || 'nip44')
    const pubkey = (await signer.user()).pubkey
    let wrap : any = {
        kind : params?.wrapKind || 1059,
        created_at: aproximateNow(5),
        tags: (params?.wrapTags || []).concat([["p", recipient.pubkey]]),
        content,
        pubkey,
    }
    wrap.id = getEventHash(wrap);
    wrap.sig = await signer.sign(wrap);
    wrap[verifiedSymbol] = true
    return wrap;
}

function aproximateNow(drift = 0){
    return Math.round(Date.now() / 1000 - Math.random() * Math.pow(10, drift))
}
