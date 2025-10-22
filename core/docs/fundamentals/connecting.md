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
advised ways of connecting to relays. We strongly advise you to use the "[Outbox Model](/core/fundamentals/connecting.html#outbox-model)" in addition or replacement of specifying explicit relays.
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
([NIP-65](https://nostr-nips.com/nip-65)) and add discovered relays specified to a 2nd pool of connected relays.

<<< @/core/docs/snippets/connect_nip07.ts

### Outbox Model

Outbox (previously known as [the Gossip Model](https://mikedilger.com/gossip-model/)) is a more elaborate way of
dynamically connecting to relays based on who you are interacting with.
More about [the outbox model](https://how-nostr-works.pages.dev/#/outbox).

The outbox model works similarly to the web/RSS model:

- **Outbox Relays**: You post your content to your own designated relays
- **Inbox Relays**: You designate relays where you want to receive messages
- **Dynamic Discovery**: Clients discover and connect to relays based on where users actually post

The protocol is formalized in ([NIP-65](https://nostr-nips.com/nip-65)), which defines:

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

## Connection Events

```typescript
// Main pool events
ndk.pool.on("relay:connecting", (relay: NDKRelay) => {
    console.log(`⟳ [Main Pool] Connecting to relay: ${relay.url}`);
});

ndk.pool.on("relay:connect", (relay: NDKRelay) => {
    connectedRelays.add(relay.url);
    console.log(`✓ [Main Pool] Connected to relay: ${relay.url}`);
    console.log(`Total connected relays: ${connectedRelays.size}`);
});

ndk.pool.on("relay:disconnect", (relay: NDKRelay) => {
    connectedRelays.delete(relay.url);
    console.log(`✗ [Main Pool] Disconnected from relay: ${relay.url}`);
    console.log(`Total connected relays: ${connectedRelays.size}`);
});
```


