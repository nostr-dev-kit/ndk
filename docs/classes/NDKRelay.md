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

[src/relay/index.ts:63](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L63)

## Properties

### activeSubscriptions

• **activeSubscriptions**: `Set`<[`NDKSubscription`](NDKSubscription.md)\>

Active subscriptions this relay is connected to

#### Defined in

[src/relay/index.ts:61](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L61)

___

### complaining

• **complaining**: `boolean` = `false`

#### Defined in

[src/relay/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L56)

___

### scores

• `Readonly` **scores**: `Map`<[`NDKUser`](NDKUser.md), `number`\>

#### Defined in

[src/relay/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L51)

___

### url

• `Readonly` **url**: `string`

#### Defined in

[src/relay/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L50)

## Accessors

### connectionStats

• `get` **connectionStats**(): [`NDKRelayConnectionStats`](../interfaces/NDKRelayConnectionStats.md)

Returns the connection stats.

#### Returns

[`NDKRelayConnectionStats`](../interfaces/NDKRelayConnectionStats.md)

#### Defined in

[src/relay/index.ts:234](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L234)

___

### status

• `get` **status**(): [`NDKRelayStatus`](../enums/NDKRelayStatus.md)

#### Returns

[`NDKRelayStatus`](../enums/NDKRelayStatus.md)

#### Defined in

[src/relay/index.ts:121](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L121)

## Methods

### connect

▸ **connect**(): `Promise`<`void`\>

Connects to the relay.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:128](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L128)

___

### disconnect

▸ **disconnect**(): `void`

Disconnects from the relay.

#### Returns

`void`

#### Defined in

[src/relay/index.ts:139](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L139)

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

[src/relay/index.ts:144](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L144)

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

[src/relay/index.ts:191](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L191)

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

[src/relay/index.ts:202](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L202)

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

[src/relay/index.ts:164](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/index.ts#L164)
