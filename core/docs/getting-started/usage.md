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

The simplest (but not advised) way to get NDK to connect to relays is to specify them:

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

Different ways to connect to relays are explained in the [connecting](/core/docs/fundamentals/connecting.md) section.


