**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKRelaySet

# Class: NDKRelaySet

A relay set is a group of relays. This grouping can be short-living, for a single
REQ or can be long-lasting, for example for the explicit relay list the user
has specified.

Requests to relays should be sent through this interface.

## Constructors

### new NDKRelaySet(relays, ndk)

> **new NDKRelaySet**(`relays`, `ndk`): [`NDKRelaySet`](NDKRelaySet.md)

#### Parameters

• **relays**: `Set`\<[`NDKRelay`](NDKRelay.md)\>

• **ndk**: [`default`](default.md)

#### Returns

[`NDKRelaySet`](NDKRelaySet.md)

#### Source

[ndk/src/relay/sets/index.ts:26](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/sets/index.ts#L26)

## Properties

### relays

> **`readonly`** **relays**: `Set`\<[`NDKRelay`](NDKRelay.md)\>

#### Source

[ndk/src/relay/sets/index.ts:22](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/sets/index.ts#L22)

## Methods

### addRelay()

> **addRelay**(`relay`): `void`

Adds a relay to this set.

#### Parameters

• **relay**: [`NDKRelay`](NDKRelay.md)

#### Returns

`void`

#### Source

[ndk/src/relay/sets/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/sets/index.ts#L35)

***

### publish()

> **publish**(`event`, `timeoutMs`?): `Promise`\<`Set`\<[`NDKRelay`](NDKRelay.md)\>\>

Publish an event to all relays in this set. Returns the number of relays that have received the event.

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

• **timeoutMs?**: `number`

timeout in milliseconds for each publish operation and connection operation

#### Returns

`Promise`\<`Set`\<[`NDKRelay`](NDKRelay.md)\>\>

A set where the event was successfully published to

#### Source

[ndk/src/relay/sets/index.ts:71](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/sets/index.ts#L71)

***

### size()

> **size**(): `number`

#### Returns

`number`

#### Source

[ndk/src/relay/sets/index.ts:111](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/sets/index.ts#L111)

***

### fromRelayUrls()

> **`static`** **fromRelayUrls**(`relayUrls`, `ndk`): [`NDKRelaySet`](NDKRelaySet.md)

Creates a relay set from a list of relay URLs.

If no connection to the relay is found in the pool it will temporarily
connect to it.

#### Parameters

• **relayUrls**: `string`[]

list of relay URLs to include in this set

• **ndk**: [`default`](default.md)

#### Returns

[`NDKRelaySet`](NDKRelaySet.md)

NDKRelaySet

#### Source

[ndk/src/relay/sets/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/sets/index.ts#L49)
