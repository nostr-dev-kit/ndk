import NDK, { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";

const nip07signer = new NDKNip07Signer();
const ndk = new NDK({ signer: nip07signer });

const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "Hello world";
await event.sign();
