# Signers

All events on the Nostr protocol are signed through a keypair 
(described in [NIP-01](https://nostr-nips.com/nip-01#events-and-signatures)).

In NDK this is taken care of by the `NDKSigner` interface that can be passed in during initialization or later during
runtime.

## Different Signing Methods

### Browser Extensions

A common way to use NDK is to use a browser extension which is described in [NIP-07](https://nostr-nips.com/nip-07). 
This mechanism allows the user to sign events with a browser extension to not share their private key 
with the application. 

The most used browser extensions are [Nos2x](https://github.com/fiatjaf/nos2x) and [Alby](https://getalby.com/alby-extension).

```ts
// Import the package, NIP-07 signer and NDK event
import NDK, { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";

const signer = new NDKNip07Signer();
const ndk = new NDK({ signer });
```

Anytime you call `sign()` or `publish()` on an [NDK Event](/core/docs/fundamentals/events.html) the browser
extension will prompt the user to sign the event.

### Private Key Signer

NDK provides `NDKPrivateKeySigner` for managing in-memory private keys. This is useful for development, testing, or applications that manage keys locally.

> [!WARNING]
> We strongly recommend not using this in production. Requiring users to share their private key is a security
> risk and should be avoided in favor of using [a browser extension](/core/docs/fundamentals/signers.html#browser-extensions) 
> or [a remote signer](/core/docs/fundamentals/signers.html#remote-signer).

The private key signer takes the private key in the `nsec` format.

```ts
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// Generate a new private key
const signer = NDKPrivateKeySigner.generate();
console.log("nsec:", signer.nsec);
console.log("npub:", signer.npub);
```

This library can also [help with generating new keys](/core/docs/fundamentals/signers.html#generate-keys).


### Remote Signer

(NIP-46)

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

#### Password-Protected Keys (NIP-49)

NDK supports NIP-49 encrypted private keys (ncryptsec format) for secure storage:

```ts
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// Encrypt a private key with a password
const signer = NDKPrivateKeySigner.generate();
const password = "user-chosen-password";
const ncryptsec = signer.encryptToNcryptsec(password);

// Store ncryptsec securely (e.g., in localStorage)
localStorage.setItem("encrypted_key", ncryptsec);

// Later, restore the signer from encrypted key
const storedKey = localStorage.getItem("encrypted_key");
const restoredSigner = NDKPrivateKeySigner.fromNcryptsec(storedKey, password);
console.log("Restored pubkey:", restoredSigner.pubkey);
```

**Security Parameters:**

The `encryptToNcryptsec` method accepts optional parameters for security tuning:

```ts
// Higher security (slower, more resistant to brute force)
const ncryptsec = signer.encryptToNcryptsec(password, 20); // log_n = 20 (~2 seconds, 1GB memory)

// Default security (faster)
const ncryptsec = signer.encryptToNcryptsec(password, 16); // log_n = 16 (~100ms, 64MB memory)

// With key security byte (0x00, 0x01, or 0x02)
const ncryptsec = signer.encryptToNcryptsec(password, 16, 0x02);
```

**Direct NIP-49 utilities:**

NDK also re-exports NIP-49 utilities for advanced use cases:

```ts
import { nip49 } from "@nostr-dev-kit/ndk";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils";

// Encrypt raw bytes
const privateKeyBytes = hexToBytes("14c226dbdd865d5e...");
const ncryptsec = nip49.encrypt(privateKeyBytes, password);

// Decrypt to raw bytes
const decryptedBytes = nip49.decrypt(ncryptsec, password);
```

## Sign Events

Once the signer is initialized, you can use it to sign and [publish](/core/docs/fundamentals/publishing.html) events:

```ts
const ndkEvent = new NDKEvent(ndk);
ndkEvent.kind = 1;
ndkEvent.content = "Hello, world!";
await ndkEvent.sign();
```

## Read Public key


**Read the user's public key**

```ts
nip07signer.user().then(async (user) => {
    if (!!user.npub) {
        console.log("Permission granted to read their public key:", user.npub);
    }
});
```

## Generate Keys

Perhaps the only time we really want you to use the `NDKPrivateKeySigner` is to help you generate new keys as the signer
provides helper methods to do just that:

```ts
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// Generate a new private key
const signer = NDKPrivateKeySigner.generate();
console.log("nsec:", signer.nsec);
console.log("npub:", signer.npub);
```


