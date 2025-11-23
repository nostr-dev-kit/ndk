# Connecting

This section will briefly explain the different mechanmisms through which NDK can connect to relays.

## Connecting

Connecting to relays in itself is super easy.

```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";

// ... set up signer, specify relays, ...

await ndk.connect(); // [!code focus]
```

On connection changes NDK will emit
[a number of connection events](/core/docs/fundamentals/connecting.html#connection-events).

## Connection types

::: tip
Because NOSTR is decentralized and comprised of thousands of relays, it's important to read up on the
advised ways of connecting to relays. We advise you to use
the "[Outbox Model](/core/fundamentals/connecting.html#outbox-model)"
in addition or as a replacement for specifying explicit relays.
:::

### Specific Relays

The simplest way to get NDK to connect to relays is to specify them:

<<< @/core/docs/snippets/connect_explicit.ts

Make sure to wait for the `connect()` promise to resolve before using NDK after which
you can start interacting with relays.

Explicit relays can also be added using the `addExplicitRelay()` method.

<<< @/core/docs/snippets/connect_explicit_alt.ts

### User preferred relays

A [signer](/core/getting-started/signers.html) is used to sign events and tells NDK about your pubkey and related
settings. Once you
link up a signer and you have `autoConnectUserRelays` enabled (on by default) NDK will fetch your `kind:10002` event
([NIP-65](https://github.com/nostr-protocol/nips/blob/master/65.md)) and add discovered relays specified to a 2nd pool
of connected relays.

<<< @/core/docs/snippets/connect_nip07.ts

### Outbox Model

Outbox (previously known as [the Gossip Model](https://mikedilger.com/gossip-model/)) is a more elaborate way of
dynamically connecting to relays based on who you are interacting with.
More about [the outbox model](https://how-nostr-works.pages.dev/#/outbox).

The outbox model works similarly to the web/RSS model:

- **Outbox Relays**: You post your content to your own designated relays
- **Inbox Relays**: You designate relays where you want to receive messages
- **Dynamic Discovery**: Clients discover and connect to relays based on where users actually post

The protocol is formalized in ([NIP-65](https://github.com/nostr-protocol/nips/blob/master/65.md)), which defines:

- **`kind:10002` events**: Relay list metadata containing read/write relay preferences
- **Relay tags**: "r" tags with optional "read"/"write" markers
- **Fallback to Kind 3**: Contact list events can contain relay information in their content

By enabling `enableOutboxModel` (off by default) NDK will add an extra `outboxPool` to the ndk pool AND (@TODO Explain)

https://primal.net/e/nevent1qqs2txvkjpa6fdlhxdtqmyk2tzzchpaa4vrfgx7h20539u5k9lzgqwgfjnlen

### Dev Write Relays

During local development you might want to specify a list of relays to write to. THis can be done by using
`devWriteRelayUrls` which will

<<< @/core/docs/snippets/connect_dev_relays.ts

This will write new events to those relays only. Note that if you have provided relays in
`explicitRelayUrls` these will also be used to write events to.

## Relay Sets

Under the hood NDK uses different sets of relays to send and receive messages. You can tap into that pool logic by
using the `NDKPool` class.

<<< @/core/docs/snippets/connect_pools.ts

Note that if you have outbox enabled you will have an extra pool in the `ndk.pools` array reserved for user provided
relays.

## Authentication

([NIP-42](https://github.com/nostr-protocol/nips/blob/master/42.md)) defines that relays can request authentication from
clients. NDK uses an `NDKAuthPolicy` callback to provide a way to handle authentication requests.

* Relays can have specific `NDKAuthPolicy` functions.
* NDK can be configured with a default `relayAuthDefaultPolicy` function.
* NDK provides some generic policies:
    * `NDKAuthPolicies.signIn`: Authenticate to the relay (using the `ndk.signer` signer).
    * `NDKAuthPolicies.disconnect`: Immediately disconnect from the relay if asked to authenticate.

<<< @/core/docs/snippets/connect_auth.ts

Clients should typically allow their users to choose where to authenticate. This can be accomplished by returning the
decision the user made from the `NDKAuthPolicy` function.

```ts
import NDK, {NDKRelayAuthPolicies} from "@nostr-dev-kit/ndk";

const ndk = new NDK();
ndk.relayAuthDefaultPolicy = (relay: NDKRelay) => {
    return confirm(`Authenticate to ${relay.url}?`);
};
```

## Connection Events

There are a number of events you can hook into to get information about relay connection
status

<<< @/core/docs/snippets/connection_events.ts

## Code Snippets

More snippets and examples can be found in the [snippets directory](/docs/snippets.md#connecting)