# Class: default

## Hierarchy

- `EventEmitter`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/default#constructor)

### Properties

- [cacheAdapter](../wiki/default#cacheadapter)
- [debug](../wiki/default#debug)
- [delayedSubscriptions](../wiki/default#delayedsubscriptions)
- [devWriteRelaySet](../wiki/default#devwriterelayset)
- [pool](../wiki/default#pool)
- [signer](../wiki/default#signer)

### Methods

- [assertSigner](../wiki/default#assertsigner)
- [connect](../wiki/default#connect)
- [fetchEvent](../wiki/default#fetchevent)
- [fetchEvents](../wiki/default#fetchevents)
- [getUser](../wiki/default#getuser)
- [publish](../wiki/default#publish)
- [subscribe](../wiki/default#subscribe)

## Constructors

### constructor

• **new default**(`opts?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`NDKConstructorParams`](../wiki/NDKConstructorParams) |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L56)

## Properties

### cacheAdapter

• `Optional` **cacheAdapter**: [`NDKCacheAdapter`](../wiki/NDKCacheAdapter)

#### Defined in

[src/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L50)

___

### debug

• **debug**: `Debugger`

#### Defined in

[src/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L51)

___

### delayedSubscriptions

• **delayedSubscriptions**: `Map`<`string`, [`NDKSubscription`](../wiki/NDKSubscription)[]\>

#### Defined in

[src/index.ts:54](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L54)

___

### devWriteRelaySet

• `Optional` **devWriteRelaySet**: [`NDKRelaySet`](../wiki/NDKRelaySet)

#### Defined in

[src/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L52)

___

### pool

• **pool**: `NDKPool`

#### Defined in

[src/index.ts:48](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L48)

___

### signer

• `Optional` **signer**: [`NDKSigner`](../wiki/NDKSigner)

#### Defined in

[src/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L49)

## Methods

### assertSigner

▸ **assertSigner**(): `Promise`<`void`\>

Ensures that a signer is available to sign an event.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:192](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L192)

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

[src/index.ts:74](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L74)

___

### fetchEvent

▸ **fetchEvent**(`id`): `Promise`<``null`` \| [`NDKEvent`](../wiki/NDKEvent)\>

Fetch a single event

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| [`NDKEvent`](../wiki/NDKEvent)\>

#### Defined in

[src/index.ts:130](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L130)

▸ **fetchEvent**(`filter`, `opts`): `Promise`<``null`` \| [`NDKEvent`](../wiki/NDKEvent)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`NDKFilter`](../wiki/Exports#ndkfilter) |
| `opts` | [`NDKFilterOptions`](../wiki/NDKFilterOptions) |

#### Returns

`Promise`<``null`` \| [`NDKEvent`](../wiki/NDKEvent)\>

#### Defined in

[src/index.ts:131](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L131)

___

### fetchEvents

▸ **fetchEvents**(`filter`, `opts?`): `Promise`<`Set`<[`NDKEvent`](../wiki/NDKEvent)\>\>

Fetch events

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`NDKFilter`](../wiki/Exports#ndkfilter) |
| `opts` | [`NDKFilterOptions`](../wiki/NDKFilterOptions) |

#### Returns

`Promise`<`Set`<[`NDKEvent`](../wiki/NDKEvent)\>\>

#### Defined in

[src/index.ts:163](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L163)

___

### getUser

▸ **getUser**(`opts`): [`NDKUser`](../wiki/NDKUser)

Get a NDKUser object

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`GetUserParams`](../wiki/GetUserParams) |

#### Returns

[`NDKUser`](../wiki/NDKUser)

#### Defined in

[src/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L85)

___

### publish

▸ **publish**(`event`, `relaySet?`): `Promise`<`void`\>

Publish an event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NDKEvent`](../wiki/NDKEvent) | event to publish |
| `relaySet?` | [`NDKRelaySet`](../wiki/NDKRelaySet) | - |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:118](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L118)

___

### subscribe

▸ **subscribe**(`filter`, `opts?`, `relaySet?`, `autoStart?`): [`NDKSubscription`](../wiki/NDKSubscription)

Create a new subscription. Subscriptions automatically start and finish when all relays
on the set send back an EOSE. (set `opts.closeOnEose` to `false` in order avoid this)

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `filter` | [`NDKFilter`](../wiki/Exports#ndkfilter) | `undefined` |  |
| `opts?` | [`NDKSubscriptionOptions`](../wiki/NDKSubscriptionOptions) | `undefined` |  |
| `relaySet?` | [`NDKRelaySet`](../wiki/NDKRelaySet) | `undefined` | explicit relay set to use |
| `autoStart` | `boolean` | `true` | automatically start the subscription |

#### Returns

[`NDKSubscription`](../wiki/NDKSubscription)

NDKSubscription

#### Defined in

[src/index.ts:101](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/index.ts#L101)
