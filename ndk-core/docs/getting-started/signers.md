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

### Using a Remote Signer (NIP-46)

#### bunker://
* Create a `NDKNip46Signer`, optionally providing the local signer if you are restoring a connection that was already generated in your app:

```ts
const signerConnectionString = 'bunker://....'; // ask the user for the bunker connection string
const localNsec = `nsec1....`; // Restore this from whatever storage your app is using, if you have it
const signer = NDKNip46Signer.bunker(ndk, signerConnectionString, localNsec);
const user = await signer.blockUntilReady();

console.log("Welcome", user.npub);

// if you didn't have a localNsec you should store it for future sessions of your app
save(signer.localSigner.nsec)
```

#### nostrconnect://
The `nostrconnect://` flow is the reverse of the `bunker://` flow; the app generates a connection string and is sent to the signer out of band (such as scanning a QR code).

```ts
const relay = 'wss://relay.primal.net'; // choose a relay to be used to communicate with the signer
const localNsec = `nsec1....`; // Restore this from whatever storage your app is using, if you have it

// instantiate the signer
const signer = NDKNip46Signer.nostrconnect(ndk, relay, localNsec, {
    name: "<your-app-name>",
    icon: "<your-app-icon>",
    perms: [ 'sign_event:1,sign_event:30023' ] // permissions to request (e.g. sign event kind:1 and kind:30023)
});

// Open the signer or show the signer.nostrConnectUri URI as a QR code
open(signer.nostrConnectUri);

// Wait for the user to connect
const user = await signer.blockUntilReady();

console.log("Welcome", user.npub);

// if you didn't have a localNsec you should store it for future sessions of your app
save(signer.localSigner.nsec)
```