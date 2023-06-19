# Class: NDKRelay

The NDKRelay class represents a connection to a relay.

**`Emits`**

NDKRelay#connect

**`Emits`**

NDKRelay#disconnect

**`Emits`**

NDKRelay#notice

**`Emits`**

NDKRelay#event

**`Emits`**

NDKRelay#eose

## Hierarchy

- `EventEmitter`

  ↳ **`NDKRelay`**

## Table of contents

### Constructors

- [constructor](../wiki/NDKRelay#constructor)

### Properties

- [activeSubscriptions](../wiki/NDKRelay#activesubscriptions)
- [complaining](../wiki/NDKRelay#complaining)
- [scores](../wiki/NDKRelay#scores)
- [url](../wiki/NDKRelay#url)

### Accessors

- [connectionStats](../wiki/NDKRelay#connectionstats)
- [status](../wiki/NDKRelay#status)

### Methods

- [connect](../wiki/NDKRelay#connect)
- [disconnect](../wiki/NDKRelay#disconnect)
- [handleNotice](../wiki/NDKRelay#handlenotice)
- [publish](../wiki/NDKRelay#publish)
- [scoreSlowerEvent](../wiki/NDKRelay#scoreslowerevent)
- [subscribe](../wiki/NDKRelay#subscribe)

## Constructors

### constructor

• **new NDKRelay**(`url`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/relay/index.ts:66](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L66)

## Properties

### activeSubscriptions

• **activeSubscriptions**: `Set`<[`NDKSubscription`](../wiki/NDKSubscription)\>

Active subscriptions this relay is connected to

#### Defined in

[src/relay/index.ts:64](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L64)

___

### complaining

• **complaining**: `boolean` = `false`

#### Defined in

[src/relay/index.ts:58](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L58)

___

### scores

• `Readonly` **scores**: `Map`<[`NDKUser`](../wiki/NDKUser), `number`\>

#### Defined in

[src/relay/index.ts:53](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L53)

___

### url

• `Readonly` **url**: `string`

#### Defined in

[src/relay/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L52)

## Accessors

### connectionStats

• `get` **connectionStats**(): [`NDKRelayConnectionStats`](../wiki/NDKRelayConnectionStats)

Returns the connection stats.

#### Returns

[`NDKRelayConnectionStats`](../wiki/NDKRelayConnectionStats)

#### Defined in

[src/relay/index.ts:265](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L265)

___

### status

• `get` **status**(): [`NDKRelayStatus`](../wiki/NDKRelayStatus)

#### Returns

[`NDKRelayStatus`](../wiki/NDKRelayStatus)

#### Defined in

[src/relay/index.ts:128](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L128)

## Methods

### connect

▸ **connect**(): `Promise`<`void`\>

Connects to the relay.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:135](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L135)

___

### disconnect

▸ **disconnect**(): `void`

Disconnects from the relay.

#### Returns

`void`

#### Defined in

[src/relay/index.ts:150](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L150)

___

### handleNotice

▸ **handleNotice**(`notice`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `notice` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:155](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L155)

___

### publish

▸ **publish**(`event`): `Promise`<`void`\>

Publishes an event to the relay.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](../wiki/NDKEvent) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:211](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L211)

___

### scoreSlowerEvent

▸ **scoreSlowerEvent**(`timeDiffInMs`): `void`

Called when this relay has responded with an event but
wasn't the fastest one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `timeDiffInMs` | `number` | The time difference in ms between the fastest and this relay in milliseconds |

#### Returns

`void`

#### Defined in

[src/relay/index.ts:231](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L231)

___

### subscribe

▸ **subscribe**(`subscription`): `Sub`

Subscribes to a subscription.

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscription` | [`NDKSubscription`](../wiki/NDKSubscription) |

#### Returns

`Sub`

#### Defined in

[src/relay/index.ts:175](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L175)
