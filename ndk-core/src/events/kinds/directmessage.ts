import { NDKKind } from "."
import { NDKEvent, NostrEvent } from ".."
import { NDK } from "../../ndk"
import { NDKRelay } from "../../relay"
import { NDKRelaySet } from "../../relay/sets"
import { NDKUser } from "../../user"
import { giftUnwrap, giftWrap } from "../gift-wrapping"


export type DirectMessageKind = NDKKind.EncryptedDirectMessage | NDKKind.PrivateDirectMessage 
export type DirectMessagePublishedKind = NDKKind.EncryptedDirectMessage | NDKKind.GiftWrap 

/**
 * Handles an unecrypted kind 4 or unwrapped kind 14 event
 * Encrypted events (kind 4 and 1058 gift wrapped kind 14) 
 * may be decrypted or unwrapped by calling DirectMessage.from()
 */
export class NDKDirectMessage extends NDKEvent{
  
  // configure default kind for new DirectMessages
  static defaultkind : DirectMessageKind = NDKKind.PrivateDirectMessage

  // configure default relays for publishing gift wrapped DirectMessages
  static defaultrelayurls : string[] | undefined

  // instantiate a DirectMessage NDKEvent (kind 4 or kind 14)
  // from an encrypted (kind 4) or gift wrapped (kind 1058) event 
  static async from(event : NDKEvent | NostrEvent, ndk:NDK ) : Promise<NDKDirectMessage | undefined> {
    // if(!ndk && Object.hasOwn(event, 'ndk')) 
    //   ndk = (event as NDKEvent).ndk
    if(!ndk.signer) throw('missing signer required by DirectMessage')

    if(!Object.hasOwn(event, 'ndk')){
      event = new NDKEvent(ndk, event)
    }
    let dmevent = event as NDKEvent
    // catch any errors decrypting or unwrapping the event
    try{
      // decrypt kind 4 content
      if(dmevent.kind == NDKKind.EncryptedDirectMessage){
        await dmevent.decrypt()
      }
      // unwrap kind 14 event
      if(dmevent.kind == NDKKind.GiftWrap){
        dmevent = await giftUnwrap(dmevent,undefined, ndk.signer)
      }
    }catch(e){
      console.log('error decrypting or unwrapping DirectMessage : ', e)
      // return undefined if unable to decrypt or unwrap
      return undefined
    }
    // return DirectMessage if kind is 4 or 14
    if(dmevent.kind == NDKKind.EncryptedDirectMessage || dmevent.kind == NDKKind.PrivateDirectMessage){
      return new NDKDirectMessage(ndk, dmevent)
    }
  }

  constructor(
      ndk: NDK , 
      eventorkind : DirectMessageKind | NDKEvent | NostrEvent = NDKDirectMessage.defaultkind, 
    ){

    let event : NDKEvent | NostrEvent
    if (typeof eventorkind == 'number'){
      event = new NDKEvent()
      event.kind = eventorkind
    }else{
      event = eventorkind
    }

    if(event.kind && (event.kind != NDKKind.EncryptedDirectMessage && event.kind != NDKKind.PrivateDirectMessage)) 
      throw new Error('DirectMessage must be of kind 4 or 14');

    super(ndk, event);
    this.kind ??= NDKDirectMessage.defaultkind;
    // decrypt content (if encrypted kind 4) 
    if(this.kind == NDKKind.EncryptedDirectMessage && this.content.search("\\?iv=")){
      this.decrypt()
    }    
  }

  readonly kind : DirectMessageKind;

  // recipients are message members NOT including the author
  get recipients() : NDKUser[] {
    let recipients : NDKUser[] = [];
    this.getMatchingTags("p").forEach(ptag =>
      recipients.push(new NDKUser({pubkey:ptag[1], relayUrls:[ptag[2]]}))
    )
    return recipients;
  }
  // REPLACE existing recipients 
  // accepts array of NDKUser or pubkey strings
  set recipients(recipients : NDKUser[] | string[]){
    if(!this.isauthored) return
    // remove existing recipients
    this.tags = this.tags.filter((tag) => tag[0] != 'p')
    // add new recipients
    recipients.forEach((recipient) => {
      let pubkey : string = typeof recipient == 'string' ? recipient : recipient.pubkey
      // TODO add peferrredrelay for DMs to p tag
      // this.tag(recipient)
      this.tags.push(["p", pubkey])    
    })
  } 
  // message members are author and recipients
  get members() : NDKUser[] {
    return [this.author, ...this.recipients];
  }
  // message thread is pubkeys for all message members
  get thread() : string[] {
    return [
      this.pubkey, 
      ...this.getMatchingTags("p").map(ptag => ptag[1])
    ]
  }

  // get the subject from tag value
  get subject() : string | undefined{
    return this.tagValue("subject");
  }
  // set or remove the subject tag
  set subject(subject : string | undefined){
    if(!this.isauthored) return
    if(subject){
      let index = this.tags.findIndex((tag) => tag[0] == 'subject')
      if(index < 0) index = this.tags.length
      this.tags[index] = ["subject", subject]
    }
  }
  
  // is the message authored by the current user
  get isauthored() : boolean {
    let pubkey = this.ndk?.activeUser?.pubkey
    return !pubkey || pubkey == this.pubkey 
  }

  // override event .publish to handle encrypted or gift wrapped events
  // publish once as a kind 4 event
  // or publish for each recipient as gift wrapped kind 14 event
  async publish(
      relaySet?: NDKRelaySet,
      timeoutMs?: number,
      requiredRelayCount?: number
  ): Promise<Set<NDKRelay>> {
    // either encrypt kind 4 or gift wrap kind 14 to publish
    let publishedto : Set<NDKRelay> = new Set()
    // get author pubkey from ndk if not set
    const ndkpubkey = (await this.ndk?.signer?.user())?.pubkey
    if(!ndkpubkey) throw new Error('cannot publish message : missing signer pubkey')
    if(this.pubkey && this.pubkey !== ndkpubkey) throw new Error('cannot publish message : wrong author pubkey')
    // add thread tag to published event
    // this.replaceTag(["thread",this.thread.toString()])
    // add required event properties
    await this.toNostrEvent()
    if(this.kind == NDKKind.EncryptedDirectMessage){
      // publish as a kind 4 event (with encrypted content)
      await this.encrypt()
      publishedto = await super.publish(relaySet,timeoutMs,requiredRelayCount)
    }else if(this.kind == NDKKind.PrivateDirectMessage){
      // publish as multiple kind 1059 gift wrapped kind 14 events 
      // one for each member recipient
      for(let member of this.members){
        if(!member.pubkey) throw new Error('missing member pubkey')
          console.log("publishing for recipient : ", member.pubkey)
        // get relayset for each message member 
        let memberRelaySet = await DirectMessageRelays.for(member, this.ndk)
        memberRelaySet ??= relaySet
        console.log('publishing to '+memberRelaySet?.size+' relays : ',memberRelaySet?.relayUrls)
        // gift wrap and publish to each member
        const wrapped = await giftWrap(this, member)
        await memberRelaySet?.publish(wrapped,timeoutMs,requiredRelayCount).then((relays) => {
          relays.forEach((relay) => {
            console.log('published to relay : ',relay.url)
            publishedto.add(relay)
          })
        })
      }
    }
    return publishedto
  }
}

// retrieve and cache the preferred DM relay list (kind 10050) for any pubkey
// used to identify relays for publishing gift wrapped DirectMessages
export class DirectMessageRelays {

  private static _preferredrelays = new Map<string, NDKRelaySet>()
  static defaulturls : string[] = []

  private constructor(){}

  static async for(pubkey : string, ndk : NDK) : Promise<NDKRelaySet | undefined>
  static async for(user : NDKUser, ndk? : NDK) : Promise<NDKRelaySet | undefined>
  static async for(userorpubkey : NDKUser | string, possiblendk? : NDK) : Promise<NDKRelaySet | undefined>{
    // return relayset if already fetched
    let user : NDKUser
    let ndk : NDK
    let pubkey : string = typeof userorpubkey == 'string' ? userorpubkey : userorpubkey.pubkey
    if(this._preferredrelays.has(pubkey)){
      return this._preferredrelays.get(pubkey)
    }

    if(typeof userorpubkey == 'string'){
      if(!possiblendk) throw new Error('missing ndk')
      ndk = possiblendk
      user = ndk.getUser({pubkey})
    }else{
      user = userorpubkey
      if(possiblendk) ndk = possiblendk 
      else if(user.ndk) ndk = user.ndk
      else throw new Error('missing ndk')
    }

    // let user : NDKUser | undefined
    let preferredrelays : NDKRelaySet | undefined

    const relayset : Set<NDKRelay> = new Set()
    for(let u in this.defaulturls){
      let url = this.defaulturls[u]
      console.log('instantiating new relay from default : ', url)
      let relay = new NDKRelay(url, undefined, ndk)
      await relay.connect().then(()=> 
        console.log('connected to default relay : ', relay.url)
      )
      relayset.add(relay)
    }
    const dmrelaysfilter = {
      authors:[user.pubkey],
      kinds:[NDKKind.DirectMessageReceiveRelayList]
    }
    await ndk.fetchEvent(dmrelaysfilter).then(async event => {
      for(let tag in event?.tags){
        if(tag[0] == 'relay') {
          // console.log('adding user relay : ',tag[1])
          let relay = new NDKRelay(tag[1], undefined, ndk)
          await relay.connect().then(()=> console.log('connected to user relay : ', relay.url))
          relayset.add(relay) 
        }
      }
    })
    preferredrelays = new NDKRelaySet(relayset, ndk)
    console.log('DirectMessageRelays.for('+pubkey+') : ', preferredrelays.relayUrls)
    this._preferredrelays.set(user.pubkey, preferredrelays)
    return preferredrelays
  }
}