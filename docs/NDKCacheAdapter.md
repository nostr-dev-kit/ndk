# Interface: NDKCacheAdapter

## Table of contents

### Properties

- [locking](../wiki/NDKCacheAdapter#locking)

### Methods

- [query](../wiki/NDKCacheAdapter#query)
- [setEvent](../wiki/NDKCacheAdapter#setevent)

## Properties

### locking

• **locking**: `boolean`

Whether this cache adapter is expected to be fast.
If this is true, the cache will be queried before the relays.
When this is false, the cache will be queried in addition to the relays.

#### Defined in

[src/cache/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/cache/index.ts#L10)

## Methods

### query

▸ **query**(`subscription`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscription` | [`NDKSubscription`](../wiki/NDKSubscription) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/cache/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/cache/index.ts#L12)

___

### setEvent

▸ **setEvent**(`event`, `filter`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](../wiki/NDKEvent) |
| `filter` | [`NDKFilter`](../wiki/Exports#ndkfilter) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/cache/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/cache/index.ts#L13)
