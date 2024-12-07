import { NDKEvent, NostrEvent } from "./index.js";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { VerifiedEvent, getEventHash, verifiedSymbol } from "nostr-tools";
import { EncryptionNip } from "./encryption.js";
import { NDKUser } from "../user/index.js";
import { NDKSigner } from "../signers/index.js";
import { NDKKind } from "./kinds/index.js";

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
 * Instantiate a new (Nip59 un-wrapped rumor) NDKEvent from any gift wrapped NDKEvent
 * @param this 
 */
export async function giftUnwrap(this:NDKEvent, sender?:NDKUser, signer?:NDKSigner, nip:EncryptionNip = 'nip44'): Promise<NDKEvent> {
    sender = sender || new NDKUser({pubkey:this.pubkey})
    if(!signer){
        if(!this.ndk) 
            throw new Error('no signer available for giftUnwrap')
        signer = this.ndk.signer;
    }
    if(!signer) 
        throw new Error('no signer')
    try {
      const seal = JSON.parse(await signer.decrypt(sender, this.content, nip)) as NostrEvent;
      if (!seal) throw new Error("Failed to decrypt wrapper")

      const rumorSender = new NDKUser({pubkey: seal.pubkey});
      const rumor = JSON.parse(await signer.decrypt(rumorSender, seal.content, nip))
      if (!rumor) throw new Error("Failed to decrypt seal")

      if (seal.pubkey === rumor.pubkey) {
        return new NDKEvent(this.ndk, rumor as NostrEvent)
      } else {
        return Promise.reject("Invalid GiftWrap, sender validation failed!");
      }
    } catch (e) {
        console.log(e);
        return Promise.reject("Got error unwrapping event! See console log.");
    }
  }

function getRumorEvent(event:NDKEvent, kind?:number): NostrEvent{
    let rumor = event.rawEvent();
    rumor.kind = kind || rumor.kind  || NDKKind.PrivateDirectMessage;
    rumor.sig = undefined;
    rumor.id = getEventHash(rumor as any);
    return rumor;
}

async function getSealEvent(rumor : NostrEvent, recipient : NDKUser, signer:NDKSigner, nip:EncryptionNip = 'nip44'): Promise<VerifiedEvent>{
    const content = await signer.encrypt(recipient, JSON.stringify(rumor), nip);
    let seal : any = {
        kind: NDKKind.GiftWrapSeal,
        created_at: approximateNow(5),
        tags: [],
        content ,
        pubkey : rumor.pubkey
    }
    seal.id = getEventHash(seal),
    seal.sig = await signer.sign(seal);
    seal[verifiedSymbol] = true
    return seal;
}
  
async function getWrapEvent(sealed:VerifiedEvent, recipient:NDKUser, params? : GiftWrapParams): Promise<VerifiedEvent>{
    const signer = NDKPrivateKeySigner.generate();
    const content = await signer.encrypt(recipient, JSON.stringify(sealed), params?.encryptionNip || 'nip44')
    const pubkey = (await signer.user()).pubkey
    let wrap : any = {
        kind : params?.wrapKind || NDKKind.GiftWrap,
        created_at: approximateNow(5),
        tags: (params?.wrapTags || []).concat([["p", recipient.pubkey]]),
        content,
        pubkey,
    }
    wrap.id = getEventHash(wrap);
    wrap.sig = await signer.sign(wrap);
    wrap[verifiedSymbol] = true
    return wrap;
}

function approximateNow(drift = 0){
    return Math.round(Date.now() / 1000 - Math.random() * Math.pow(10, drift))
}