**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKSubscription

# Class: NDKSubscription

Represents a subscription to an NDK event stream.

## Emits

event
Emitted when an event is received by the subscription.
* (\{NDKEvent\} event - The event received by the subscription,
* \{NDKRelay\} relay - The relay that received the event,
* \{NDKSubscription\} subscription - The subscription that received the event.)

## Emits

event:dup
Emitted when a duplicate event is received by the subscription.
* \{NDKEvent\} event - The duplicate event received by the subscription.
* \{NDKRelay\} relay - The relay that received the event.
* \{number\} timeSinceFirstSeen - The time elapsed since the first time the event was seen.
* \{NDKSubscription\} subscription - The subscription that received the event.

## Emits

eose - Emitted when all relays have reached the end of the event stream.
* \{NDKSubscription\} subscription - The subscription that received EOSE.

## Emits

close - Emitted when the subscription is closed.
* \{NDKSubscription\} subscription - The subscription that was closed.

## Example

```ts
const sub = ndk.subscribe({ kinds: [1] }); // Get all kind:1s
sub.on("event", (event) => console.log(event.content); // Show the content
sub.on("eose", () => console.log("All relays have reached the end of the event stream"));
sub.on("close", () => console.log("Subscription closed"));
setTimeout(() => sub.stop(), 10000); // Stop the subscription after 10 seconds
```

## Description

Subscriptions are created using [NDK.subscribe](default.md#subscribe).

# Event validation
By defaults, subscriptions will validate events to comply with the minimal requirement
of each known NIP.
This can be disabled by setting the `skipValidation` option to `true`.

## Example

```ts
const sub = ndk.subscribe({ kinds: [1] }, { skipValidation: false });
sub.on("event", (event) => console.log(event.content); // Only valid events will be received
```

## Extends

- `EventEmitter`

## Constructors

### new NDKSubscription(ndk, filters, opts, relaySet, subId)

> **new NDKSubscription**(`ndk`, `filters`, `opts`?, `relaySet`?, `subId`?): [`NDKSubscription`](NDKSubscription.md)

#### Parameters

• **ndk**: [`default`](default.md)

• **filters**: [`NDKFilter`](../type-aliases/NDKFilter.md)\<[`NDKKind`](../enumerations/NDKKind.md)\> \| [`NDKFilter`](../type-aliases/NDKFilter.md)\<[`NDKKind`](../enumerations/NDKKind.md)\>[]

• **opts?**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

• **relaySet?**: [`NDKRelaySet`](NDKRelaySet.md)

• **subId?**: `string`

#### Returns

[`NDKSubscription`](NDKSubscription.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/subscription/index.ts:188](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L188)

## Properties

### debug

> **debug**: `Debugger`

#### Source

[ndk/src/subscription/index.ts:162](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L162)

***

### eoseDebug

> **eoseDebug**: `Debugger`

#### Source

[ndk/src/subscription/index.ts:163](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L163)

***

### eosesSeen

> **eosesSeen**: `Set`\<[`NDKRelay`](NDKRelay.md)\>

Relays that have sent an EOSE.

#### Source

[ndk/src/subscription/index.ts:173](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L173)

***

### eventFirstSeen

> **eventFirstSeen**: `Map`\<`string`, `number`\>

Events that have been seen by the subscription, with the time they were first seen.

#### Source

[ndk/src/subscription/index.ts:168](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L168)

***

### eventsPerRelay

> **eventsPerRelay**: `Map`\<[`NDKRelay`](NDKRelay.md), `Set`\<`string`\>\>

Events that have been seen by the subscription per relay.

#### Source

[ndk/src/subscription/index.ts:178](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L178)

***

### filters

> **`readonly`** **filters**: [`NDKFilter`](../type-aliases/NDKFilter.md)\<[`NDKKind`](../enumerations/NDKKind.md)\>[]

#### Source

[ndk/src/subscription/index.ts:150](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L150)

***

### internalId

> **internalId**: `string`

#### Source

[ndk/src/subscription/index.ts:186](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L186)

***

### ndk

> **ndk**: [`default`](default.md)

#### Source

[ndk/src/subscription/index.ts:161](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L161)

***

### opts

> **`readonly`** **opts**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

#### Source

[ndk/src/subscription/index.ts:151](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L151)

***

### pool

> **`readonly`** **pool**: `NDKPool`

#### Source

[ndk/src/subscription/index.ts:152](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L152)

***

### relayFilters?

> **relayFilters**?: `Map`\<`string`, [`NDKFilter`](../type-aliases/NDKFilter.md)\<[`NDKKind`](../enumerations/NDKKind.md)\>[]\>

Tracks the filters as they are executed on each relay

#### Source

[ndk/src/subscription/index.ts:159](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L159)

***

### relaySet?

> **relaySet**?: [`NDKRelaySet`](NDKRelaySet.md)

#### Source

[ndk/src/subscription/index.ts:160](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L160)

***

### skipValidation

> **`readonly`** **skipValidation**: `boolean` = `false`

#### Source

[ndk/src/subscription/index.ts:154](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L154)

***

### skipVerification

> **`readonly`** **skipVerification**: `boolean` = `false`

#### Source

[ndk/src/subscription/index.ts:153](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L153)

***

### subId?

> **`readonly`** **subId**?: `string`

#### Source

[ndk/src/subscription/index.ts:149](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L149)

## Accessors

### filter

> **`get`** **filter**(): [`NDKFilter`](../type-aliases/NDKFilter.md)\<[`NDKKind`](../enumerations/NDKKind.md)\>

Provides access to the first filter of the subscription for
backwards compatibility.

#### Returns

[`NDKFilter`](../type-aliases/NDKFilter.md)\<[`NDKKind`](../enumerations/NDKKind.md)\>

#### Source

[ndk/src/subscription/index.ts:230](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L230)

## Methods

### eoseReceived()

> **eoseReceived**(`relay`): `void`

#### Parameters

• **relay**: [`NDKRelay`](NDKRelay.md)

#### Returns

`void`

#### Source

[ndk/src/subscription/index.ts:402](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L402)

***

### eventReceived()

> **eventReceived**(`event`, `relay`, `fromCache`): `void`

Called when an event is received from a relay or the cache

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

• **relay**: `undefined` \| [`NDKRelay`](NDKRelay.md)

• **fromCache**: `boolean`= `false`

Whether the event was received from the cache

#### Returns

`void`

#### Source

[ndk/src/subscription/index.ts:350](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L350)

***

### hasAuthorsFilter()

> **hasAuthorsFilter**(): `boolean`

#### Returns

`boolean`

Whether the subscription has an authors filter.

#### Source

[ndk/src/subscription/index.ts:299](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L299)

***

### isGroupable()

> **isGroupable**(): `boolean`

#### Returns

`boolean`

#### Source

[ndk/src/subscription/index.ts:234](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L234)

***

### start()

> **start**(): `Promise`\<`void`\>

Start the subscription. This is the main method that should be called
after creating a subscription.

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/subscription/index.ts:264](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L264)

***

### stop()

> **stop**(): `void`

#### Returns

`void`

#### Source

[ndk/src/subscription/index.ts:290](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L290)
