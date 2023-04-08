[NDK](../README.md) / [Exports](../modules.md) / NDKSubscription

# Class: NDKSubscription

Represents a subscription to an NDK event stream.

 NDKSubscription#event
Emitted when an event is received by the subscription.

**`Param`**

The event received by the subscription.

**`Param`**

The relay that received the event.

 NDKSubscription#event:dup
Emitted when a duplicate event is received by the subscription.

**`Param`**

The duplicate event received by the subscription.

**`Param`**

The relay that received the event.

**`Param`**

The time elapsed since the first time the event was seen.

 NDKSubscription#eose - Emitted when all relays have reached the end of the event stream.

## Hierarchy

- `EventEmitter`

  ↳ **`NDKSubscription`**

## Table of contents

### Constructors

- [constructor](NDKSubscription.md#constructor)

### Properties

- [filter](NDKSubscription.md#filter)
- [ndk](NDKSubscription.md#ndk)
- [opts](NDKSubscription.md#opts)
- [relaySet](NDKSubscription.md#relayset)
- [relaySubscriptions](NDKSubscription.md#relaysubscriptions)
- [subId](NDKSubscription.md#subid)

### Methods

- [eoseReceived](NDKSubscription.md#eosereceived)
- [eventReceived](NDKSubscription.md#eventreceived)
- [start](NDKSubscription.md#start)

## Constructors

### constructor

• **new NDKSubscription**(`ndk`, `filter`, `opts?`, `relaySet?`, `subId?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk` | [`default`](default.md) |
| `filter` | `Filter` |
| `opts?` | `NDKSubscriptionOptions` |
| `relaySet?` | `NDKRelaySet` |
| `subId?` | `string` |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/subscription/index.ts:60](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L60)

## Properties

### filter

• `Readonly` **filter**: `Filter`

#### Defined in

[src/subscription/index.ts:53](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L53)

___

### ndk

• **ndk**: [`default`](default.md)

#### Defined in

[src/subscription/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L56)

___

### opts

• `Optional` `Readonly` **opts**: `NDKSubscriptionOptions`

#### Defined in

[src/subscription/index.ts:54](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L54)

___

### relaySet

• `Optional` **relaySet**: `NDKRelaySet`

#### Defined in

[src/subscription/index.ts:55](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L55)

___

### relaySubscriptions

• **relaySubscriptions**: `Map`<[`NDKRelay`](NDKRelay.md), `Sub`\>

#### Defined in

[src/subscription/index.ts:57](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L57)

___

### subId

• `Readonly` **subId**: `string`

#### Defined in

[src/subscription/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L52)

## Methods

### eoseReceived

▸ **eoseReceived**(`relay`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `relay` | [`NDKRelay`](NDKRelay.md) |

#### Returns

`void`

#### Defined in

[src/subscription/index.ts:198](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L198)

___

### eventReceived

▸ **eventReceived**(`event`, `relay`, `fromCache?`): `void`

Called when an event is received from a relay or the cache

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) | `undefined` |  |
| `relay` | `undefined` \| [`NDKRelay`](NDKRelay.md) | `undefined` |  |
| `fromCache` | `boolean` | `false` | Whether the event was received from the cache |

#### Returns

`void`

#### Defined in

[src/subscription/index.ts:169](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L169)

___

### start

▸ **start**(): `Promise`<`void`\>

Start the subscription. This is the main method that should be called
after creating a subscription.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/subscription/index.ts:105](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/subscription/index.ts#L105)
