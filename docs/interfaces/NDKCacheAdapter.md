[NDK](../README.md) / [Exports](../modules.md) / NDKCacheAdapter

# Interface: NDKCacheAdapter

## Table of contents

### Properties

- [locking](NDKCacheAdapter.md#locking)

### Methods

- [query](NDKCacheAdapter.md#query)
- [setEvent](NDKCacheAdapter.md#setevent)

## Properties

### locking

• **locking**: `boolean`

Whether this cache adapter is expected to be fast.
If this is true, the cache will be queried before the relays.
When this is false, the cache will be queried in addition to the relays.

#### Defined in

[src/cache/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/cache/index.ts#L10)

## Methods

### query

▸ **query**(`subscription`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscription` | [`NDKSubscription`](../classes/NDKSubscription.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/cache/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/cache/index.ts#L12)

___

### setEvent

▸ **setEvent**(`event`, `filter`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](../classes/NDKEvent.md) |
| `filter` | `Filter` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/cache/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/cache/index.ts#L13)
