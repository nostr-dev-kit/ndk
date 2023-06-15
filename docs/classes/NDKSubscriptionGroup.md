[NDK](../README.md) / [Exports](../modules.md) / NDKSubscriptionGroup

# Class: NDKSubscriptionGroup

Represents a group of subscriptions.

Events emitted from the group will be emitted from each subscription.

## Hierarchy

- [`NDKSubscription`](NDKSubscription.md)

  ↳ **`NDKSubscriptionGroup`**

## Table of contents

### Constructors

- [constructor](NDKSubscriptionGroup.md#constructor)

### Properties

- [eosesSeen](NDKSubscriptionGroup.md#eosesseen)
- [eventFirstSeen](NDKSubscriptionGroup.md#eventfirstseen)
- [eventsPerRelay](NDKSubscriptionGroup.md#eventsperrelay)
- [filter](NDKSubscriptionGroup.md#filter)
- [ndk](NDKSubscriptionGroup.md#ndk)
- [opts](NDKSubscriptionGroup.md#opts)
- [relaySet](NDKSubscriptionGroup.md#relayset)
- [relaySubscriptions](NDKSubscriptionGroup.md#relaysubscriptions)
- [subId](NDKSubscriptionGroup.md#subid)

### Methods

- [eoseReceived](NDKSubscriptionGroup.md#eosereceived)
- [eventReceived](NDKSubscriptionGroup.md#eventreceived)
- [groupableId](NDKSubscriptionGroup.md#groupableid)
- [start](NDKSubscriptionGroup.md#start)
- [stop](NDKSubscriptionGroup.md#stop)

## Constructors

### constructor

• **new NDKSubscriptionGroup**(`ndk`, `subscriptions`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk` | [`default`](default.md) |
| `subscriptions` | [`NDKSubscription`](NDKSubscription.md)[] |

#### Overrides

[NDKSubscription](NDKSubscription.md).[constructor](NDKSubscription.md#constructor)

#### Defined in

[src/subscription/index.ts:335](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L335)

## Properties

### eosesSeen

• **eosesSeen**: `Set`<[`NDKRelay`](NDKRelay.md)\>

Relays that have sent an EOSE.

#### Inherited from

[NDKSubscription](NDKSubscription.md).[eosesSeen](NDKSubscription.md#eosesseen)

#### Defined in

[src/subscription/index.ts:101](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L101)

___

### eventFirstSeen

• **eventFirstSeen**: `Map`<`string`, `number`\>

Events that have been seen by the subscription, with the time they were first seen.

#### Inherited from

[NDKSubscription](NDKSubscription.md).[eventFirstSeen](NDKSubscription.md#eventfirstseen)

#### Defined in

[src/subscription/index.ts:96](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L96)

___

### eventsPerRelay

• **eventsPerRelay**: `Map`<[`NDKRelay`](NDKRelay.md), `Set`<`string`\>\>

Events that have been seen by the subscription per relay.

#### Inherited from

[NDKSubscription](NDKSubscription.md).[eventsPerRelay](NDKSubscription.md#eventsperrelay)

#### Defined in

[src/subscription/index.ts:106](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L106)

___

### filter

• `Readonly` **filter**: [`NDKFilter`](../modules.md#ndkfilter)

#### Inherited from

[NDKSubscription](NDKSubscription.md).[filter](NDKSubscription.md#filter)

#### Defined in

[src/subscription/index.ts:86](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L86)

___

### ndk

• **ndk**: [`default`](default.md)

#### Inherited from

[NDKSubscription](NDKSubscription.md).[ndk](NDKSubscription.md#ndk)

#### Defined in

[src/subscription/index.ts:89](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L89)

___

### opts

• `Readonly` **opts**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

#### Inherited from

[NDKSubscription](NDKSubscription.md).[opts](NDKSubscription.md#opts)

#### Defined in

[src/subscription/index.ts:87](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L87)

___

### relaySet

• `Optional` **relaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Inherited from

[NDKSubscription](NDKSubscription.md).[relaySet](NDKSubscription.md#relayset)

#### Defined in

[src/subscription/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L88)

___

### relaySubscriptions

• **relaySubscriptions**: `Map`<[`NDKRelay`](NDKRelay.md), `Sub`\>

#### Inherited from

[NDKSubscription](NDKSubscription.md).[relaySubscriptions](NDKSubscription.md#relaysubscriptions)

#### Defined in

[src/subscription/index.ts:90](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L90)

___

### subId

• `Readonly` **subId**: `string`

#### Inherited from

[NDKSubscription](NDKSubscription.md).[subId](NDKSubscription.md#subid)

#### Defined in

[src/subscription/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L85)

## Methods

### eoseReceived

▸ **eoseReceived**(`relay`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `relay` | [`NDKRelay`](NDKRelay.md) |

#### Returns

`void`

#### Inherited from

[NDKSubscription](NDKSubscription.md).[eoseReceived](NDKSubscription.md#eosereceived)

#### Defined in

[src/subscription/index.ts:298](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L298)

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

#### Inherited from

[NDKSubscription](NDKSubscription.md).[eventReceived](NDKSubscription.md#eventreceived)

#### Defined in

[src/subscription/index.ts:259](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L259)

___

### groupableId

▸ **groupableId**(): ``null`` \| `string`

Calculates the groupable ID for this subscription.

#### Returns

``null`` \| `string`

The groupable ID, or null if the subscription is not groupable.

#### Inherited from

[NDKSubscription](NDKSubscription.md).[groupableId](NDKSubscription.md#groupableid)

#### Defined in

[src/subscription/index.ts:140](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L140)

___

### start

▸ **start**(): `Promise`<`void`\>

Start the subscription. This is the main method that should be called
after creating a subscription.

#### Returns

`Promise`<`void`\>

#### Inherited from

[NDKSubscription](NDKSubscription.md).[start](NDKSubscription.md#start)

#### Defined in

[src/subscription/index.ts:195](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L195)

___

### stop

▸ **stop**(): `void`

#### Returns

`void`

#### Inherited from

[NDKSubscription](NDKSubscription.md).[stop](NDKSubscription.md#stop)

#### Defined in

[src/subscription/index.ts:222](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L222)
