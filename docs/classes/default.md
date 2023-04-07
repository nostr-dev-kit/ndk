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
- [relayPool](default.md#relaypool)
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

[src/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L42)

## Properties

### cacheAdapter

• `Optional` **cacheAdapter**: [`NDKCacheAdapter`](../interfaces/NDKCacheAdapter.md)

#### Defined in

[src/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L39)

___

### debug

• **debug**: `Debugger`

#### Defined in

[src/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L40)

___

### relayPool

• **relayPool**: `NDKPool`

#### Defined in

[src/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L37)

___

### signer

• `Optional` **signer**: `NDKSigner`

#### Defined in

[src/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L38)

## Methods

### assertSigner

▸ **assertSigner**(): `Promise`<`void`\>

Ensures that a signer is available to sign an event.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:134](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L134)

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

[src/index.ts:61](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L61)

___

### fetchEvent

▸ **fetchEvent**(`filter`, `opts?`): `Promise`<[`NDKEvent`](NDKEvent.md)\>

Fetch a single event

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | `Filter` |
| `opts` | `NDKFilterOptions` |

#### Returns

`Promise`<[`NDKEvent`](NDKEvent.md)\>

#### Defined in

[src/index.ts:97](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L97)

___

### fetchEvents

▸ **fetchEvents**(`filter`, `opts?`): `Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

Fetch events

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | `Filter` |
| `opts` | `NDKFilterOptions` |

#### Returns

`Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Defined in

[src/index.ts:110](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L110)

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

[src/index.ts:72](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L72)

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

[src/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L88)

___

### subscribe

▸ **subscribe**(`filter`, `opts?`): [`NDKSubscription`](NDKSubscription.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | `Filter` |
| `opts?` | `NDKSubscriptionOptions` |

#### Returns

[`NDKSubscription`](NDKSubscription.md)

#### Defined in

[src/index.ts:78](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/index.ts#L78)
