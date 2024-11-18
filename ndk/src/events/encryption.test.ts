import { NDKEvent } from ".";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";

const PRIVATE_KEY_1_FOR_TESTING = '1fbc12b81e0b21f10fb219e88dd76fc80c7aa5369779e44e762fec6f460d6a89';
const PRIVATE_KEY_2_FOR_TESTING = "d30b946562050e6ced827113da15208730879c46547061b404434edff63236fa";


describe("NDKEvent encryption (Nip44 & Nip59)", ()=>{

  it("encrypts and decrypts an NDKEvent using Nip44", async () => {
    const senderSigner = new NDKPrivateKeySigner(PRIVATE_KEY_1_FOR_TESTING);
    const senderUser = await senderSigner.user();
    const recipientSigner = new NDKPrivateKeySigner(PRIVATE_KEY_2_FOR_TESTING);
    const recipientUser = await recipientSigner.user();

    const sendEvent: NDKEvent = new NDKEvent (new NDK(), {
        pubkey: senderUser.pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: "Test content",
        kind: 1,
    });

    const original = sendEvent.content
    await sendEvent.encrypt(recipientUser, senderSigner,'nip44');
    const recieveEvent = new NDKEvent(new NDK(), sendEvent.rawEvent())
    await recieveEvent.decrypt(senderUser, recipientSigner,'nip44');
    const decrypted = recieveEvent.content

    expect(decrypted).toBe(original);
  });

  it("gift wraps and unwraps an NDKEvent using Nip59", async () => {
    const sendsigner = new NDKPrivateKeySigner(PRIVATE_KEY_1_FOR_TESTING)
    const senduser = await sendsigner.user();
    const recievesigner = new NDKPrivateKeySigner(PRIVATE_KEY_2_FOR_TESTING)
    const recieveuser = await recievesigner.user();
  
    let message = new NDKEvent(new NDK(),{
      kind : 1,
      pubkey : senduser.pubkey,
      content : "hello world",
      created_at : new Date().valueOf(),
      tags : []
    })
  
    // console.log('MESSAGE EVENT : '+ JSON.stringify(message.rawEvent()))
    const wrapped = await message.giftWrap(recieveuser,sendsigner);
    // console.log('MESSAGE EVENT WRAPPED : '+ JSON.stringify(wrapped.rawEvent()))
    const unwrapped = await wrapped.giftUnwrap(senduser,recievesigner)
    // console.log('MESSAGE EVENT UNWRAPPED : '+ JSON.stringify(unwrapped?.rawEvent())) 
    expect(unwrapped).toBe(message) 
  });

})
