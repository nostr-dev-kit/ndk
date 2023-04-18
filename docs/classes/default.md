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
- [delayedSubscriptions](default.md#delayedsubscriptions)
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

[src/index.ts:48](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L48)

## Properties

### cacheAdapter

• `Optional` **cacheAdapter**: [`NDKCacheAdapter`](../interfaces/NDKCacheAdapter.md)

#### Defined in

[src/index.ts:43](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L43)

___

### debug

• **debug**: `Debugger`

#### Defined in

[src/index.ts:44](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L44)

___

### delayedSubscriptions

• **delayedSubscriptions**: `Map`<`string`, [`NDKSubscription`](NDKSubscription.md)[]\>

#### Defined in

[src/index.ts:46](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L46)

___

### pool

• **pool**: `NDKPool`

#### Defined in

[src/index.ts:41](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L41)

___

### signer

• `Optional` **signer**: `NDKSigner`

#### Defined in

[src/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L42)

## Methods

### assertSigner

▸ **assertSigner**(): `Promise`<`void`\>

Ensures that a signer is available to sign an event.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:141](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L141)

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

[src/index.ts:68](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L68)

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

[src/index.ts:104](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L104)

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

[src/index.ts:117](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L117)

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

[src/index.ts:79](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L79)

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

[src/index.ts:95](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L95)

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

[src/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/index.ts#L85)
