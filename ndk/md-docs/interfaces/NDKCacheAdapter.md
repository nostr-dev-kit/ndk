**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKCacheAdapter

# Interface: NDKCacheAdapter

## Properties

### locking

> **locking**: `boolean`

Whether this cache adapter is expected to be fast.
If this is true, the cache will be queried before the relays.
When this is false, the cache will be queried in addition to the relays.

#### Source

[ndk/src/cache/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/cache/index.ts#L13)

## Methods

### fetchProfile()?

> **`optional`** **fetchProfile**(`pubkey`): `Promise`\<`null` \| [`NDKUserProfile`](NDKUserProfile.md)\>

Special purpose

#### Parameters

• **pubkey**: `string`

#### Returns

`Promise`\<`null` \| [`NDKUserProfile`](NDKUserProfile.md)\>

#### Source

[ndk/src/cache/index.ts:21](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/cache/index.ts#L21)

***

### loadNip05()?

> **`optional`** **loadNip05**(`nip05`): `Promise`\<`null` \| [`ProfilePointer`](../type-aliases/ProfilePointer.md)\>

#### Parameters

• **nip05**: `string`

#### Returns

`Promise`\<`null` \| [`ProfilePointer`](../type-aliases/ProfilePointer.md)\>

#### Source

[ndk/src/cache/index.ts:24](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/cache/index.ts#L24)

***

### query()

> **query**(`subscription`): `Promise`\<`void`\>

#### Parameters

• **subscription**: [`NDKSubscription`](../classes/NDKSubscription.md)

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/cache/index.ts:15](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/cache/index.ts#L15)

***

### saveNip05()?

> **`optional`** **saveNip05**(`nip05`, `profile`): `void`

#### Parameters

• **nip05**: `string`

• **profile**: [`ProfilePointer`](../type-aliases/ProfilePointer.md)

#### Returns

`void`

#### Source

[ndk/src/cache/index.ts:25](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/cache/index.ts#L25)

***

### saveProfile()?

> **`optional`** **saveProfile**(`pubkey`, `profile`): `void`

#### Parameters

• **pubkey**: `string`

• **profile**: [`NDKUserProfile`](NDKUserProfile.md)

#### Returns

`void`

#### Source

[ndk/src/cache/index.ts:22](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/cache/index.ts#L22)

***

### setEvent()

> **setEvent**(`event`, `filters`, `relay`?): `Promise`\<`void`\>

#### Parameters

• **event**: [`NDKEvent`](../classes/NDKEvent.md)

• **filters**: [`NDKFilter`](../type-aliases/NDKFilter.md)[]

• **relay?**: [`NDKRelay`](../classes/NDKRelay.md)

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/cache/index.ts:16](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/cache/index.ts#L16)
