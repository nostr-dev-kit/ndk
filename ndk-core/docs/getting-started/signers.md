# Signers

NDK uses signers _optionally_ passed in to sign events. Note that it is possible to use NDK without signing events (e.g. [to get someone's profile](https://github.com/nostr-dev-kit/ndk-cli/blob/master/src/commands/profile.ts)).

Signing adapters can be passed in when NDK is instantiated or later during runtime.

### Using a NIP-07 browser extension (e.g. Alby, nos2x)

Instatiate NDK with a NIP-07 signer

```ts
// Import the package, NIP-07 signer and NDK event
import NDK, { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";

const nip07signer = new NDKNip07Signer();
const ndk = new NDK({ signer: nip07signer });
```

NDK can now ask for permission, via their NIP-07 extension, to...

**Read the user's public key**

```ts
nip07signer.user().then(async (user) => {
    if (!!user.npub) {
        console.log("Permission granted to read their public key:", user.npub);
    }
});
```

**Sign & publish events**

```ts
const ndkEvent = new NDKEvent(ndk);
ndkEvent.kind = 1;
ndkEvent.content = "Hello, world!";
ndkEvent.publish(); // This will trigger the extension to ask the user to confirm signing.
```