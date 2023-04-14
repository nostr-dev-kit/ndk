[NDK](../README.md) / [Exports](../modules.md) / NDKSubscription

# Class: NDKSubscription

Represents a subscription to an NDK event stream.

 NDKSubscription#event
Emitted when an event is received by the subscription.

**`Param`**

The event received by the subscription.

**`Param`**

The relay that received the event.

**`Param`**

The subscription that received the event.

 NDKSubscription#event:dup
Emitted when a duplicate event is received by the subscription.

**`Param`**

The duplicate event received by the subscription.

**`Param`**

The relay that received the event.

**`Param`**

The time elapsed since the first time the event was seen.

**`Param`**

The subscription that received the event.

 NDKSubscription#eose - Emitted when all relays have reached the end of the event stream.

**`Param`**

The subscription that received EOSE.

 NDKSubscription#close - Emitted when the subscription is closed.

**`Param`**

The subscription that was closed.

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
- [stop](NDKSubscription.md#stop)

## Constructors

### constructor

• **new NDKSubscription**(`ndk`, `filter`, `opts?`, `relaySet?`, `subId?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk` | [`default`](default.md) |
| `filter` | `Filter` |
| `opts?` | [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md) |
| `relaySet?` | [`NDKRelaySet`](NDKRelaySet.md) |
| `subId?` | `string` |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/subscription/index.ts:66](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L66)

## Properties

### filter

• `Readonly` **filter**: `Filter`

#### Defined in

[src/subscription/index.ts:59](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L59)

___

### ndk

• **ndk**: [`default`](default.md)

#### Defined in

[src/subscription/index.ts:62](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L62)

___

### opts

• `Optional` `Readonly` **opts**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

#### Defined in

[src/subscription/index.ts:60](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L60)

___

### relaySet

• `Optional` **relaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Defined in

[src/subscription/index.ts:61](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L61)

___

### relaySubscriptions

• **relaySubscriptions**: `Map`<[`NDKRelay`](NDKRelay.md), `Sub`\>

#### Defined in

[src/subscription/index.ts:63](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L63)

___

### subId

• `Readonly` **subId**: `string`

#### Defined in

[src/subscription/index.ts:58](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L58)

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

[src/subscription/index.ts:209](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L209)

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

[src/subscription/index.ts:180](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L180)

___

### start

▸ **start**(): `Promise`<`void`\>

Start the subscription. This is the main method that should be called
after creating a subscription.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/subscription/index.ts:111](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L111)

___

### stop

▸ **stop**(): `void`

#### Returns

`void`

#### Defined in

[src/subscription/index.ts:143](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/subscription/index.ts#L143)
