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

[src/subscription/index.ts:291](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L291)

## Properties

### filter

• `Readonly` **filter**: `Filter`

#### Inherited from

[NDKSubscription](NDKSubscription.md).[filter](NDKSubscription.md#filter)

#### Defined in

[src/subscription/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L81)

___

### ndk

• **ndk**: [`default`](default.md)

#### Inherited from

[NDKSubscription](NDKSubscription.md).[ndk](NDKSubscription.md#ndk)

#### Defined in

[src/subscription/index.ts:84](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L84)

___

### opts

• `Readonly` **opts**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

#### Inherited from

[NDKSubscription](NDKSubscription.md).[opts](NDKSubscription.md#opts)

#### Defined in

[src/subscription/index.ts:82](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L82)

___

### relaySet

• `Optional` **relaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Inherited from

[NDKSubscription](NDKSubscription.md).[relaySet](NDKSubscription.md#relayset)

#### Defined in

[src/subscription/index.ts:83](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L83)

___

### relaySubscriptions

• **relaySubscriptions**: `Map`<[`NDKRelay`](NDKRelay.md), `Sub`\>

#### Inherited from

[NDKSubscription](NDKSubscription.md).[relaySubscriptions](NDKSubscription.md#relaysubscriptions)

#### Defined in

[src/subscription/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L85)

___

### subId

• `Readonly` **subId**: `string`

#### Inherited from

[NDKSubscription](NDKSubscription.md).[subId](NDKSubscription.md#subid)

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

#### Inherited from

[NDKSubscription](NDKSubscription.md).[eoseReceived](NDKSubscription.md#eosereceived)

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

#### Inherited from

[NDKSubscription](NDKSubscription.md).[eventReceived](NDKSubscription.md#eventreceived)

#### Defined in

[src/subscription/index.ts:225](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L225)

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

[src/subscription/index.ts:119](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L119)

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

[src/subscription/index.ts:156](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L156)

___

### stop

▸ **stop**(): `void`

#### Returns

`void`

#### Inherited from

[NDKSubscription](NDKSubscription.md).[stop](NDKSubscription.md#stop)

#### Defined in

[src/subscription/index.ts:188](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/subscription/index.ts#L188)
