[NDK](../README.md) / [Exports](../modules.md) / default

# Class: default

The base NDK class, contains several helper
methods to help access common use cases faster.

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

[src/index.ts:65](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L65)

## Properties

### cacheAdapter

• `Optional` **cacheAdapter**: [`NDKCacheAdapter`](../interfaces/NDKCacheAdapter.md)

#### Defined in

[src/index.ts:59](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L59)

___

### debug

• **debug**: `Debugger`

#### Defined in

[src/index.ts:60](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L60)

___

### delayedSubscriptions

• **delayedSubscriptions**: `Map`<`string`, [`NDKSubscription`](NDKSubscription.md)[]\>

#### Defined in

[src/index.ts:63](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L63)

___

### devWriteRelaySet

• `Optional` **devWriteRelaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Defined in

[src/index.ts:61](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L61)

___

### pool

• **pool**: `NDKPool`

#### Defined in

[src/index.ts:57](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L57)

___

### signer

• `Optional` **signer**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Defined in

[src/index.ts:58](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L58)

## Methods

### assertSigner

▸ **assertSigner**(): `Promise`<`void`\>

Ensures that a signer is available to sign an event.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:205](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L205)

___

### connect

▸ **connect**(`timeoutMs?`): `Promise`<`void`\>

Connect to relays with optional timeout.
If the timeout is reached, the connection will be continued to be established in the background.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `timeoutMs?` | `number` | an optional timeout in milliseconds |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:84](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L84)

___

### fetchEvent

▸ **fetchEvent**(`id`): `Promise`<``null`` \| [`NDKEvent`](NDKEvent.md)\>

Fetch a single event. There are two ways to use this method. You can either pass
a nip-19 id (e.g. note1...) or you can pass a filter and filter options.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | A nip-19 id. |

#### Returns

`Promise`<``null`` \| [`NDKEvent`](NDKEvent.md)\>

Promise<NDKEvent | null> will resolve to null if no event is found from the specified relays.

#### Defined in

[src/index.ts:141](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L141)

▸ **fetchEvent**(`filter`, `opts`): `Promise`<``null`` \| [`NDKEvent`](NDKEvent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`NDKFilter`](../modules.md#ndkfilter) |
| `opts` | [`NDKFilterOptions`](../interfaces/NDKFilterOptions.md) |

#### Returns

`Promise`<``null`` \| [`NDKEvent`](NDKEvent.md)\>

#### Defined in

[src/index.ts:142](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L142)

___

### fetchEvents

▸ **fetchEvents**(`filter`, `opts?`): `Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

Fetch all events based on a filter. Will disconnect upon receiving EOSE from relays.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`NDKFilter`](../modules.md#ndkfilter) | An NDKFilter object |
| `opts` | [`NDKFilterOptions`](../interfaces/NDKFilterOptions.md) | An NDKFilterOptions object |

#### Returns

`Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

Promise<Set<NDKEvent>>

#### Defined in

[src/index.ts:178](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L178)

___

### getUser

▸ **getUser**(`opts`): [`NDKUser`](NDKUser.md)

Get a NDKUser object

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | [`GetUserParams`](../interfaces/GetUserParams.md) | A GetUserParams object |

#### Returns

[`NDKUser`](NDKUser.md)

NDKUser object

#### Defined in

[src/index.ts:94](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L94)

___

### publish

▸ **publish**(`event`, `relaySet?`): `Promise`<`void`\>

Publish an event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) | an NDKE object of the event to publish |
| `relaySet?` | [`NDKRelaySet`](NDKRelaySet.md) | - |

#### Returns

`Promise`<`void`\>

Promise<void>

#### Defined in

[src/index.ts:124](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L124)

___

### subscribe

▸ **subscribe**(`filter`, `opts?`, `relaySet?`): [`NDKSubscription`](NDKSubscription.md)

Create a new subscription. Subscriptions automatically start and finish when all relays
on the set send back an EOSE (set `opts.closeOnEose` to `false` in order avoid this).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`NDKFilter`](../modules.md#ndkfilter) | NDKFilter object |
| `opts?` | [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md) | NDKSubscriptionOptions object |
| `relaySet?` | [`NDKRelaySet`](NDKRelaySet.md) | explicit relay set to use |

#### Returns

[`NDKSubscription`](NDKSubscription.md)

NDKSubscription

#### Defined in

[src/index.ts:108](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/index.ts#L108)
