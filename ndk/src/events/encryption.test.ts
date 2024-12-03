import { NDKPrivateKeySigner } from "../signers/private-key";
import { NDKNip46Signer } from "../signers/nip46";
import { NDKEvent, NostrEvent } from ".";
import { NDK } from "../ndk";
import { NDKNip07Signer } from "../signers/nip07";
import { NDKSigner } from "../signers";
import { NDKUser } from "../user";

const PRIVATE_KEY_1_FOR_TESTING = '1fbc12b81e0b21f10fb219e88dd76fc80c7aa5369779e44e762fec6f460d6a89';
const PRIVATE_KEY_2_FOR_TESTING = "d30b946562050e6ced827113da15208730879c46547061b404434edff63236fa";


describe("NDKEvent encryption (Nip44 & Nip59)", () => {
  it("encrypts and decrypts an NDKEvent using Nip44", async () => {
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners();
    const sendEvent: NDKEvent = new NDKEvent (new NDK(), {
        pubkey: sendUser.pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: "Test content",
        kind: 1,
    });

    const original = sendEvent.content
    await sendEvent.encrypt(receiveUser, sendSigner,'nip44');
    const receiveEvent = new NDKEvent(new NDK(), sendEvent.rawEvent())
    await receiveEvent.decrypt(sendUser, receiveSigner,'nip44');
    const decrypted = receiveEvent.content

    expect(decrypted).toBe(original);
  });

  it("gift wraps and unwraps an NDKEvent using a private key signer according to Nip59", async () => {
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners();
    const message = createDirectMessage(sendUser.pubkey, receiveUser.pubkey);
  
    const wrapped = await message.giftWrap(receiveUser,sendSigner);
    const unwrapped = await wrapped.giftUnwrap(wrapped.author, receiveSigner);
    message.id = unwrapped?.id || "";
    expect(JSON.stringify(unwrapped)).toBe(JSON.stringify(message)); 
  });

  it("gift wraps and unwraps an NDKEvent using a Nip07 signer for sending according to Nip59", async () => {
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners();
    const message = createDirectMessage(sendUser.pubkey, receiveUser.pubkey);

    /** @ts-ignore */
    globalThis.window = { ...globalThis.window,
      nostr: {
        getPublicKey: () => Promise.resolve(sendUser.pubkey),
        signEvent: async (e: NostrEvent) => Promise.resolve({ sig: await sendSigner.sign(e) }),
        nip44: createNip44(sendSigner, receiveSigner),
      }
    };    

    const send07Signer = new NDKNip07Signer();
    const wrapped = await message.giftWrap(receiveUser, send07Signer);
    const unwrapped = await wrapped.giftUnwrap(wrapped.author, receiveSigner); 
    message.id = unwrapped?.id || "";
    expect(JSON.stringify(unwrapped)).toBe(JSON.stringify(message)); 
  });

  it("gift wraps and unwraps an NDKEvent using a Nip07 signer for receiving according to Nip59", async () => {
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners();
    const message = createDirectMessage(sendUser.pubkey, receiveUser.pubkey);

    /** @ts-ignore */
    globalThis.window = { ...globalThis.window,
      nostr: {
        getPublicKey: () => Promise.resolve(receiveUser.pubkey),
        signEvent: async (e: NostrEvent) => Promise.resolve({ sig: await receiveSigner.sign(e) }),
        nip44: createNip44(sendSigner, receiveSigner),
      }
    };    

    const receive07Signer = new NDKNip07Signer();
    const wrapped = await message.giftWrap(receiveUser, sendSigner);
    const unwrapped = await wrapped.giftUnwrap(wrapped.author, receive07Signer); 
    message.id = unwrapped?.id || "";
    expect(JSON.stringify(unwrapped)).toBe(JSON.stringify(message)); 
  });

  it("gift wrapping using a Nip46 signer according to Nip59 for both Nip04 and Nip44 encryption", async () => {
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners();
    const message = createDirectMessage(sendUser.pubkey, receiveUser.pubkey);
    
    const send46Signer = new NDKNip46Signer(new NDK(), `bunker://example.com?pubkey=${sendUser.pubkey}`, sendSigner);
    const mockSendRequest = jest.fn().mockImplementation((_remotePubkey, method, _params, _kind, cb) => {
      if (method.includes("_encrypt")) {
        cb({ result: "encrypted" });
      } if (method.includes("_decrypt")) {
        cb({ result: `{ "pubkey": "${sendUser.pubkey}", "content": "Hello" }` });
      } else {
        cb({ result: "{\"sig\": \"signature\"}" });
      }
    });
    send46Signer.rpc.sendRequest = mockSendRequest;
    
    const wrapped = await message.giftWrap(receiveUser, send46Signer);
    expect(mockSendRequest.mock.calls[0][1]).toBe("nip44_encrypt"); 
    await message.giftWrap(receiveUser, send46Signer, { encryptionNip: "nip04"});
    expect(mockSendRequest.mock.calls[2][1]).toBe("nip04_encrypt");
    await wrapped.giftUnwrap(wrapped.author, send46Signer);
    expect(mockSendRequest.mock.calls[4][1]).toBe("nip44_decrypt");
    await wrapped.giftUnwrap(wrapped.author, send46Signer, "nip04");
    expect(mockSendRequest.mock.calls[6][1]).toBe("nip04_decrypt");
  });
});

async function createPKSigners(): Promise<{sendSigner: NDKSigner, sendUser: NDKUser, receiveSigner: NDKSigner, receiveUser: NDKUser}> {
  const sendPKSigner = new NDKPrivateKeySigner(PRIVATE_KEY_1_FOR_TESTING);
  const sendUser = await sendPKSigner.user();
  const receivePKSigner = new NDKPrivateKeySigner(PRIVATE_KEY_2_FOR_TESTING);
  const receiveUser = await receivePKSigner.user();
  return {
    sendSigner: sendPKSigner,
    sendUser,
    receiveSigner: receivePKSigner,
    receiveUser
  };
}

function createDirectMessage(senderPubkey: string, receiverPubkey: string): NDKEvent {
  const message = new NDKEvent(new NDK(), {
    kind: 14,
    pubkey: senderPubkey,
    content: "hello world",
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  });
  message.tags.push(["p", receiverPubkey]);

  return message;
}

function createNip44(sendSigner: NDKSigner, receiveSigner: NDKSigner) {
  return {
    encrypt: (receiverHexPubkey: string, value: string) => {
      const receiver = new NDKUser({ hexpubkey: receiverHexPubkey });
      return sendSigner.encrypt(receiver, value, 'nip44');
    },
    decrypt: (senderHexPubKey: string, value: string) => {
      const sender = new NDKUser({ hexpubkey: senderHexPubKey });
      return receiveSigner.decrypt(sender, value, 'nip44');
    },
  }
}
