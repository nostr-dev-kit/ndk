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

[src/relay/index.ts:57](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L57)

## Properties

### scores

• `Readonly` **scores**: `Map`<[`NDKUser`](NDKUser.md), `number`\>

#### Defined in

[src/relay/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L51)

___

### url

• `Readonly` **url**: `string`

#### Defined in

[src/relay/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L50)

## Accessors

### connectionStats

• `get` **connectionStats**(): `NDKRelayConnectionStats`

Returns the connection stats.

#### Returns

`NDKRelayConnectionStats`

#### Defined in

[src/relay/index.ts:212](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L212)

___

### status

• `get` **status**(): `NDKRelayStatus`

#### Returns

`NDKRelayStatus`

#### Defined in

[src/relay/index.ts:117](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L117)

## Methods

### connect

▸ **connect**(): `Promise`<`void`\>

Connects to the relay.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:124](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L124)

___

### disconnect

▸ **disconnect**(): `void`

Disconnects from the relay.

#### Returns

`void`

#### Defined in

[src/relay/index.ts:135](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L135)

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

[src/relay/index.ts:140](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L140)

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

[src/relay/index.ts:169](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L169)

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

[src/relay/index.ts:180](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L180)

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

[src/relay/index.ts:147](https://github.com/nostr-dev-kit/ndk/blob/e085a7c/src/relay/index.ts#L147)
