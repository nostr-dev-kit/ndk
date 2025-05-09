import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import { utf8Encoder } from "nostr-tools/lib/types/utils";
import { NDKFilter, NDKSubscription, NDKSubscriptionOptions } from "../subscription";
import { NDK } from "../ndk";
import { NDKUser } from "../user";
import { NDKKind } from "./kinds";
import { DirectMessageRelays, NDKDirectMessage, DirectMessageKind } from "./kinds/directmessage";




// callback function passed to controller.chatrooms.subscribe()
// called whenever chatrooms are updated by NDKChatroomController
export type NDKChatroomSubscriber = (chatrooms : NDKChatroom[]) => void
export type NDKChatroomUnsubscriber =  () => void
export type NDKChatroomSubscription = {
  subscribe : (subscriber : NDKChatroomSubscriber) => NDKChatroomUnsubscriber
}

// published messages get status strings from publisShatus
// published messages recieved back from relay, get "delivered" status
// recieved messages (from other users) get "read" OR "unread" 
// status depending on chatroom.readuntil
export type NDKDirectMessageStatus = "pending" | "success" | "error" | "delivered" | "read" | "unread" | undefined

// NDKChatroomController retrieves NDKDirectMessages and manages NDKChatroom instances
// It starts an NDK subscription for kind 4 and 1059 events and a given signer and filter.
// It organizes recieved messages into threads, based on the pubkeys in message.thread
// It creates a new NDKChatroom instance for every new thread, 
// NDKChatroom instances may be merged or reordered, and threads may be moved between chatrooms.
// NDKChatroomController notifies subscribers 
// when threads or messages in chatrooms have been updated
// NDKChatroomController static methods 
// provide json serialization and deserialization of chatrooms for ofline storage
export class NDKChatroomController{

  // parse a JSON string into an array of NDKChatroom instances
  static fromJson(json : string, ndk : NDK) : NDKChatroomController | undefined {
    const controller = new NDKChatroomController(ndk)
    try{
      let parsed = JSON.parse(json)
      if(parsed instanceof Array){
        (parsed as Array<any>).forEach((data) => {
          if(
            ((data.threads instanceof Array && typeof data.threads[0] == 'string') || 
            (typeof data.threads == 'undefined') ) &&
            (typeof data.subject == 'string' || typeof data.subject == 'undefined') &&
            (typeof data.readuntil == 'number' || typeof data.readuntil == 'undefined' ) 
          ){
            controller._chatrooms.add( new NDKChatroom( controller,
              data.threads as string[] | undefined,
              data.subject as string | undefined,
              data.readuntil as number | undefined
            ))
          }
        })
      }
      if(typeof parsed.readuntil == 'number'){
        controller._readuntil = parsed.readuntil
      }
    }catch(e){
      console.log("skipped error in NDKChatroomController.fromJson()")
    }
    return controller
  }

  // serialize an array of NDKChatroom instances into a JSON string
  static toJson(controller : NDKChatroomController) : string {
    let readuntil = controller._readuntil
    let chatrooms : string[] = [] 
    controller._chatrooms.forEach(chatroom => {
      // only export chatrooms that have been modified by the user
      // those with more than one thread (added by user)
      // or those whose subject has been set by the user
      // or those with messages that have been read
      if(chatroom.hasOwnSubject() || chatroom.threadids.length > 1 || chatroom.readuntil){
        chatrooms.push(JSON.stringify({
          threadids : [...chatroom.threadids],
          subject : chatroom.subject,
          readuntil : chatroom.readuntil
        }))
      }
    })
    return JSON.stringify(chatrooms)
  }

  // the NDKSubscription object controlled by .start() and .stop()
  // this is what pulls new messages from relays
  private _ndksubscription : NDKSubscription | undefined
  // a reference to all chatroom threads, indexed by message member pubkeys
  // every message recieved gets added to an existing or new thread, accoding to it's member pubkeys
  private _threads : Map<string, NDKChatroomThread | undefined> = new Map()
  // a reference to all chatrooms,
  // chatrooms may be imported from json, or generated one for every new thread 
  // chatrooms may be merged to include multiple threads, and exported to json
  private _chatrooms : Set<NDKChatroom> = new Set()
  // a reference to all subscribers being notified of chatroom uopdates, via .subscribe()
  private _subscribers : Set<NDKChatroomSubscriber> = new Set()
  private _readuntil : number = 0

  // Instantiate a ChatroomManager with NDK 
  // with optional callbacks to configure how chatrooms are built
  constructor(
    private ndk : NDK,
  ){
    if(!ndk.signer) throw new Error('missing signer required by NDKChatroomController')
  }

  // instantiates an NDKSubscription for this ChatroomManager
  async subscribe( filter? : NDKFilter, options : NDKSubscriptionOptions = {}) : Promise<NDKChatroomSubscription> {
    // only one subscription per chatroom manager
    if(this._ndksubscription) {
      this._ndksubscription.start()
      return this.chatrooms
    }
    // a signer is required for decrypting DirectMessages
    if(!this.ndk.signer) throw('missing signer required by NDKChatroomController')
    // assure that the signer and recipient are the same
    const user : NDKUser = await this.ndk.signer.user();
    // TODO should preffered DM relays be passed as relaySet or rlayUrls? 
    options.relaySet = await DirectMessageRelays.for(user)
    // this._messages = new Set()
    // this._chatrooms = new Map()
    filter = {
      ...filter, 
      kinds:[ NDKKind.EncryptedDirectMessage, NDKKind.GiftWrap ], 
      "#p" : [user.pubkey] 
    }
    this._ndksubscription = this.ndk.subscribe(filter,options)
    this._ndksubscription.on("event", async (event) => { 
      // instntiate a DirectMessage from each new event
      // using this.preferredrelays as the DirectMessageRelayManager,
      let message = await NDKDirectMessage.from(event, this.ndk);
      if(message){
        console.log("Chatroom message recieved ", this._chatrooms.size, message.rawEvent())
        message.publishStatus = undefined
        // add the message to the chatroom and call the callback
        this.addMessage(message)
      }
    })
    return this.chatrooms
  }

  // a chatroom subscription 
  chatrooms : NDKChatroomSubscription = {
    // manage subscribers, to notify on update of chatrooms
    subscribe : (subscriber: NDKChatroomSubscriber) : NDKChatroomUnsubscriber => {
      // notify the subscriber of the current chatrooms
      subscriber([...this._chatrooms])
      // add the subscriber to the list of subscribers
      this._subscribers.add(subscriber)
      // return the unsubscribe function
      return () => this.unsubscribe(subscriber)
      
    },
  }

  // stop subscriptions
  unsubscribe(subscriber? : NDKChatroomSubscriber){
    if(subscriber) {
      this._subscribers.delete(subscriber)
    }else{
      this._subscribers.clear()
    }
    if(this._ndksubscription && !this._subscribers.size){
      this._ndksubscription.stop()
    }
  }

  // notify subscribers
  notify() : void {
    this._subscribers.forEach(subscriber => {
      subscriber([...this._chatrooms])
    })
  }


  
  // instantiates and publishes a new DirectMessage with body and subject to recipients
  async sendMessage(recipients:NDKUser[] | string[], body:string, subject? : string, kind?:DirectMessageKind){
    const message = new NDKDirectMessage(this.ndk, kind)
    message.content = body
    message.subject = subject
    message.recipients = recipients
    await message.publish().then(relays =>{
      console.log('message "'+body+'" published to '+relays.size+' relays ',[...relays].map(r => r.url))
      this.addMessage(message)
    })
  }

  getMessageStatus(message: NDKDirectMessage) : NDKDirectMessageStatus {
    if(message.isauthored){
      // undefined publishStatus means 
      // authored message has been recieved from relay
      return message.publishStatus || "delivered"
    }else{
      let chatroom = this.getChatroom(message)
      if(chatroom) 
        return chatroom.readuntil >= message.created_at ? 
        "read" : "unread"
    }
    return undefined
  }

  // add a DirectMessage to a chatroom  
  private addMessage(message : NDKDirectMessage) : NDKChatroom {
    const thread = this.addMessageToThread(message)
    let chatroom = this.getChatroom(thread)
    if(chatroom){
      chatroom.update(undefined, undefined, false)
    }else{
      chatroom = new NDKChatroom(this, [thread.id], message.subject)
      this._chatrooms.add(chatroom)
    }
    this.notify()
    return chatroom
  }

  // new threads can only be set via addMessage(message) method
  private addMessageToThread(message:NDKDirectMessage) : NDKChatroomThread {
    let {id, pubkeys} = this.getThreadId(message)
    let thread = this.getThread(id)
    if(!thread){
      thread =  new NDKChatroomThread(id, pubkeys)
      this._threads.set(id, thread)
    }
    thread.set(message.id, message)
    return thread
  }
  // get the thread id and pubkeys from a message
  private getThreadId(message : NDKDirectMessage, usehash = true){
    let pubkeys = [...message.thread]
    let id = pubkeys.sort().join(',')
    // hash is used to hide pubkeys when saving chatroom (threads) to local storage
    // FIXME : utf8Encoder is not being imported properly from nostr-tools
    // if(usehash) id = bytesToHex(sha256(utf8Encoder.encode(id)))
    return {id, pubkeys}
  }


  private getThread(id : string) : NDKChatroomThread
  private getThread(message : NDKDirectMessage) : NDKChatroomThread
  private getThread(idormessage : string | NDKDirectMessage) {
    let id : string = typeof idormessage == 'string' ? idormessage : this.getThreadId(idormessage).id
    return this._threads.get(id)
  }

  getThreads(ids : string[]) : NDKChatroomThread[] {
    let threads : NDKChatroomThread[] = []
    this._threads.forEach((thread, id) => {
      if(thread && ids.includes(id)) threads.push(thread)
    })
    return threads
  }

  moveThread(thread : NDKChatroomThread, newchatroom : NDKChatroom) : NDKChatroom | undefined {
    let oldchatroom = this.getChatroom(thread)    
    newchatroom.addThread(oldchatroom?.removeThread(thread.id))
    if(oldchatroom && oldchatroom.numthreads < 1 ){
      this._chatrooms.delete(oldchatroom)
    }
    this.notify()
    return newchatroom
  }


  // get chatroom by index or thread or message 
  getChatroom(index: number ) : NDKChatroom | undefined 
  getChatroom(threadid: string ) : NDKChatroom | undefined 
  getChatroom(thread: NDKChatroomThread ) : NDKChatroom | undefined 
  getChatroom(message: NDKDirectMessage ) : NDKChatroom | undefined 
  getChatroom(identifier: number | string | NDKChatroomThread | NDKDirectMessage) : NDKChatroom | undefined {
    const chatroom = 
      typeof identifier == 'number' ? [...this._chatrooms.values()][identifier] :
      typeof identifier == 'string' ? 
        this._chatrooms.values().find(chatroom => chatroom.threadids.includes(identifier)) :
      identifier instanceof NDKChatroomThread ? 
        this._chatrooms.values().find(chatroom => chatroom.threads.includes(identifier)) :
        this._chatrooms.values().find(chatroom => chatroom.messages.includes(identifier))
    return chatroom
  }

  reorderChatrooms(chatrooms : NDKChatroom[]) : boolean {
    if(chatrooms.length != this._chatrooms.size) {
      console.log("skipped reordering chatrooms : arrays do not match")
      return false  
    }
    for(let i in chatrooms){
      if(!this._chatrooms.has(chatrooms[i])) {
        console.log("skipped reordering chatrooms : chatroom not found ", i)
        return false
      }
    }
    this._chatrooms = new Set(chatrooms)
    this.notify()
    return true
  }

  mergeChatrooms(chatrooms : NDKChatroom[]) : NDKChatroom | undefined{
    if(chatrooms.length < 2){
      console.log("skipped merging chatrooms : less than two chatrooms")
      return undefined
    }
    for(let i in chatrooms){
      if(!this._chatrooms.has(chatrooms[i])){
        console.log("skipped merging chatrooms : chatroom not found ", i)
        return undefined
      }
    }
    // merge into the first chatroom
    let merged = chatrooms.shift()
    if(!merged) return undefined
    chatrooms.forEach(chatroom => {
      merged.update(chatroom.threadids, chatroom.subject, false)
      this._chatrooms.delete(chatroom)
    })
    this.notify()
    return merged
  }
 
  getChatroomIndex(chatroom : NDKChatroom) : number | undefined {
    return [...this._chatrooms].findIndex(ichatroom => ichatroom == chatroom)
  }
}


// NDKChatroomThread represents a thread of DirectMessages
export class NDKChatroomThread extends Map<string,NDKDirectMessage>{
  constructor(
    readonly id : string,
    readonly pubkeys : string[] = [],
  ){ 
    super() 
  }
}


// NDKChatroom represents a chatroom
// It is a collection of DirectMessages threadsa and thier members
export class NDKChatroom {
  
  private _messages : NDKDirectMessage[] = []
  private _threadids : Set<string> = new Set()
  private _readuntil : number

  constructor( 
    private _controller : NDKChatroomController,
    threadids? : string[],
    private _subject? : string,
    readuntil : number = 0,
    notify = false
  ){
    this._readuntil = readuntil
    this.update(threadids, _subject, notify)
  }

  update(threadids? : string[], subject? : string, notify = false) : NDKChatroom {
    if(threadids) threadids.forEach(id => this._threadids.add(id))
    if(subject) this._subject = subject
    this._messages =  this.threads.flatMap((thread) => [...thread.values()]).sort((a, b) => (a.created_at || 0) - ( b.created_at || 0))
    if(notify) this._controller.notify()
    return this
  }

  get threads(){
    return this._controller.getThreads([...this._threadids])
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
    this._controller.notify()
  }

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
    return this.read - this.count
  }

  get pubkeys() : string[] {
    return this.threads.flatMap((thread) => thread.pubkeys)
  }

}


