import { NDKEvent, NostrEvent } from "./index.js";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { getEventHash } from "nostr-tools";
import { NDKUser } from "../user/index.js";
import { NDKSigner } from "../signers/index.js";
import { NDKKind } from "./kinds/index.js";
import { NDKEncryptionScheme } from "../types.js";

export type GiftWrapParams = {
    scheme?: NDKEncryptionScheme
    rumorKind?: number;
    wrapTags?: string[][]
}

/**
 * Instantiate a new (Nip59 gift wrapped) NDKEvent from any NDKEvent
 * @param event 
 * @param recipient 
 * @param signer 
 * @param params 
 * @returns 
 */
export async function giftWrap(event: NDKEvent, recipient: NDKUser, signer?: NDKSigner, params: GiftWrapParams = {}): Promise<NDKEvent>{
  params.scheme ??= 'nip44';
  if(!signer){
      if(!event.ndk) 
          throw new Error('no signer available for giftWrap')
      signer = event.ndk.signer;
  }
  if(!signer) 
      throw new Error('no signer')
  if(!signer.encryptionEnabled || !signer.encryptionEnabled(params.scheme)) 
      throw new Error('signer is not able to giftWrap')
  const rumor = getRumorEvent(event, params?.rumorKind)
  const seal = await getSealEvent(rumor, recipient, signer, params.scheme);
  const wrap = await getWrapEvent(seal, recipient, params);
  return new NDKEvent(event.ndk, wrap);
}

/**
 * Instantiate a new (Nip59 un-wrapped rumor) NDKEvent from any gift wrapped NDKEvent
 * @param event 
 */
export async function giftUnwrap(event: NDKEvent, sender?: NDKUser, signer?: NDKSigner, scheme: NDKEncryptionScheme = 'nip44'): Promise<NDKEvent> {
    sender = sender || new NDKUser({ pubkey: event.pubkey });
    if(!signer){
        if(!event.ndk) 
            throw new Error('no signer available for giftUnwrap');
        signer = event.ndk.signer;
    }
    if(!signer) 
        throw new Error('no signer');
    try {
      const seal = JSON.parse(await signer.decrypt(sender, event.content, scheme)) as NostrEvent;
      if (!seal) throw new Error("Failed to decrypt wrapper");
      
      if (!new NDKEvent(undefined, seal).verifySignature(false)) throw new Error("GiftSeal signature verification failed!");

      const rumorSender = new NDKUser({ pubkey: seal.pubkey });
      const rumor = JSON.parse(await signer.decrypt(rumorSender, seal.content, scheme));
      if (!rumor) throw new Error("Failed to decrypt seal");

      if (seal.pubkey === rumor.pubkey) {
        return new NDKEvent(event.ndk, rumor as NostrEvent);
      } else {
        return Promise.reject("Invalid GiftWrap, sender validation failed!");
      }
    } catch (e) {
        console.log(e);
        return Promise.reject("Got error unwrapping event! See console log.");
    }
  }

function getRumorEvent(event: NDKEvent, kind?: number): NDKEvent {
    let rumor = event.rawEvent();
    rumor.kind = kind || rumor.kind  || NDKKind.PrivateDirectMessage;
    rumor.sig = undefined;
    rumor.id = getEventHash(rumor as any);
    return new NDKEvent(event.ndk, rumor);
}

async function getSealEvent(rumor: NDKEvent, recipient: NDKUser, signer: NDKSigner, scheme: NDKEncryptionScheme = 'nip44'): Promise<NDKEvent> {
    const seal = new NDKEvent(rumor.ndk);
    seal.kind = NDKKind.GiftWrapSeal;
    seal.created_at = approximateNow(5);
    seal.content = JSON.stringify(rumor.rawEvent());
    await seal.encrypt(recipient, signer, scheme);
    await seal.sign(signer);
    return seal;
}
  
async function getWrapEvent(sealed: NDKEvent, recipient: NDKUser, params?: GiftWrapParams, scheme: NDKEncryptionScheme = 'nip44'): Promise<NDKEvent> {
    const signer = NDKPrivateKeySigner.generate();

    const wrap = new NDKEvent(sealed.ndk);
    wrap.kind = NDKKind.GiftWrap;
    wrap.created_at = approximateNow(5)
    if (params?.wrapTags) wrap.tags = params.wrapTags;
    wrap.tag(recipient);
    wrap.content = JSON.stringify(sealed.rawEvent());
    await wrap.encrypt(recipient, signer, scheme);
    await wrap.sign(signer);
    return wrap;
}

function approximateNow(drift = 0){
    return Math.round(Date.now() / 1000 - Math.random() * Math.pow(10, drift))
}