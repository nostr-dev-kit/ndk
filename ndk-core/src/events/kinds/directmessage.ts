import { NDKKind } from "."
import { NDKEvent, NDKRawEvent, NostrEvent } from ".."
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

  kind : DirectMessageKind;

  // instantiate a DirectMessage NDKEvent (kind 4 or kind 14)
  // from an encrypted (kind 4) or gift wrapped (kind 1058) event 
  static async from(event : NDKEvent | NostrEvent, ndk:NDK ) : Promise<NDKDirectMessage | undefined> {
    if(!ndk.signer || !(await ndk.signer.user()).pubkey) 
      throw('missing or invalid signer required by NDKDirectMessage.from()')
    // if event is not an NDKEvent, create a new NDKEvent
    let dmevent = new NDKEvent(ndk, event) 
    // let dmevent : NDKEvent = !Object.hasOwn(event, 'ndk') ? new NDKEvent(ndk, event) : event as NDKEvent
    // catch any errors decrypting or unwrapping the event
    try{
      // unwrap kind 14 event
      if(dmevent.kind == NDKKind.GiftWrap){
        dmevent = await giftUnwrap(dmevent,undefined, ndk.signer)
      } 
      // decrypt kind 4 content
      if(dmevent.kind == NDKKind.EncryptedDirectMessage){
        let user = await ndk.signer.user()
        let sender = dmevent.pubkey == user?.pubkey ? user : undefined
        await dmevent.decrypt(sender, ndk.signer, 'nip04')
      }
    }catch(e){
      let user = await ndk.signer.user()
      console.log('error decrypting or unwrapping DirectMessage : ', e, dmevent.rawEvent())
      console.log('signing user pubkey : ', user?.pubkey)
      // return undefined if unable to decrypt or unwrap
      // return undefined
    }
    // return NDKDirectMessage if kind is 4 or 14
    if(dmevent.kind == NDKKind.EncryptedDirectMessage || dmevent.kind == NDKKind.PrivateDirectMessage){
      return new NDKDirectMessage(ndk, dmevent)
    }
  }

  constructor(
      ndk: NDK , 
      eventorkind : DirectMessageKind | Partial<NDKRawEvent> | NDKEvent = NDKDirectMessage.defaultkind, 
    ){

    let event : NDKEvent |  Partial<NDKRawEvent>
    if (typeof eventorkind == 'number'){
      event = new NDKEvent()
      event.kind = eventorkind
    }else{
      event = eventorkind
    }

    if(event.kind && event.kind != NDKKind.EncryptedDirectMessage && event.kind != NDKKind.PrivateDirectMessage) 
      throw new Error('DirectMessage must be of kind 4 or 14');
    
    super(ndk, event);
    this.kind ??= NDKDirectMessage.defaultkind;
    // backwards compatible decrypt content if instantiated from encrypted kind 4 event
    if(this.kind == NDKKind.EncryptedDirectMessage && this.content.search("\\?iv=")){
      this.decrypt()
    }    
  }

  // recipients are message members NOT including the author
  get recipients() : NDKUser[] {
    let recipients : NDKUser[] = [];
    this.getMatchingTags("p").forEach(ptag =>{
      if(!this.ndk) throw('Missing NDK')
        // skip if no pubkey
      if(!ptag[1]) return
      // skip if author is tagged as recipient
      if(ptag[1] == this.pubkey) return
      let user = this.ndk.getUser({
        pubkey:ptag[1], 
        relayUrls:[ptag[2]]
      })
      recipients.push(user)
    })
    return recipients;
  }
  // REPLACE existing recipients 
  // accepts array of NDKUser or pubkey strings
  set recipients(recipients : NDKUser[] | string[]) {
    if(!this.isauthored) return
    // remove existing recipients
    this.tags = this.tags.filter((tag) => tag[0] != 'p')
    // add new recipients
    recipients.forEach((recipient) => {
      // skip if no pubkey
      if(!(recipient as any)?.pubkey) return
      // skip if author is tagged as recipient
      if((recipient as any)?.pubkey == this.pubkey) return
      let pubkey : string = typeof recipient == 'string' ? recipient : recipient.pubkey
      // TODO add peferrredrelay for DMs to p tag
      // this.tag(recipient)
      this.tags.push(["p", pubkey])  
    })
  } 
  // message members are author and recipients
  get members() : NDKUser[] {
    if(!this.ndk) throw('Missing NDK')
    let author = this.ndk.getUser({pubkey : this.pubkey})
    return [author, ...this.recipients];
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

  // get best kind for publishing
  async getBestKind() : Promise<DirectMessageKind> {
    let kind : DirectMessageKind = NDKKind.EncryptedDirectMessage
    // get DM relays for publishing kind 14
    let dmRelays = await this.getDmRelays()
    // if relays are found for every recipient, allow publishing as kind 14
    if(this.members.every(member => dmRelays.has(member.pubkey)))
      kind = NDKKind.PrivateDirectMessage
    console.log('messages best kind : ', kind)
    return kind
  }

  private _dmRelays : Map<string,NDKRelaySet | undefined> = new Map()
  async getDmRelays() : Promise<Map<string, NDKRelaySet | undefined>>  {
    if(this._dmRelays.size > 0) return this._dmRelays
    for(let member of this.members){
      if(!member?.pubkey) 
        throw('Cannot publish message to all recipients. Missing pubkey')
      // get DM relays for each recipient
      let memberRelaySet = (await DirectMessageRelays.for(member, this.ndk))
      if(memberRelaySet?.size) this._dmRelays.set(member.pubkey, memberRelaySet)
    }
    console.log('Generated DMRelays for all members : ', this._dmRelays)
    return this._dmRelays
  }

  // override event.publish 
  // handles kind 4 "encrypted content" OR kind 14 "gift wrapped and encrypted"
  // publish as kind 4 event, with individual messages if multiple recipients
  // or publish as kind 14 event, with group messages if multiple recipients
  async publish(
      relaySet?: NDKRelaySet,
      timeoutMs?: number,
      requiredRelayCount?: number,
      publishBestKind: boolean = true,
      publishKind4Group: boolean = false,
  ): Promise<Set<NDKRelay>> {
    console.log('publishing DirectMessage : ', this)
    // either encrypt kind 4 or gift wrap kind 14 to publish
    let publishedto : Set<NDKRelay> = new Set()
    // get author pubkey from ndk if not set
    const ndkpubkey = this.ndk?.activeUser?.pubkey
    if(!ndkpubkey) 
      throw new Error('Cannot publish message : missing signer pubkey.')
    if(this.pubkey && this.pubkey !== ndkpubkey) 
      throw new Error('Cannot publish message : wrong author pubkey.')
    // add required event properties
    await this.toNostrEvent()
    // but unset the ID... this will be provided during sign()
    this.id = ''

    console.log("Author pubkey:", this.pubkey);
    console.log("Recipient pubkeys:", this.recipients.map(r => r.pubkey));

    // validate DM relays for kind 14 AND get best kind for publishing
    if(this.kind == NDKKind.PrivateDirectMessage || publishBestKind){ 
      let bestkind = await this.getBestKind()
      // update kind to bestkind 
      if(publishBestKind) this.kind = bestkind
      // otherwise throw error if publishing kind 14 and no DM relays found
      else if(bestkind !== this.kind && this.kind == NDKKind.PrivateDirectMessage)         
        throw("Cannot publish as a private group message. Some recipients don't have relays setup. Please choose another publishing option.")
    }

    console.log('publishing DirectMessage Event : ', this.rawEvent())

    // publish a kind 4 event (with encrypted content only)
    if(this.kind == NDKKind.EncryptedDirectMessage){
      // check if allow publishing to multiple recipients
      if(this.recipients.length > 1 && !publishKind4Group)
        throw ('Cannot publish legacy kind 4 messages to a group. Please choose another publishing option.')
      // publishing separate events for each recipient, each with a single 'p' tag
      let recipients = [...this.recipients]
      // clear event p tags
      this.recipients = []
      for(let recipient of recipients){
        // add a single p tag
        this.recipients = [recipient]
        await this.encrypt(undefined,undefined, 'nip04')
        console.log('publishing kind 4 encrypted message :', this.rawEvent())
        publishedto = await super.publish(relaySet,timeoutMs,requiredRelayCount)
      }
    }

    // publish as kind 14 event (with encrypted metadata)
    if(this.kind == NDKKind.PrivateDirectMessage){ 
      // get DM relays for publishing kind 14
      let dmRelays = await this.getDmRelays()
      // publish as multiple kind 1059 gift wrapped kind 14 events 
      // one for each member recipient
      for(let member of this.members){
        console.log("publishing for recipient : ", member.pubkey)
        // get relayset for each message member 
        let memberRelaySet = dmRelays.get(member.pubkey)
        console.log('publishing to '+memberRelaySet?.size+' relays : ',memberRelaySet?.relayUrls)
        // gift wrap and publish to each member
        const wrapped = await giftWrap(this, member)
        console.log('publishing kind 1056 gift wrapped encrypted message :', wrapped.rawEvent())
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

  static async for(pubkey : string, ndk : NDK, connect?: boolean) : Promise<NDKRelaySet | undefined>
  static async for(user : NDKUser, ndk? : NDK, connect?: boolean) : Promise<NDKRelaySet | undefined>
  static async for(userorpubkey : NDKUser | string, possiblendk? : NDK, connect = true) : Promise<NDKRelaySet | undefined>{
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
      if(connect) await relay.connect().then(()=> 
        console.log('connected to default relay : ', relay.url)
      )
      relayset.add(relay)
    }
    const dmrelaysfilter = {
      authors:[user.pubkey],
      kinds:[NDKKind.DirectMessageReceiveRelayList]
    }
    await ndk.fetchEvent(dmrelaysfilter).then(async event => {
      if(event?.tags)
      for(let tag of event.tags){
        if(tag[0] == 'relay') {
          // console.log('adding user relay : ',tag[1])
          let relay = new NDKRelay(tag[1], undefined, ndk)
          if(connect) await relay.connect().then(()=> console.log('connected to user relay : ', relay.url))
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