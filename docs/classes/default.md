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
- [devWriteRelaySet](default.md#devwriterelayset)
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

[src/index.ts:57](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L57)

## Properties

### cacheAdapter

• `Optional` **cacheAdapter**: [`NDKCacheAdapter`](../interfaces/NDKCacheAdapter.md)

#### Defined in

[src/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L51)

___

### debug

• **debug**: `Debugger`

#### Defined in

[src/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L52)

___

### delayedSubscriptions

• **delayedSubscriptions**: `Map`<`string`, [`NDKSubscription`](NDKSubscription.md)[]\>

#### Defined in

[src/index.ts:55](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L55)

___

### devWriteRelaySet

• `Optional` **devWriteRelaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Defined in

[src/index.ts:53](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L53)

___

### pool

• **pool**: `NDKPool`

#### Defined in

[src/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L49)

___

### signer

• `Optional` **signer**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Defined in

[src/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L50)

## Methods

### assertSigner

▸ **assertSigner**(): `Promise`<`void`\>

Ensures that a signer is available to sign an event.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:169](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L169)

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

[src/index.ts:75](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L75)

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

[src/index.ts:132](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L132)

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

[src/index.ts:145](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L145)

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

[src/index.ts:86](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L86)

___

### publish

▸ **publish**(`event`, `relaySet?`): `Promise`<`void`\>

Publish an event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) | event to publish |
| `relaySet?` | [`NDKRelaySet`](NDKRelaySet.md) | - |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:117](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L117)

___

### subscribe

▸ **subscribe**(`filter`, `opts?`, `relaySet?`): [`NDKSubscription`](NDKSubscription.md)

Create a new subscription. Subscriptions automatically start and finish when all relays
on the set send back an EOSE. (set `opts.closeOnEose` to `false` in order avoid this)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Filter` |  |
| `opts?` | [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md) |  |
| `relaySet?` | [`NDKRelaySet`](NDKRelaySet.md) | explicit relay set to use |

#### Returns

[`NDKSubscription`](NDKSubscription.md)

NDKSubscription

#### Defined in

[src/index.ts:101](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/index.ts#L101)
