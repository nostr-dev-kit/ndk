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

[src/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L56)

## Properties

### cacheAdapter

• `Optional` **cacheAdapter**: [`NDKCacheAdapter`](../interfaces/NDKCacheAdapter.md)

#### Defined in

[src/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L50)

___

### debug

• **debug**: `Debugger`

#### Defined in

[src/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L51)

___

### delayedSubscriptions

• **delayedSubscriptions**: `Map`<`string`, [`NDKSubscription`](NDKSubscription.md)[]\>

#### Defined in

[src/index.ts:54](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L54)

___

### devWriteRelaySet

• `Optional` **devWriteRelaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Defined in

[src/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L52)

___

### pool

• **pool**: `NDKPool`

#### Defined in

[src/index.ts:48](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L48)

___

### signer

• `Optional` **signer**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Defined in

[src/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L49)

## Methods

### assertSigner

▸ **assertSigner**(): `Promise`<`void`\>

Ensures that a signer is available to sign an event.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:186](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L186)

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

[src/index.ts:74](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L74)

___

### fetchEvent

▸ **fetchEvent**(`id`): `Promise`<``null`` \| [`NDKEvent`](NDKEvent.md)\>

Fetch a single event

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| [`NDKEvent`](NDKEvent.md)\>

#### Defined in

[src/index.ts:128](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L128)

▸ **fetchEvent**(`filter`, `opts`): `Promise`<``null`` \| [`NDKEvent`](NDKEvent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`NDKFilter`](../modules.md#ndkfilter) |
| `opts` | [`NDKFilterOptions`](../interfaces/NDKFilterOptions.md) |

#### Returns

`Promise`<``null`` \| [`NDKEvent`](NDKEvent.md)\>

#### Defined in

[src/index.ts:129](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L129)

___

### fetchEvents

▸ **fetchEvents**(`filter`, `opts?`): `Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

Fetch events

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`NDKFilter`](../modules.md#ndkfilter) |
| `opts` | [`NDKFilterOptions`](../interfaces/NDKFilterOptions.md) |

#### Returns

`Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Defined in

[src/index.ts:159](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L159)

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

[src/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L85)

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

[src/index.ts:116](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L116)

___

### subscribe

▸ **subscribe**(`filter`, `opts?`, `relaySet?`): [`NDKSubscription`](NDKSubscription.md)

Create a new subscription. Subscriptions automatically start and finish when all relays
on the set send back an EOSE. (set `opts.closeOnEose` to `false` in order avoid this)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`NDKFilter`](../modules.md#ndkfilter) |  |
| `opts?` | [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md) |  |
| `relaySet?` | [`NDKRelaySet`](NDKRelaySet.md) | explicit relay set to use |

#### Returns

[`NDKSubscription`](NDKSubscription.md)

NDKSubscription

#### Defined in

[src/index.ts:100](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/index.ts#L100)
