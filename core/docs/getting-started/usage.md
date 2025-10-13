# Usage

Instructions on how to get started with NDK. 
If you're using [React](/react/README.html) or [Svelte](/svelte/README.html) make sure to check out the wrapper section 
of the documentation.

## Instantiate

To start using NDK, you need to create an instance of it.


```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance
const ndk = new NDK();
```

This by itself won't do much as there are no connected relays but there might be cases
where you want to have a NDK instance without connecting to any relays.

## Connecting to Relays

This section will briefly explain the different mechanmisms through which NDK can connect to relays.

### Specify Relays

The simplest way to get NDK to connect to relays is to specify them:

```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["wss://a.relay", "wss://another.relay"],
});

// Now connect to specified relays
await ndk.connect();
```

Make sure to wait for the `connect()` promise to resolve before using NDK after which
you can start interacting with relays.

Explicit relays can also be added using the `addExplicitRelay()` method.

```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK();

ndk.addExplicitRelay("wss://a.relay");
ndk.addExplicitRelay("wss://another.relay");

// Now connect to specified relays
await ndk.connect();
```

### Using a Signer

A [signer](/core/getting-started/signers.html) is used to sign events. You could say it's some sort of an 
authentication mechanism. If the attached signer implements the `getRelays()` method, those relays will be used as 
the explicit relays.

```ts
// Import NDK + NIP07 signer
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

// Create a new NDK instance with signer (provided the signer implements the getRelays() method)
const nip07signer = new NDKNip07Signer();
const ndk = new NDK({ signer: nip07signer });
```

### Outbox Model

Explain why how.

## Additional Resources

There is much more to NDK and Nostr 


