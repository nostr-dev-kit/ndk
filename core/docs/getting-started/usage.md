# Usage

## Quick Start

A simple example of how to use NDK in a Node.js application:

<<< @/core/docs/snippets/examples/quick-start-with-guardrails.ts

## NDK Usage

### Instantiate NDK

You can pass an object with several options to a newly created instance of NDK.

- `explicitRelayUrls` – an array of relay URLs.
- `signer` - an instance of a signer ([signer documentation](/core/docs/fundamentals/signers.md)).
- `cacheAdapter` - an instance of a cache adapter.
- `debug` - debugger instance ([debugging documentation](/core/docs/getting-started/debugging.md)).

<<< @/core/docs/snippets/initialise.ts

Note: In normal client use, it's best practice to instantiate NDK as a singleton
class. [See more below](#architecture-decisions--suggestions).

### Connecting

After you've instantiated NDK, you need to tell it to connect before you'll be able to interact with any relays.

<<< @/core/docs/snippets/connecting.ts

### Using NIP-19 Identifiers

NDK re-exports [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) from the
[nostr-tools library](https://github.com/nbd-wtf/nostr-tools) which provides different utilities for encoding and
decoding Nostr identifiers:

<<< @/core/docs/snippets/nip-19-identifiers.ts

### Managing Users

NDK provides flexible ways to fetch user objects, including support for
[NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) encoded identifiers
and [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) addresses:

<<< @/core/docs/snippets/user-fetching.ts

Note: `fetchUser` is async and returns a Promise. For [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md)
lookups, it may return `undefined` if the address cannot be resolved.

See the [NIP-19 tutorial](/core/docs/tutorial/nip19.md) for comprehensive examples and use cases.

## Framework Integrations

If you're planning to use `NDK` in a react framework, check out the documentation for these specific packages:

* [@nostr-dev-kit/react](/react/README.md): Hooks and utilities to integrate NDK into a React applications
* [@nostr-dev-kit/svelte](/svelte/README.md): Modern, performant, and beautiful Svelte 5 integration
