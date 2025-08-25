import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import { utf8Encoder } from "nostr-tools/lib/types/utils";
import { NDKFilter, NDKSubscription, NDKSubscriptionOptions } from "../subscription";
import { NDK } from "../ndk";
import { Hexpubkey, NDKUser } from "../user";
import { NDKKind } from "./kinds";
import { DirectMessageRelays, NDKDirectMessage } from "./kinds/directmessage";
import { NDKUserProfile } from 'src';



// published messages get status strings from publisShatus
// published messages recieved back from relay, get "delivered" status
// recieved messages (from other users) get "read" OR "unread" 
// status depending on chatroom.readuntil
export type NDKDirectMessageStatus = "pending" | "success" | "error" | "delivered" | "read" | "unread" | undefined


// callback function passed to subscriber.chatrooms.subscribe()
// called whenever chatrooms are updated by NDKChatroomManager
export type NDKChatroomSubscription = (chatrooms : NDKChatroomManager) => void
export type NDKChatroomSubscribable = {
  subscribe : (subscription : NDKChatroomSubscription) => () => void
}
// define a callback method for use by NDKChatroomManager 
// to determine if a thread should be marked `trusted`
export type NDKChatroomIsTrusted = (this : NDKChatroom) => Promise<boolean>

// // NDKChatroomSubscriberOptions are options for configuring the NDKChatroomManager
// export type NDKChatroomSubscriberOptions = {
//   // use cache adapter for storing profiles and messages ?
//   useCacheAdapter?: boolean
//   fromJson? : string
// }


// NDKChatroomSubscriber retrieves NDKDirectMessages from local cache or relays,
// and updates a single NDKChatroomManager
export class NDKChatroomSubscriber {
  // the NDKSubscription object controlled by .start() and .stop()
  // this is what pulls new messages from relays
  private _ndksubscription : NDKSubscription | undefined
  // a reference to all subscribers being notified of chatroom uopdates, via .subscribe()
  private _subscribers : Set<NDKChatroomSubscription> = new Set()
  private _manager : NDKChatroomManager

  // Instantiate a NDKChatroomSubscriber with NDK 
  constructor(
    readonly ndk : NDK,
    // use cache adapter for storing profiles and messages ?
    readonly useCacheAdapter = true,
    // load chatrooms from a json localstorage
    fromjson ? : string
  ){
    if(!ndk.signer) throw new Error('missing signer required by NDKChatroomManager')
    this._manager = NDKChatroomManager.fromJson(fromjson, this) || new NDKChatroomManager(this)
  }

  // instantiates an NDKSubscription for this ChatroomManager
  async subscribe( addfilter? : NDKFilter, options : NDKSubscriptionOptions = {}) : Promise<NDKChatroomSubscribable> {
    // only one subscription per chatroom manager
    if(this._ndksubscription) {
      this._ndksubscription.start()
      return this.chatrooms
    }
    // a signer is required for decrypting DirectMessages
    if(!this.ndk.signer) throw('missing signer required by NDKChatroomManager')
    // assure that the signer and recipient are the same
    const user : NDKUser = await this.ndk.signer.user();
    if(!user.pubkey) throw('NDK signer missing user pubkey')
    // TODO should preffered DM relays be passed as relaySet or rlayUrls? 
    options.relaySet = await DirectMessageRelays.for(user, this.ndk)
    // allows the dexie event cache to be always querried first 
    if(this.useCacheAdapter) options.addSinceFromCache = true


    let filters : NDKFilter[] = [
      {
        kinds:[ NDKKind.EncryptedDirectMessage], 
        "authors" : [user.pubkey],
      },
      {
        kinds:[ NDKKind.EncryptedDirectMessage, NDKKind.GiftWrap ], 
        "#p" : [user.pubkey] 
      },
    ]
    if(addfilter) filters.push({
        ...addfilter, 
        kinds:[ NDKKind.EncryptedDirectMessage, NDKKind.GiftWrap ], 
      })

    this._ndksubscription = this.ndk.subscribe(filters,options)
    this._ndksubscription.on("event", async (event) => { 
      // instantiate a DirectMessage from each new event
      // using this.preferredrelays as the DirectMessageRelayManager,
      let message = await NDKDirectMessage.from(event, this.ndk);
      if(message){
        console.log("Chatroom message recieved ", this._manager.size, message.rawEvent())
        message.publishStatus = undefined
        // update all cached profiles with each message recieved
        await this._manager.updateProfiles(message)
        // add the message to an existing or new thread/chatroom
        this._manager.addMessage(message)
        // TODO is it nessecary to add member DM relays?
        // add message member relays to subscription
        // for(let member of message.members){
        //  (await DirectMessageRelays.for(member, this.ndk))?.relays.forEach(relay => 
        //   this._ndksubscription?.relaySet?.addRelay(relay)
        // )}
      }
    })
    return this.chatrooms
  }

  // a chatroom subscription 
  chatrooms : NDKChatroomSubscribable = {
    // manage subscribers, to notify on update of chatrooms
    subscribe : (subscription: NDKChatroomSubscription) : ()=>void  => {
      // notify the subscriber of the current chatrooms
      subscription(this._manager)
      // add the subscriber to the list of subscribers
      this._subscribers.add(subscription)
      // return the unsubscribe function
      return () => this.unsubscribe(subscription)
    },
  }

  // stop subscriptions
  unsubscribe(subscription? : NDKChatroomSubscription){
    if(subscription) {
      this._subscribers.delete(subscription)
    }else{
      this._subscribers.clear()
    }
    if(this._ndksubscription && !this._subscribers.size){
      this._ndksubscription.stop()
    }
  }

  restart() : void {
    this._ndksubscription?.start()
  }

  // notify subscribers
  notify() : void {
    this._subscribers.forEach(subscriber => {
      subscriber(this._manager)
    })
  }


}



// It starts an NDK subscription for kind 4 and 1059 events and a given signer and filter.
// It organizes recieved messages into threads, based on the pubkeys in message.thread
// It creates a new NDKChatroom instance for every new thread, 
// NDKChatroom instances may be merged or reordered, and threads may be moved between chatrooms.
// NDKChatroomManager notifies subscribers 
// when threads or messages in chatrooms have been updated
// NDKChatroomManager static methods 
// provide json serialization and deserialization of chatrooms for ofline storage
export class NDKChatroomManager extends Set<NDKChatroom>  {

  // parse a JSON string into an array of NDKChatroom instances
  static fromJson(json : string | undefined, subscriber : NDKChatroomSubscriber) : NDKChatroomManager | undefined {
    if(!json) return undefined
    const manager = new NDKChatroomManager(subscriber)
    try{
      let parsed = JSON.parse(json)
      if(parsed instanceof Array){
        (parsed as Array<any>).forEach((data) => {
          if(
            typeof data.id == 'string' &&
            ((data.kinds instanceof Array && typeof data.kinds[0] == 'number' ) ||
            typeof data.kinds == 'undefined') &&
            ((data.threads instanceof Array && typeof data.threads[0] == 'string') || 
            (typeof data.threads == 'undefined') ) &&
            (typeof data.subject == 'string' || typeof data.subject == 'undefined') &&
            (typeof data.trusted == 'boolean' || typeof data.trusted == 'undefined' ) &&
            (typeof data.readuntil == 'number' || typeof data.readuntil == 'undefined' ) 
          ){
            manager.set(new NDKChatroom( manager, {
              id : data.id as string,
              kinds : data.kinds as number[] | undefined,
              threadids : data.threads as string[] | undefined,
              subject : data.subject as string | undefined,
              trusted : data.trusted as boolean | undefined,
              readuntil : data.readuntil as number | undefined,
            }))
          }
        })
      }
    }catch(e){
      console.log("skipped error in NDKChatroomManager.fromJson()")
    }
    return manager
  }
  
  // serialize an array of NDKChatroom instances into a JSON string
  static toJson(mnanager : NDKChatroomManager) : string {
    let chatrooms : string[] = [] 
    mnanager.forEach(chatroom => {
      // FIXME determining exportability should be a method of the chatroom?
      // only export chatrooms that have been modified by the user
      // those with more than one thread (added by user)
      // or those whose subject has been set by the user
      // or those with messages that have been read
      if(chatroom.hasOwnSubject() || chatroom.threadids.length > 1 || chatroom.readuntil){
        chatrooms.push(JSON.stringify({
          kinds : chatroom.kinds,
          id : chatroom.id,
          threadids : [...chatroom.threadids],
          subject : chatroom.subject,
          // FIXME won't this always return true?
          trusted : chatroom.isTrusted(),
          readuntil : chatroom.readuntil
        }))
      }
    })
    return JSON.stringify(chatrooms)
  }

  // a reference to all chatroom threads, indexed by message member pubkeys
  // every message recieved gets added to an existing or new thread, accoding to it's member pubkeys
  private _threads : Map<string, NDKChatroomThread | undefined> = new Map()
  // a reference to all chatroom members with profiles already loaded
  readonly recipients : Map<string, NDKUser> = new Map()

  // Instantiate a NDKChatroomManager with NDKChatroomSubscriber 
  constructor(
    private _subscriber : NDKChatroomSubscriber,
  ){
    if(!_subscriber.ndk.signer) throw new Error('missing signer required by NDKChatroomManager')
    super()
  }

  restart() : void {
    this._subscriber.restart()
  }

  notify() : void {
    this._subscriber.notify()
  }

  get ndk() : NDK {
    return this._subscriber.ndk
  }

  // get the active user's pubkey
  get pubkey() : string {
    if(!this.ndk.signer) throw new Error('missing signer required by NDKChatroomManager')
    return this.ndk.signer.pubkey
  }

  async getAuthor() : Promise<NDKUser> {
    if(!this._subscriber.ndk.signer) throw new Error('missing signer required by NDKChatroomManager')
    return await this._subscriber.ndk.signer.user()
  }

  async updateProfiles(from? : NDKDirectMessage | NDKChatroom) : Promise<NDKUser[]> {
    // cache user profiles for message members
    let recipients = from?.recipients || [...this.recipients.values()]
    let useCache = this._subscriber.useCacheAdapter && this.ndk.cacheAdapter ? true : false
    let user : NDKUser | undefined
    let profile : NDKUserProfile | undefined
    for(let i in recipients) { 
      user = recipients[i]
      user.ndk ??= this.ndk
      if(!user?.profile) profile = await user?.fetchProfile({},useCache) || undefined
      if(user && profile) {
        this.recipients.set(user.pubkey,user)
      }
      // FIXME precaching DM relays results in ... threads being merged? 
      // await DirectMessageRelays.for(user)
    }
    return recipients
  }


  // add a DirectMessage to an existing or new chatroom  
  addMessage(message : NDKDirectMessage) : NDKChatroom {
    const thread = this.addMessageToThread(message)
    let chatroom = this.get(thread)
    if(chatroom){
      // update() returns undefined if thread kind does not match chatroom kind
      chatroom.update(undefined, undefined, false)
    }else{
      let config : NDKChatroomConfig = {
        threadids : [thread.id],
        subject : message.subject
      }
      chatroom = new NDKChatroom(this, config)
      this.set(chatroom)
    }
    this.notify()
    return chatroom
  }

  // new threads can only be set via addMessage(message) method
  private addMessageToThread(message:NDKDirectMessage) : NDKChatroomThread {
    let thread = this.getThread(message)?.set(message.id, message)
    if(!thread){
      let id = NDKChatroomThread.getId(message)
      thread = new NDKChatroomThread(id, message)
      this._threads.set(id, thread)
    }
    return thread
  }

  // instantiates and publishes a new DirectMessage with body and subject to recipients
  async sendMessage(message : NDKDirectMessage, publishBestKind? : boolean, publishKind4Group? : boolean){
    await message.publish(undefined,undefined,undefined,publishBestKind,publishKind4Group).then(relays =>{
      console.log('message published to '+relays.size+' relays ',[...relays].map(r => r.url))
      this.addMessage(message)
    })
  }

  getMessageStatus(message: NDKDirectMessage) : NDKDirectMessageStatus {
    if(message.isauthored){
      // undefined publishStatus means 
      // authored message has been recieved from relay
      return message.publishStatus || "delivered"
    }else{
      let chatroom = this.get(message)
      if(chatroom) 
        return chatroom.readuntil >= message.created_at ? 
        "read" : "unread"
    }
    return undefined
  }

  getThread(id : string) : NDKChatroomThread | undefined
  getThread(message : NDKDirectMessage) : NDKChatroomThread | undefined
  getThread(idormessage : string | NDKDirectMessage) {
    if(typeof idormessage == 'string') 
      return this._threads.get(idormessage)
    return this._threads.values().find(thread => thread?.pubkeys.every(pubkey => 
      idormessage.thread.includes(pubkey)
    ))
  }

  getThreads(ids : string[]) : NDKChatroomThread[] {
    let threads : NDKChatroomThread[] = []
    this._threads.forEach((thread, id) => {
      if(thread && ids.includes(id)) threads.push(thread)
    })
    return threads
  }

  getThreadsByPubkey(pubkey : string) : NDKChatroomThread[] {
    let threads : NDKChatroomThread[] = []
    this._threads.forEach((thread) => {
      if(thread && thread.pubkeys.includes(pubkey)) threads.push(thread)
    })
    return threads
  }

  moveThread(thread : NDKChatroomThread, newchatroom : NDKChatroom) : NDKChatroom | undefined {
    let oldchatroom = this.get(thread)    
    newchatroom.addThread(oldchatroom?.removeThread(thread.id))
    if(oldchatroom && oldchatroom.numthreads < 1 ){
      super.delete(oldchatroom)
    }
    this.notify()
    return newchatroom
  }

  // get chatroom by index or thread or message 
  get(index: number ) : NDKChatroom | undefined 
  get(id: string ) : NDKChatroom | undefined 
  get(thread: NDKChatroomThread ) : NDKChatroom | undefined 
  get(message: NDKDirectMessage ) : NDKChatroom | undefined 
  get(identifier: number | string | NDKChatroomThread | NDKDirectMessage) : NDKChatroom | undefined {
    const chatroom = 
      typeof identifier == 'number' ? [...this.values()][identifier] :
      typeof identifier == 'string' ? 
      this.values().find(chatroom => chatroom.id == identifier) ||
        this.values().find(chatroom => chatroom.threadids.includes(identifier)) :
      identifier instanceof NDKChatroomThread ? 
        this.values().find(chatroom => chatroom.threads.includes(identifier)) :
        this.values().find(chatroom => chatroom.messages.includes(identifier))
    return chatroom
  }

  private set(chatroom : NDKChatroom) {
    let existing = this.get(chatroom.id)
    // FIXME update() returns undefined if thread kind does not match chatroom kind
    if(existing) {
      existing.update(chatroom.threadids, chatroom.subject, false)
    }else{ 
      super.add(chatroom)
    }
    this.notify()
    return this
  }

  reorder(chatrooms : NDKChatroom[]) : boolean {
    if(chatrooms.length != this.size) {
      console.log("skipped reordering chatrooms : arrays do not match")
      return false  
    }
    for(let i in chatrooms){
      if(!this.has(chatrooms[i])) {
        console.log("skipped reordering chatrooms : chatroom not found ", i)
        return false
      }
    }
    this.forEach(chatroom => super.delete(chatroom))
    chatrooms.forEach(chatroom => super.add(chatroom))
    this.notify()
    return true
  }

  merge(chatrooms : NDKChatroom[]) : NDKChatroom | undefined{
    if(chatrooms.length < 2){
      console.log("skipped merging chatrooms : less than two chatrooms")
      return undefined
    }
    for(let i in chatrooms){
      if(!this.has(chatrooms[i])){
        console.log("skipped merging chatrooms : chatroom not found ", i)
        return undefined
      }
    }
    // merge into the first chatroom
    let merged = chatrooms.shift()
    if(!merged) return undefined
    chatrooms.forEach(chatroom => {
      // FIXME update() returns undefined if thread kind does not match chatroom kind
      merged.update(chatroom.threadids, chatroom.subject, false)
      super.delete(chatroom)
    })
    this.notify()
    return merged
  }
 
  getIndex(chatroom : NDKChatroom) : number | undefined {
    return [...this.values()].findIndex(entry => entry.id == chatroom.id)
  }

  // dissable add() for chatrooms
  add(){
    throw new Error("set() is not a public method")
    return this
  }
  // dissable delete() for chatrooms
  delete() {
    throw new Error("delete() is not a public method")
    return false
  }
  
}


// NDKChatroomThread represents a thread of DirectMessages
export class NDKChatroomThread extends Map<string,NDKDirectMessage>{

  // get the thread id and pubkeys from a message
  static getId(message : NDKDirectMessage, usehash = true){
    let pubkeys = [...message.thread]
    let id = pubkeys.sort().join(':')
    // hash is used to hide pubkeys when saving chatroom (threads) to local storage
    // FIXME : utf8Encoder is not being imported properly from nostr-tools
    // if(usehash) id = bytesToHex(sha256(utf8Encoder.encode(id)))
    return id
  }

  private _pubkeys : Set<string>
  private _kinds : Set<number>
  constructor(
    readonly id : string,
    message : NDKDirectMessage,
  ){ 
    if(!message.kind) throw new Error('missing event kind in NDKChatroomThread')
    super()
    this._kinds = new Set([message.kind])
    this._pubkeys = new Set(message.thread)
    this.set(message.id, message)
  }

  set(id : string, message : NDKDirectMessage) : this {
    super.set(id, message)
    this._kinds.add(message.kind)
    message.thread.forEach(pubkey => this._pubkeys.add(pubkey))
    return this
  }

  get pubkeys() : string[] {
    return [...this._pubkeys]
  }
  get kinds() : number[] {
    return [...this._kinds]
  }

}



export type NDKChatroomConfig = {
  id? : string,
  kinds? : number[],
  threadids? : string[],
  subject? : string,
  trusted? : boolean,
  readuntil? : number,
  publishBestKind? : boolean,
  publishKind4Group? : boolean,
}
// NDKChatroom represents a chatroom
// It is a collection of DirectMessages threadsa and thier members
export class NDKChatroom {

  // default method for determining if a chatroom is `trusted` (not spam)
  private static _isTrusted(this : NDKChatroom, trusted? : Set<Hexpubkey>) : boolean {
    let istrusted : boolean = false
    // if trust is explicitly set, use this
    if(this._trusted !== undefined ) istrusted = this._trusted
    // trust if user has replied in this chatroom
    else if(this.messages.some(message => message.pubkey == this._manager.pubkey)) istrusted = true
    // trust if all pubkeys are also recipients in other trusted chatrooms
    else if(this.pubkeys.every( 
      pubkey => this._manager.values().some(chatroom => 
        chatroom?.pubkeys.includes(pubkey) && chatroom._trusted)
      )) istrusted = true
    // otherwise, trust if every pubkey is `trusted` by the user
    else if(trusted) {
      if(this.pubkeys.every(pubkey => trusted.has(pubkey))) istrusted = true
    }
    return istrusted
  }

  private _messages : NDKDirectMessage[] = []
  private _threadids : Set<string> = new Set()
  private _pubkeys : Set<string> = new Set()
  private _kinds : Set<number> = new Set()
  private _subject : string | undefined
  private _readuntil : number
  private _id : string
  private _trusted? : boolean 

  constructor( 
    private _manager : NDKChatroomManager,
    private _config? : NDKChatroomConfig
  ){
    // this._id = _config?.id || bytesToHex(sha256(utf8Encoder.encode(this._manager.pubkey + Date.now().toString())))
    this._id = _config?.id || this._manager.pubkey+':'+Date.now().toString()

    this._kinds = new Set(_config?.kinds)
    this._trusted = _config?.trusted
    this._readuntil = _config?.readuntil || 0
    this.update(_config?.threadids, _config?.subject, false)
  }

  // TODO send message to a subset of pubkeys, and add (new) thread to this chatroom
  sendMessage(message : NDKDirectMessage){
    if(!message.recipients?.length) message.recipients = this.recipients
    return this._manager.sendMessage(message, this._config?.publishBestKind, this._config?.publishKind4Group)
  }

  update(threadids? : string[], subject? : string, notify = false) : NDKChatroom | undefined {
    if(threadids) {
      // TODO skip updating if new thread kinds dont match chatroom kind
      // if(!this._manager.getThreads(threadids).every(thread => {
      //   // TODO check if members can recieve gift wrapped DMS?
      //   thread.kind == this.kind
      // })) return undefined
      // add new threads
      threadids.forEach(id => this._threadids.add(id))
      // add pubkeys and kinds from new threads
      this.threads.forEach((thread) => {
        thread.pubkeys.forEach( pubkey => this._pubkeys.add(pubkey))
        thread.kinds.forEach( kind => this._kinds.add(kind))
      })
    }
    if(subject) this._subject = subject
    this._messages =  this.threads.flatMap((thread) => [...thread.values()]).sort((a, b) => (a.created_at || 0) - ( b.created_at || 0))
    if(notify) this._manager.notify()
    return this
  }

  get id() : string {
    return this._id
  }

  get threads(){
    return this._manager.getThreads([...this._threadids])
  }

  get threadids() : string[] {
    return [...this._threadids]
  }

  get numthreads() : number {
    return this._threadids.size
  }

  get readuntil() : number {
    return this._readuntil
  }

  set readuntil(messageortimestamp : NDKDirectMessage | number) {
    const timestamp = typeof messageortimestamp == 'number' ? 
      messageortimestamp : messageortimestamp.created_at
    // if(this._readuntil && this._readuntil > timestamp){
      this._readuntil = timestamp
    // }
    this._manager.notify()
  }

  // getter/setter for trusted
  // set _trusted by passing a boolean
  // get _trusted by optionally passing a set of `trusted` pubkeys
  isTrusted(trusted? : boolean | Set<Hexpubkey> ) : boolean{
    if(typeof trusted == 'boolean'){
      this._trusted = trusted
      this._manager.notify()
    }
    else if(this._trusted === undefined){
      this._trusted = this._isTrusted(trusted)
      this._manager.notify()
    }
    return this._trusted
  }
  private _isTrusted = NDKChatroom._isTrusted

  addThread(threadid? : string) : void {
    if(threadid) this._threadids.add(threadid)
    this.update()
  }

  // only remove thread if chatroom has more than one thread
  removeThread(id : string) : string | undefined {
    let deleted = this._threadids.delete(id) ? id : undefined
    this.update()
    return deleted
  }

  // chatroom subject may be set by the user or derived from the latest message containing a subject
  set subject(subject : string | undefined) {
    this.update(undefined, subject, true)
  }
  get subject() : string | undefined {
    if(this._subject) return this._subject
    return this.messages.toReversed().find(message => message.subject)?.subject 
  }

  hasOwnSubject() : boolean {
    return this._subject !== undefined
  }

  get messages() : NDKDirectMessage[] {
    return this._messages
  }

  get count() : number { 
    return this.messages.length
  }
  get read() : number {
    let isreadindex = this.messages.findIndex((message) => message.created_at >= this.readuntil)
    return this.messages.slice(0,isreadindex).length
  }

  get unread() : number  { 
    return this.count - this.read
  }

  author(message : NDKDirectMessage) : NDKUser {
    return this._manager.recipients.get(message?.pubkey || this._manager.pubkey) || message.author
  }

  get members() : NDKUser[] {
    return this.pubkeys.map(pubkey => this._manager.recipients.get(pubkey) || new NDKUser({pubkey}))
  }

  get recipients() : NDKUser[] {
    let pubkeys = this.pubkeys.filter(pubkey => pubkey !== this._manager.pubkey)
    if(!pubkeys.length) pubkeys = this.pubkeys
    return pubkeys.map(pubkey => this._manager.recipients.get(pubkey) || new NDKUser({pubkey}))
  }

  // return pubkeys as a sorted list for consistency in display
  get pubkeys() : string[] {
    return [...this._pubkeys].sort()
  }

  get kinds() : number[] {
    return [...this._kinds]
  }

}
