[NDK](../README.md) / [Exports](../modules.md) / NDKRelay

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

- [constructor](NDKRelay.md#constructor)

### Properties

- [activeSubscriptions](NDKRelay.md#activesubscriptions)
- [complaining](NDKRelay.md#complaining)
- [scores](NDKRelay.md#scores)
- [url](NDKRelay.md#url)

### Accessors

- [connectionStats](NDKRelay.md#connectionstats)
- [status](NDKRelay.md#status)

### Methods

- [connect](NDKRelay.md#connect)
- [disconnect](NDKRelay.md#disconnect)
- [handleNotice](NDKRelay.md#handlenotice)
- [publish](NDKRelay.md#publish)
- [scoreSlowerEvent](NDKRelay.md#scoreslowerevent)
- [subscribe](NDKRelay.md#subscribe)

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

[src/relay/index.ts:90](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L90)

## Properties

### activeSubscriptions

• **activeSubscriptions**: `Set`<[`NDKSubscription`](NDKSubscription.md)\>

Active subscriptions this relay is connected to

#### Defined in

[src/relay/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L88)

___

### complaining

• **complaining**: `boolean` = `false`

#### Defined in

[src/relay/index.ts:82](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L82)

___

### scores

• `Readonly` **scores**: `Map`<[`NDKUser`](NDKUser.md), `number`\>

#### Defined in

[src/relay/index.ts:77](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L77)

___

### url

• `Readonly` **url**: `string`

#### Defined in

[src/relay/index.ts:76](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L76)

## Accessors

### connectionStats

• `get` **connectionStats**(): [`NDKRelayConnectionStats`](../interfaces/NDKRelayConnectionStats.md)

Returns the connection stats.

#### Returns

[`NDKRelayConnectionStats`](../interfaces/NDKRelayConnectionStats.md)

#### Defined in

[src/relay/index.ts:289](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L289)

___

### status

• `get` **status**(): [`NDKRelayStatus`](../enums/NDKRelayStatus.md)

#### Returns

[`NDKRelayStatus`](../enums/NDKRelayStatus.md)

#### Defined in

[src/relay/index.ts:152](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L152)

## Methods

### connect

▸ **connect**(): `Promise`<`void`\>

Connects to the relay.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:159](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L159)

___

### disconnect

▸ **disconnect**(): `void`

Disconnects from the relay.

#### Returns

`void`

#### Defined in

[src/relay/index.ts:174](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L174)

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

[src/relay/index.ts:179](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L179)

___

### publish

▸ **publish**(`event`): `Promise`<`void`\>

Publishes an event to the relay.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:235](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L235)

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

[src/relay/index.ts:255](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L255)

___

### subscribe

▸ **subscribe**(`subscription`): `Sub`

Subscribes to a subscription.

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscription` | [`NDKSubscription`](NDKSubscription.md) |

#### Returns

`Sub`

#### Defined in

[src/relay/index.ts:199](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/relay/index.ts#L199)
