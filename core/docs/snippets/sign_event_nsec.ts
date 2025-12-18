import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const privateKeySigner = NDKPrivateKeySigner.generate();
const ndk = new NDK({ signer: privateKeySigner });

const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "Hello world";
await event.sign();
