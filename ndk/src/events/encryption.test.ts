import { NDKPrivateKeySigner } from "../signers/private-key";
import { NDKNip46Signer } from "../signers/nip46";
import { NDKEvent, NostrEvent } from ".";
import { NDK } from "../ndk";
import { NDKNip07Signer } from "../signers/nip07";
import { NDKSigner } from "../signers";
import { NDKUser } from "../user";
import { NDKRelaySet } from "../relay/sets";
import { NDKKind } from "./kinds";
import { giftUnwrap, giftWrap } from "./gift-wrapping";

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

  it("encrypts and decrypts an NDKEvent forcing Nip04 decryption, if the event kind is 4", async () => {
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners();
    const sendEvent: NDKEvent = new NDKEvent (new NDK(), {
        pubkey: sendUser.pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: "Test content",
        kind: 4,
    });

    const original = sendEvent.content
    await sendEvent.encrypt(receiveUser, sendSigner, 'nip04');
    const receiveEvent = new NDKEvent(new NDK(), sendEvent.rawEvent())
    // Despite of specifying Nip44 here, the event kind 4 forces Nip04 encryption
    await receiveEvent.decrypt(sendUser, receiveSigner, 'nip44');
    const decrypted = receiveEvent.content

    expect(decrypted).toBe(original);
  });

  it("encrypts and decrypts an NDKEvent using Nip17", async () => {
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners();
    const ndk = new NDK({ signer: sendSigner });
    const message: NDKEvent = new NDKEvent (ndk, {
        pubkey: sendUser.pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: "Hello Nip17!",
    });
    message.tags.push(["p", receiveUser.pubkey]);

    const encrypted = await giftWrap(message, receiveUser, sendSigner);
    const decrypted = await giftUnwrap(encrypted, sendUser, receiveSigner);
    expect(decrypted.content).toBe(message.content);
    expect(decrypted.pubkey).toBe(sendUser.pubkey);
    expect(decrypted.kind).toBe(NDKKind.PrivateDirectMessage);
    expect(decrypted.tagValue("p")).toBe(receiveUser.pubkey);
    expect(encrypted.tagValue("p")).toBe(receiveUser.pubkey);
    expect(encrypted.kind).toBe(NDKKind.GiftWrap);
  });

  it("decrypts examples from Nip17 spec", async () => {
    const senderPk = "nsec1w8udu59ydjvedgs3yv5qccshcj8k05fh3l60k9x57asjrqdpa00qkmr89m";
    const receiverPk = "nsec12ywtkplvyq5t6twdqwwygavp5lm4fhuang89c943nf2z92eez43szvn4dt";
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners(senderPk, receiverPk);
    const ndk = new NDK({ signer: sendSigner });
    const encryptedForReceiver: NDKEvent = new NDKEvent (ndk, {
      "id":"2886780f7349afc1344047524540ee716f7bdc1b64191699855662330bf235d8",
      "pubkey":"8f8a7ec43b77d25799281207e1a47f7a654755055788f7482653f9c9661c6d51",
      "created_at":1703128320,
      "kind":1059,
      "tags":[["p", "918e2da906df4ccd12c8ac672d8335add131a4cf9d27ce42b3bb3625755f0788"]],
      "content":`AsqzdlMsG304G8h08bE67dhAR1gFTzTckUUyuvndZ8LrGCvwI4pgC3d6hyAK0Wo9gtkLqSr2rT2RyHlE5wRqbCOlQ8WvJEKwqwIJwT5PO3l2RxvGCHDbd1b1o40ZgIVwwLCfOWJ86I5upXe8K5AgpxYTOM1BD+SbgI5jOMA8tgpRoitJedVSvBZsmwAxXM7o7sbOON4MXHzOqOZpALpS2zgBDXSAaYAsTdEM4qqFeik+zTk3+L6NYuftGidqVluicwSGS2viYWr5OiJ1zrj1ERhYSGLpQnPKrqDaDi7R1KrHGFGyLgkJveY/45y0rv9aVIw9IWF11u53cf2CP7akACel2WvZdl1htEwFu/v9cFXD06fNVZjfx3OssKM/uHPE9XvZttQboAvP5UoK6lv9o3d+0GM4/3zP+yO3C0NExz1ZgFmbGFz703YJzM+zpKCOXaZyzPjADXp8qBBeVc5lmJqiCL4solZpxA1865yPigPAZcc9acSUlg23J1dptFK4n3Tl5HfSHP+oZ/QS/SHWbVFCtq7ZMQSRxLgEitfglTNz9P1CnpMwmW/Y4Gm5zdkv0JrdUVrn2UO9ARdHlPsW5ARgDmzaxnJypkfoHXNfxGGXWRk0sKLbz/ipnaQP/eFJv/ibNuSfqL6E4BnN/tHJSHYEaTQ/PdrA2i9laG3vJti3kAl5Ih87ct0w/tzYfp4SRPhEF1zzue9G/16eJEMzwmhQ5Ec7jJVcVGa4RltqnuF8unUu3iSRTQ+/MNNUkK6Mk+YuaJJs6Fjw6tRHuWi57SdKKv7GGkr0zlBUU2Dyo1MwpAqzsCcCTeQSv+8qt4wLf4uhU9Br7F/L0ZY9bFgh6iLDCdB+4iABXyZwT7Ufn762195hrSHcU4Okt0Zns9EeiBOFxnmpXEslYkYBpXw70GmymQfJlFOfoEp93QKCMS2DAEVeI51dJV1e+6t3pCSsQN69Vg6jUCsm1TMxSs2VX4BRbq562+VffchvW2BB4gMjsvHVUSRl8i5/ZSDlfzSPXcSGALLHBRzy+gn0oXXJ/447VHYZJDL3Ig8+QW5oFMgnWYhuwI5QSLEyflUrfSz+Pdwn/5eyjybXKJftePBD9Q+8NQ8zulU5sqvsMeIx/bBUx0fmOXsS3vjqCXW5IjkmSUV7q54GewZqTQBlcx+90xh/LSUxXex7UwZwRnifvyCbZ+zwNTHNb12chYeNjMV7kAIr3cGQv8vlOMM8ajyaZ5KVy7HpSXQjz4PGT2/nXbL5jKt8Lx0erGXsSsazkdoYDG3U`,
      "sig":"a3c6ce632b145c0869423c1afaff4a6d764a9b64dedaf15f170b944ead67227518a72e455567ca1c2a0d187832cecbde7ed478395ec4c95dd3e71749ed66c480"
    });

    const decryptedReceiver = await giftUnwrap(encryptedForReceiver, receiveUser, receiveSigner);
    expect(decryptedReceiver.content).toBe("Hola, que tal?");

    const encryptedForSender: NDKEvent = new NDKEvent (ndk, {
      "id":"162b0611a1911cfcb30f8a5502792b346e535a45658b3a31ae5c178465509721",
      "pubkey":"626be2af274b29ea4816ad672ee452b7cf96bbb4836815a55699ae402183f512",
      "created_at":1702711587,
      "kind":1059,
      "tags":[["p", "44900586091b284416a0c001f677f9c49f7639a55c3f1e2ec130a8e1a7998e1b"]],
      "content":"AsTClTzr0gzXXji7uye5UB6LYrx3HDjWGdkNaBS6BAX9CpHa+Vvtt5oI2xJrmWLen+Fo2NBOFazvl285Gb3HSM82gVycrzx1HUAaQDUG6HI7XBEGqBhQMUNwNMiN2dnilBMFC3Yc8ehCJT/gkbiNKOpwd2rFibMFRMDKai2mq2lBtPJF18oszKOjA+XlOJV8JRbmcAanTbEK5nA/GnG3eGUiUzhiYBoHomj3vztYYxc0QYHOx0WxiHY8dsC6jPsXC7f6k4P+Hv5ZiyTfzvjkSJOckel1lZuE5SfeZ0nduqTlxREGeBJ8amOykgEIKdH2VZBZB+qtOMc7ez9dz4wffGwBDA7912NFS2dPBr6txHNxBUkDZKFbuD5wijvonZDvfWq43tZspO4NutSokZB99uEiRH8NAUdGTiNb25m9JcDhVfdmABqTg5fIwwTwlem5aXIy8b66lmqqz2LBzJtnJDu36bDwkILph3kmvaKPD8qJXmPQ4yGpxIbYSTCohgt2/I0TKJNmqNvSN+IVoUuC7ZOfUV9lOV8Ri0AMfSr2YsdZ9ofV5o82ClZWlWiSWZwy6ypa7CuT1PEGHzywB4CZ5ucpO60Z7hnBQxHLiAQIO/QhiBp1rmrdQZFN6PUEjFDloykoeHe345Yqy9Ke95HIKUCS9yJurD+nZjjgOxZjoFCsB1hQAwINTIS3FbYOibZnQwv8PXvcSOqVZxC9U0+WuagK7IwxzhGZY3vLRrX01oujiRrevB4xbW7Oxi/Agp7CQGlJXCgmRE8Rhm+Vj2s+wc/4VLNZRHDcwtfejogjrjdi8p6nfUyqoQRRPARzRGUnnCbh+LqhigT6gQf3sVilnydMRScEc0/YYNLWnaw9nbyBa7wFBAiGbJwO40k39wj+xT6HTSbSUgFZzopxroO3f/o4+ubx2+IL3fkev22mEN38+dFmYF3zE+hpE7jVxrJpC3EP9PLoFgFPKCuctMnjXmeHoiGs756N5r1Mm1ffZu4H19MSuALJlxQR7VXE/LzxRXDuaB2u9days/6muP6gbGX1ASxbJd/ou8+viHmSC/ioHzNjItVCPaJjDyc6bv+gs1NPCt0qZ69G+JmgHW/PsMMeL4n5bh74g0fJSHqiI9ewEmOG/8bedSREv2XXtKV39STxPweceIOh0k23s3N6+wvuSUAJE7u1LkDo14cobtZ/MCw/QhimYPd1u5HnEJvRhPxz0nVPz0QqL/YQeOkAYk7uzgeb2yPzJ6DBtnTnGDkglekhVzQBFRJdk740LEj6swkJ",
      "sig":"c94e74533b482aa8eeeb54ae72a5303e0b21f62909ca43c8ef06b0357412d6f8a92f96e1a205102753777fd25321a58fba3fb384eee114bd53ce6c06a1c22bab"
    });

    const decryptedSender = await giftUnwrap(encryptedForSender, sendUser, sendSigner);
    expect(decryptedSender.content).toBe("Hola, que tal?");
  });

  it("gift wraps and unwraps an NDKEvent using a private key signer according to Nip59", async () => {
    const { sendSigner, sendUser, receiveSigner, receiveUser } = await createPKSigners();
    const message = createDirectMessage(sendUser.pubkey, receiveUser.pubkey);
  
    const wrapped = await giftWrap(message, receiveUser, sendSigner);
    const unwrapped = await giftUnwrap(wrapped, sendUser, receiveSigner);
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
    const wrapped = await giftWrap(message, receiveUser, send07Signer);
    const unwrapped = await giftUnwrap(wrapped, sendUser, receiveSigner); 
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
    const wrapped = await giftWrap(message, receiveUser, receive07Signer);
    const unwrapped = await giftUnwrap(wrapped, sendUser, receiveSigner); 
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
    
    const wrapped = await giftWrap(message, receiveUser, send46Signer);
    expect(mockSendRequest.mock.calls[0][1]).toBe("nip44_encrypt"); 
    await giftWrap(message, receiveUser, send46Signer, { scheme: "nip04"});
    expect(mockSendRequest.mock.calls[2][1]).toBe("nip04_encrypt");
  });
});

async function createPKSigners(senderPk: string = PRIVATE_KEY_1_FOR_TESTING, receiverPk: string = PRIVATE_KEY_2_FOR_TESTING)
: Promise<{sendSigner: NDKSigner, sendUser: NDKUser, receiveSigner: NDKSigner, receiveUser: NDKUser}> {
  const sendPKSigner = new NDKPrivateKeySigner(senderPk);
  const sendUser = await sendPKSigner.user();
  const receivePKSigner = new NDKPrivateKeySigner(receiverPk);
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
