**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKConstructorParams

# Interface: NDKConstructorParams

## Properties

### autoConnectUserRelays?

> **autoConnectUserRelays**?: `boolean`

Auto-connect to main user's relays. The "main" user is determined
by the presence of a signer. Upon connection to the explicit relays,
the user's relays will be fetched and connected to if this is set to true.

#### Default

```ts
true
```

#### Source

[ndk/src/ndk/index.ts:55](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L55)

***

### autoFetchUserMutelist?

> **autoFetchUserMutelist**?: `boolean`

Automatically fetch user's mutelist

#### Default

```ts
true
```

#### Source

[ndk/src/ndk/index.ts:61](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L61)

***

### blacklistRelayUrls?

> **blacklistRelayUrls**?: `string`[]

Relays we should never connect to

#### Source

[ndk/src/ndk/index.ts:32](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L32)

***

### cacheAdapter?

> **cacheAdapter**?: [`NDKCacheAdapter`](NDKCacheAdapter.md)

Cache adapter to use for caching events

#### Source

[ndk/src/ndk/index.ts:71](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L71)

***

### clientName?

> **clientName**?: `string`

Client name to add to events' tag

#### Source

[ndk/src/ndk/index.ts:86](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L86)

***

### clientNip89?

> **clientNip89**?: `string`

Client nip89 to add to events' tag

#### Source

[ndk/src/ndk/index.ts:91](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L91)

***

### debug?

> **debug**?: `Debugger`

Debug instance to use

#### Source

[ndk/src/ndk/index.ts:76](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L76)

***

### devWriteRelayUrls?

> **devWriteRelayUrls**?: `string`[]

When this is set, we always write only to this relays.

#### Source

[ndk/src/ndk/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L37)

***

### enableOutboxModel?

> **enableOutboxModel**?: `boolean`

Enable outbox model (defaults to false)

#### Source

[ndk/src/ndk/index.ts:47](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L47)

***

### explicitRelayUrls?

> **explicitRelayUrls**?: `string`[]

Relays we should explicitly connect to

#### Source

[ndk/src/ndk/index.ts:27](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L27)

***

### mutedIds?

> **mutedIds**?: `Map`\<`string`, `string`\>

Muted pubkeys and eventIds

#### Source

[ndk/src/ndk/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L81)

***

### outboxRelayUrls?

> **outboxRelayUrls**?: `string`[]

Outbox relay URLs.

#### Source

[ndk/src/ndk/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L42)

***

### relayAuthDefaultPolicy?

> **relayAuthDefaultPolicy**?: [`NDKAuthPolicy`](../type-aliases/NDKAuthPolicy.md)

Default relay-auth policy

#### Source

[ndk/src/ndk/index.ts:96](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L96)

***

### signer?

> **signer**?: [`NDKSigner`](NDKSigner.md)

Signer to use for signing events by default

#### Source

[ndk/src/ndk/index.ts:66](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L66)
