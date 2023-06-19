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

  ↳↳ [`NDKSubscriptionGroup`](../wiki/NDKSubscriptionGroup)

## Table of contents

### Constructors

- [constructor](../wiki/NDKSubscription#constructor)

### Properties

- [eosesSeen](../wiki/NDKSubscription#eosesseen)
- [eventFirstSeen](../wiki/NDKSubscription#eventfirstseen)
- [eventsPerRelay](../wiki/NDKSubscription#eventsperrelay)
- [filter](../wiki/NDKSubscription#filter)
- [ndk](../wiki/NDKSubscription#ndk)
- [opts](../wiki/NDKSubscription#opts)
- [relaySet](../wiki/NDKSubscription#relayset)
- [relaySubscriptions](../wiki/NDKSubscription#relaysubscriptions)
- [subId](../wiki/NDKSubscription#subid)

### Methods

- [eoseReceived](../wiki/NDKSubscription#eosereceived)
- [eventReceived](../wiki/NDKSubscription#eventreceived)
- [groupableId](../wiki/NDKSubscription#groupableid)
- [start](../wiki/NDKSubscription#start)
- [stop](../wiki/NDKSubscription#stop)

## Constructors

### constructor

• **new NDKSubscription**(`ndk`, `filter`, `opts?`, `relaySet?`, `subId?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk` | [`default`](../wiki/default) |
| `filter` | [`NDKFilter`](../wiki/Exports#ndkfilter) |
| `opts?` | [`NDKSubscriptionOptions`](../wiki/NDKSubscriptionOptions) |
| `relaySet?` | [`NDKRelaySet`](../wiki/NDKRelaySet) |
| `subId?` | `string` |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/subscription/index.ts:108](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L108)

## Properties

### eosesSeen

• **eosesSeen**: `Set`<[`NDKRelay`](../wiki/NDKRelay)\>

Relays that have sent an EOSE.

#### Defined in

[src/subscription/index.ts:101](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L101)

___

### eventFirstSeen

• **eventFirstSeen**: `Map`<`string`, `number`\>

Events that have been seen by the subscription, with the time they were first seen.

#### Defined in

[src/subscription/index.ts:96](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L96)

___

### eventsPerRelay

• **eventsPerRelay**: `Map`<[`NDKRelay`](../wiki/NDKRelay), `Set`<`string`\>\>

Events that have been seen by the subscription per relay.

#### Defined in

[src/subscription/index.ts:106](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L106)

___

### filter

• `Readonly` **filter**: [`NDKFilter`](../wiki/Exports#ndkfilter)

#### Defined in

[src/subscription/index.ts:86](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L86)

___

### ndk

• **ndk**: [`default`](../wiki/default)

#### Defined in

[src/subscription/index.ts:89](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L89)

___

### opts

• `Readonly` **opts**: [`NDKSubscriptionOptions`](../wiki/NDKSubscriptionOptions)

#### Defined in

[src/subscription/index.ts:87](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L87)

___

### relaySet

• `Optional` **relaySet**: [`NDKRelaySet`](../wiki/NDKRelaySet)

#### Defined in

[src/subscription/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L88)

___

### relaySubscriptions

• **relaySubscriptions**: `Map`<[`NDKRelay`](../wiki/NDKRelay), `Sub`\>

#### Defined in

[src/subscription/index.ts:90](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L90)

___

### subId

• `Readonly` **subId**: `string`

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

#### Defined in

[src/subscription/index.ts:259](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L259)

___

### groupableId

▸ **groupableId**(): ``null`` \| `string`

Calculates the groupable ID for this subscription.

#### Returns

``null`` \| `string`

The groupable ID, or null if the subscription is not groupable.

#### Defined in

[src/subscription/index.ts:140](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L140)

___

### start

▸ **start**(): `Promise`<`void`\>

Start the subscription. This is the main method that should be called
after creating a subscription.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/subscription/index.ts:195](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L195)

___

### stop

▸ **stop**(): `void`

#### Returns

`void`

#### Defined in

[src/subscription/index.ts:222](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L222)
