### Remote Signer

A Nostr remote signer is an application or device that securely stores your private key and signs Nostr events on
your behalf, preventing you from having to expose the key clients.

It works by establishing a secure connection, as described in [NIP-46](https://nostr-nips.com/nip-46), with a Nostr
client and then receiving signing requests via push notifications to approve or deny.

#### bunker://

* Create a `NDKNip46Signer`, optionally providing the local signer if you are restoring a connection that was already
  generated in your app:

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

The `nostrconnect://` flow is the reverse of the `bunker://` flow; the app generates a connection string and is sent to
the signer out of band (such as scanning a QR code).

```ts
const relay = 'wss://relay.primal.net'; // choose a relay to be used to communicate with the signer
const localNsec = `nsec1....`; // Restore this from whatever storage your app is using, if you have it

// instantiate the signer
const signer = NDKNip46Signer.nostrconnect(ndk, relay, localNsec, {
    name: "<your-app-name>",
    icon: "<your-app-icon>",
    perms: ['sign_event:1,sign_event:30023'] // permissions to request (e.g. sign event kind:1 and kind:30023)
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
import {NDKPrivateKeySigner} from "@nostr-dev-kit/ndk";

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
import {nip49} from "@nostr-dev-kit/ndk";
import {hexToBytes, bytesToHex} from "@noble/hashes/utils";

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
await ndkEvent.sign(); // [!code focus]
```

## Combining signers

You can specify the use of a different signer to sign with different pubkeys.

<<< @/core/docs/snippets/sign_event_with_other_signers.ts

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
import {NDKPrivateKeySigner} from "@nostr-dev-kit/ndk";

// Generate a new private key
const signer = NDKPrivateKeySigner.generate();
console.log("nsec:", signer.nsec);
console.log("npub:", signer.npub);
```


