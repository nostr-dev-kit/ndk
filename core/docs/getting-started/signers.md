# Signers

NDK uses signers _optionally_ passed in to sign events. Note that it is possible to use NDK without signing events (
e.g. [to get someone's profile](https://github.com/nostr-dev-kit/ndk-cli/blob/master/src/commands/profile.ts)).

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

### Using a Private Key Signer

NDK provides `NDKPrivateKeySigner` for managing in-memory private keys. This is useful for development, testing, or
applications that manage keys locally.

#### Basic Usage

```ts
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// Generate a new private key
const signer = NDKPrivateKeySigner.generate();
console.log("nsec:", signer.nsec);
console.log("npub:", signer.npub);

// Or load from an existing key
const signer = new NDKPrivateKeySigner("nsec1...");
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
