[NDK](../README.md) / [Exports](../modules.md) / default

# Class: default

## Hierarchy

- `EventEmitter`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](default.md#constructor)

### Properties

- [cacheAdapter](default.md#cacheadapter)
- [debug](default.md#debug)
- [pool](default.md#pool)
- [signer](default.md#signer)

### Methods

- [assertSigner](default.md#assertsigner)
- [connect](default.md#connect)
- [fetchEvent](default.md#fetchevent)
- [fetchEvents](default.md#fetchevents)
- [getUser](default.md#getuser)
- [publish](default.md#publish)
- [subscribe](default.md#subscribe)

## Constructors

### constructor

• **new default**(`opts?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`NDKConstructorParams`](../interfaces/NDKConstructorParams.md) |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/index.ts:45](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L45)

## Properties

### cacheAdapter

• `Optional` **cacheAdapter**: [`NDKCacheAdapter`](../interfaces/NDKCacheAdapter.md)

#### Defined in

[src/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L42)

___

### debug

• **debug**: `Debugger`

#### Defined in

[src/index.ts:43](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L43)

___

### pool

• **pool**: `NDKPool`

#### Defined in

[src/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L40)

___

### signer

• `Optional` **signer**: `NDKSigner`

#### Defined in

[src/index.ts:41](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L41)

## Methods

### assertSigner

▸ **assertSigner**(): `Promise`<`void`\>

Ensures that a signer is available to sign an event.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:137](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L137)

___

### connect

▸ **connect**(`timeoutMs?`): `Promise`<`void`\>

Connect to relays with optional timeout.
If the timeout is reached, the connection will be continued to be established in the background.

#### Parameters

| Name | Type |
| :------ | :------ |
| `timeoutMs?` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:64](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L64)

___

### fetchEvent

▸ **fetchEvent**(`filter`, `opts?`): `Promise`<[`NDKEvent`](NDKEvent.md)\>

Fetch a single event

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | `Filter` |
| `opts` | [`NDKFilterOptions`](../interfaces/NDKFilterOptions.md) |

#### Returns

`Promise`<[`NDKEvent`](NDKEvent.md)\>

#### Defined in

[src/index.ts:100](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L100)

___

### fetchEvents

▸ **fetchEvents**(`filter`, `opts?`): `Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

Fetch events

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | `Filter` |
| `opts` | [`NDKFilterOptions`](../interfaces/NDKFilterOptions.md) |

#### Returns

`Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Defined in

[src/index.ts:113](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L113)

___

### getUser

▸ **getUser**(`opts`): [`NDKUser`](NDKUser.md)

Get a NDKUser object

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`GetUserParams`](../interfaces/GetUserParams.md) |

#### Returns

[`NDKUser`](NDKUser.md)

#### Defined in

[src/index.ts:75](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L75)

___

### publish

▸ **publish**(`event`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:91](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L91)

___

### subscribe

▸ **subscribe**(`filter`, `opts?`): [`NDKSubscription`](NDKSubscription.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | `Filter` |
| `opts?` | [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md) |

#### Returns

[`NDKSubscription`](NDKSubscription.md)

#### Defined in

[src/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/index.ts#L81)
