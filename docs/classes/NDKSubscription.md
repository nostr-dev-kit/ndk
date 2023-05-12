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

  ↳↳ [`NDKSubscriptionGroup`](NDKSubscriptionGroup.md)

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
- [groupableId](NDKSubscription.md#groupableid)
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

[src/subscription/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L88)

## Properties

### filter

• `Readonly` **filter**: `Filter`

#### Defined in

[src/subscription/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L81)

___

### ndk

• **ndk**: [`default`](default.md)

#### Defined in

[src/subscription/index.ts:84](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L84)

___

### opts

• `Readonly` **opts**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

#### Defined in

[src/subscription/index.ts:82](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L82)

___

### relaySet

• `Optional` **relaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Defined in

[src/subscription/index.ts:83](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L83)

___

### relaySubscriptions

• **relaySubscriptions**: `Map`<[`NDKRelay`](NDKRelay.md), `Sub`\>

#### Defined in

[src/subscription/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L85)

___

### subId

• `Readonly` **subId**: `string`

#### Defined in

[src/subscription/index.ts:80](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L80)

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

[src/subscription/index.ts:254](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L254)

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

[src/subscription/index.ts:225](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L225)

___

### groupableId

▸ **groupableId**(): ``null`` \| `string`

Calculates the groupable ID for this subscription.

#### Returns

``null`` \| `string`

The groupable ID, or null if the subscription is not groupable.

#### Defined in

[src/subscription/index.ts:119](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L119)

___

### start

▸ **start**(): `Promise`<`void`\>

Start the subscription. This is the main method that should be called
after creating a subscription.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/subscription/index.ts:156](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L156)

___

### stop

▸ **stop**(): `void`

#### Returns

`void`

#### Defined in

[src/subscription/index.ts:188](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L188)
