# Class: NDKSubscriptionGroup

Represents a group of subscriptions.

Events emitted from the group will be emitted from each subscription.

## Hierarchy

- [`NDKSubscription`](../wiki/NDKSubscription)

  ↳ **`NDKSubscriptionGroup`**

## Table of contents

### Constructors

- [constructor](../wiki/NDKSubscriptionGroup#constructor)

### Properties

- [eosesSeen](../wiki/NDKSubscriptionGroup#eosesseen)
- [eventFirstSeen](../wiki/NDKSubscriptionGroup#eventfirstseen)
- [eventsPerRelay](../wiki/NDKSubscriptionGroup#eventsperrelay)
- [filter](../wiki/NDKSubscriptionGroup#filter)
- [ndk](../wiki/NDKSubscriptionGroup#ndk)
- [opts](../wiki/NDKSubscriptionGroup#opts)
- [relaySet](../wiki/NDKSubscriptionGroup#relayset)
- [relaySubscriptions](../wiki/NDKSubscriptionGroup#relaysubscriptions)
- [subId](../wiki/NDKSubscriptionGroup#subid)

### Methods

- [eoseReceived](../wiki/NDKSubscriptionGroup#eosereceived)
- [eventReceived](../wiki/NDKSubscriptionGroup#eventreceived)
- [groupableId](../wiki/NDKSubscriptionGroup#groupableid)
- [start](../wiki/NDKSubscriptionGroup#start)
- [stop](../wiki/NDKSubscriptionGroup#stop)

## Constructors

### constructor

• **new NDKSubscriptionGroup**(`ndk`, `subscriptions`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk` | [`default`](../wiki/default) |
| `subscriptions` | [`NDKSubscription`](../wiki/NDKSubscription)[] |

#### Overrides

[NDKSubscription](../wiki/NDKSubscription).[constructor](../wiki/NDKSubscription#constructor)

#### Defined in

[src/subscription/index.ts:335](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L335)

## Properties

### eosesSeen

• **eosesSeen**: `Set`<[`NDKRelay`](../wiki/NDKRelay)\>

Relays that have sent an EOSE.

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[eosesSeen](../wiki/NDKSubscription#eosesseen)

#### Defined in

[src/subscription/index.ts:101](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L101)

___

### eventFirstSeen

• **eventFirstSeen**: `Map`<`string`, `number`\>

Events that have been seen by the subscription, with the time they were first seen.

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[eventFirstSeen](../wiki/NDKSubscription#eventfirstseen)

#### Defined in

[src/subscription/index.ts:96](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L96)

___

### eventsPerRelay

• **eventsPerRelay**: `Map`<[`NDKRelay`](../wiki/NDKRelay), `Set`<`string`\>\>

Events that have been seen by the subscription per relay.

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[eventsPerRelay](../wiki/NDKSubscription#eventsperrelay)

#### Defined in

[src/subscription/index.ts:106](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L106)

___

### filter

• `Readonly` **filter**: [`NDKFilter`](../wiki/Exports#ndkfilter)

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[filter](../wiki/NDKSubscription#filter)

#### Defined in

[src/subscription/index.ts:86](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L86)

___

### ndk

• **ndk**: [`default`](../wiki/default)

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[ndk](../wiki/NDKSubscription#ndk)

#### Defined in

[src/subscription/index.ts:89](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L89)

___

### opts

• `Readonly` **opts**: [`NDKSubscriptionOptions`](../wiki/NDKSubscriptionOptions)

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[opts](../wiki/NDKSubscription#opts)

#### Defined in

[src/subscription/index.ts:87](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L87)

___

### relaySet

• `Optional` **relaySet**: [`NDKRelaySet`](../wiki/NDKRelaySet)

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[relaySet](../wiki/NDKSubscription#relayset)

#### Defined in

[src/subscription/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L88)

___

### relaySubscriptions

• **relaySubscriptions**: `Map`<[`NDKRelay`](../wiki/NDKRelay), `Sub`\>

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[relaySubscriptions](../wiki/NDKSubscription#relaysubscriptions)

#### Defined in

[src/subscription/index.ts:90](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L90)

___

### subId

• `Readonly` **subId**: `string`

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[subId](../wiki/NDKSubscription#subid)

#### Defined in

[src/subscription/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L85)

## Methods

### eoseReceived

▸ **eoseReceived**(`relay`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `relay` | [`NDKRelay`](../wiki/NDKRelay) |

#### Returns

`void`

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[eoseReceived](../wiki/NDKSubscription#eosereceived)

#### Defined in

[src/subscription/index.ts:298](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L298)

___

### eventReceived

▸ **eventReceived**(`event`, `relay`, `fromCache?`): `void`

Called when an event is received from a relay or the cache

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `event` | [`NDKEvent`](../wiki/NDKEvent) | `undefined` |  |
| `relay` | `undefined` \| [`NDKRelay`](../wiki/NDKRelay) | `undefined` |  |
| `fromCache` | `boolean` | `false` | Whether the event was received from the cache |

#### Returns

`void`

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[eventReceived](../wiki/NDKSubscription#eventreceived)

#### Defined in

[src/subscription/index.ts:259](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L259)

___

### groupableId

▸ **groupableId**(): ``null`` \| `string`

Calculates the groupable ID for this subscription.

#### Returns

``null`` \| `string`

The groupable ID, or null if the subscription is not groupable.

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[groupableId](../wiki/NDKSubscription#groupableid)

#### Defined in

[src/subscription/index.ts:140](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L140)

___

### start

▸ **start**(): `Promise`<`void`\>

Start the subscription. This is the main method that should be called
after creating a subscription.

#### Returns

`Promise`<`void`\>

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[start](../wiki/NDKSubscription#start)

#### Defined in

[src/subscription/index.ts:195](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L195)

___

### stop

▸ **stop**(): `void`

#### Returns

`void`

#### Inherited from

[NDKSubscription](../wiki/NDKSubscription).[stop](../wiki/NDKSubscription#stop)

#### Defined in

[src/subscription/index.ts:222](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L222)
