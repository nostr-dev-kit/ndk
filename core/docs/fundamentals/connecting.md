# Connecting

This section will briefly explain the different mechanmisms through which NDK can connect to relays. 


::: tip
Because NOSTR is decentralized and comprised of thousands of relays, it's important to read up on the 
advised ways of connecting to relays.

We strongly advise you to use the "[Outbox Model](/core/fundamentals/connecting.html#outbox-model)" in addition or replacement of specifying explicit relays.
:::

## Specify Relays

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

## Using a Signer

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

## Outbox Model

https://mikedilger.com/gossip-model/
https://how-nostr-works.pages.dev/#/outbox
https://github.com/nostr-protocol/nips/blob/master/65.md
https://primal.net/e/nevent1qqs2txvkjpa6fdlhxdtqmyk2tzzchpaa4vrfgx7h20539u5k9lzgqwgfjnlen

Explain why how.


