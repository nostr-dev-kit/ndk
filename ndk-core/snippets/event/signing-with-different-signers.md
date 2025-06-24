# Signing events with different signers

NDK uses the default signer `ndk.signer` to sign events.

But you can specify the use of a different signer to sign with different pubkeys.

```ts
import { NDKPrivateKeySigner, NDKEvent } from "@nostr-dev-kit/ndk";

const signer1 = NDKPrivateKeySigner.generate();
const pubkey1 = signer1.pubkey;

const event1 = new NDKEvent();
event1.kind = 1;
event1.content = "Hello world";
await event1.sign(signer1);

event1.pubkey === pubkey1; // true

const signer2 = NDKPrivateKeySigner.generate();
const pubkey2 = signer2.pubkey;

const event2 = new NDKEvent();
event2.kind = 1;
event2.content = "Hello world";
await event2.sign(signer2);

event2.pubkey === pubkey2; // true
```
