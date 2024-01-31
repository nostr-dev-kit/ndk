**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKRelay

# Class: NDKRelay

The NDKRelay class represents a connection to a relay.

## Emits

NDKRelay#connect

## Emits

NDKRelay#ready

## Emits

NDKRelay#disconnect

## Emits

NDKRelay#notice

## Emits

NDKRelay#event

## Emits

NDKRelay#published when an event is published to the relay

## Emits

NDKRelay#publish:failed when an event fails to publish to the relay

## Emits

NDKRelay#eose

## Emits

NDKRelay#auth when the relay requires authentication

## Extends

- `EventEmitter`

## Constructors

### new NDKRelay(url, authPolicy)

> **new NDKRelay**(`url`, `authPolicy`?): [`NDKRelay`](NDKRelay.md)

#### Parameters

• **url**: `string`

• **authPolicy?**: [`NDKAuthPolicy`](../type-aliases/NDKAuthPolicy.md)

#### Returns

[`NDKRelay`](NDKRelay.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/relay/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L81)

## Properties

### authPolicy?

> **authPolicy**?: [`NDKAuthPolicy`](../type-aliases/NDKAuthPolicy.md)

#### Source

[ndk/src/relay/index.ts:68](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L68)

***

### authRequired

> **authRequired**: `boolean` = `false`

#### Source

[ndk/src/relay/index.ts:69](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L69)

***

### complaining

> **complaining**: `boolean` = `false`

#### Source

[ndk/src/relay/index.ts:78](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L78)

***

### connectivity

> **connectivity**: `NDKRelayConnectivity`

#### Source

[ndk/src/relay/index.ts:65](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L65)

***

### debug

> **`readonly`** **debug**: `Debugger`

#### Source

[ndk/src/relay/index.ts:79](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L79)

***

### scores

> **`readonly`** **scores**: `Map`\<[`NDKUser`](NDKUser.md), `number`\>

#### Source

[ndk/src/relay/index.ts:64](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L64)

***

### trusted

> **trusted**: `boolean` = `false`

Whether this relay is trusted.

Trusted relay's events do not get their signature verified.

#### Source

[ndk/src/relay/index.ts:76](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L76)

***

### url

> **`readonly`** **url**: `string`

#### Source

[ndk/src/relay/index.ts:63](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L63)

## Accessors

### connectionStats

> **`get`** **connectionStats**(): [`NDKRelayConnectionStats`](../interfaces/NDKRelayConnectionStats.md)

#### Returns

[`NDKRelayConnectionStats`](../interfaces/NDKRelayConnectionStats.md)

#### Source

[ndk/src/relay/index.ts:96](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L96)

***

### status

> **`get`** **status**(): [`NDKRelayStatus`](../enumerations/NDKRelayStatus.md)

#### Returns

[`NDKRelayStatus`](../enumerations/NDKRelayStatus.md)

#### Source

[ndk/src/relay/index.ts:92](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L92)

## Methods

### activeSubscriptions()

> **activeSubscriptions**(): `Map`\<[`NDKFilter`](../type-aliases/NDKFilter.md)[], [`NDKSubscription`](NDKSubscription.md)[]\>

#### Returns

`Map`\<[`NDKFilter`](../type-aliases/NDKFilter.md)[], [`NDKSubscription`](NDKSubscription.md)[]\>

#### Source

[ndk/src/relay/index.ts:172](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L172)

***

### auth()

> **auth**(`event`): `Promise`\<`void`\>

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/relay/index.ts:143](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L143)

***

### connect()

> **connect**(): `Promise`\<`void`\>

Connects to the relay.

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/relay/index.ts:103](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L103)

***

### disconnect()

> **disconnect**(): `void`

Disconnects from the relay.

#### Returns

`void`

#### Source

[ndk/src/relay/index.ts:110](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L110)

***

### publish()

> **publish**(`event`, `timeoutMs`): `Promise`\<`boolean`\>

Publishes an event to the relay with an optional timeout.

If the relay is not connected, the event will be published when the relay connects,
unless the timeout is reached before the relay connects.

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

The event to publish

• **timeoutMs**: `number`= `2500`

The timeout for the publish operation in milliseconds

#### Returns

`Promise`\<`boolean`\>

A promise that resolves when the event has been published or rejects if the operation times out

#### Source

[ndk/src/relay/index.ts:139](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L139)

***

### referenceTags()

> **referenceTags**(): [`NDKTag`](../type-aliases/NDKTag.md)[]

#### Returns

[`NDKTag`](../type-aliases/NDKTag.md)[]

#### Source

[ndk/src/relay/index.ts:168](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L168)

***

### scoreSlowerEvent()

> **scoreSlowerEvent**(`timeDiffInMs`): `void`

Called when this relay has responded with an event but
wasn't the fastest one.

#### Parameters

• **timeDiffInMs**: `number`

The time difference in ms between the fastest and this relay in milliseconds

#### Returns

`void`

#### Source

[ndk/src/relay/index.ts:153](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L153)

***

### subscribe()

> **subscribe**(`subscription`, `filters`): `void`

Queues or executes the subscription of a specific set of filters
within this relay.

#### Parameters

• **subscription**: [`NDKSubscription`](NDKSubscription.md)

NDKSubscription this filters belong to.

• **filters**: [`NDKFilter`](../type-aliases/NDKFilter.md)[]

Filters to execute

#### Returns

`void`

#### Source

[ndk/src/relay/index.ts:125](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L125)

***

### ~~tagReference()~~

> **tagReference**(`marker`?): [`NDKTag`](../type-aliases/NDKTag.md)

#### Parameters

• **marker?**: `string`

#### Returns

[`NDKTag`](../type-aliases/NDKTag.md)

#### Deprecated

Use referenceTags instead.

#### Source

[ndk/src/relay/index.ts:158](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/index.ts#L158)
